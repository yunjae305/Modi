import { eq, insertRow, patchRows, selectRows, upsertRows } from './supabase';
import { syncLatestPricesIfNeeded } from './kis';
import type { UserRow } from './auth';

interface StockRow {
  id: string;
  name: string;
  market: string;
  fallback_price: number;
  previous_close: number;
  image_url: string | null;
  enabled: boolean;
}

interface PriceRow {
  stock_id: string;
  current_price: number;
  previous_close: number;
  change_rate: number;
  volume: number;
  source: string;
  updated_at: string;
}

interface PositionRow {
  id: string;
  user_id: string;
  stock_id: string;
  quantity: number;
  average_price: number;
}

interface ExecutionRow {
  id: string;
  user_id: string;
  stock_id: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total_amount: number;
  executed_at: string;
}

const sellNetRateNumerator = 99685;
const sellNetRateDenominator = 100000;

export async function listStocks(sync = true) {
  await ensureSeedRows();
  const stocks = await stockRows();
  if (sync) {
    await syncLatestPricesIfNeeded(stocks).catch(() => null);
  }
  const prices = await priceMap();
  return stocks.map((stock) => stockItem(stock, prices.get(stock.id)));
}

export async function portfolio(user: UserRow) {
  const [positions, stocks, prices] = await Promise.all([
    selectRows<PositionRow>('positions', `?select=*&user_id=eq.${eq(user.id)}`),
    stockRows(),
    priceMap(),
  ]);
  const stockMap = new Map(stocks.map((stock) => [stock.id, stock]));
  const items = positions
    .filter((position) => Number(position.quantity) > 0)
    .map((position) => positionItem(position, stockMap.get(position.stock_id), prices.get(position.stock_id)))
    .filter((item): item is NonNullable<typeof item> => item !== null);
  const stockValue = items.reduce((sum, item) => sum + item.evaluationAmount, 0);
  const totalAsset = Number(user.cash) + stockValue;
  return {
    userId: user.id,
    seedMoney: Number(user.seed_money),
    cash: Number(user.cash),
    stockValue,
    totalAsset,
    profitAmount: totalAsset - Number(user.seed_money),
    profitRate: Number(user.seed_money) === 0 ? 0 : (totalAsset - Number(user.seed_money)) / Number(user.seed_money),
    positions: items,
  };
}

export async function executions(user: UserRow) {
  const [rows, stocks] = await Promise.all([
    selectRows<ExecutionRow>('executions', `?select=*&user_id=eq.${eq(user.id)}&order=executed_at.desc`),
    stockRows(),
  ]);
  const stockMap = new Map(stocks.map((stock) => [stock.id, stock]));
  return rows.map((row) => ({
    id: row.id,
    stockId: row.stock_id,
    stockName: stockMap.get(row.stock_id)?.name ?? row.stock_id,
    side: row.side,
    quantity: Number(row.quantity),
    price: Number(row.price),
    totalAmount: Number(row.total_amount),
    executedAt: row.executed_at,
  }));
}

export async function buy(user: UserRow, stockId: string, requestedQuantity: number) {
  validateQuantity(requestedQuantity);
  const price = await currentPrice(stockId);
  const filledQuantity = Math.min(requestedQuantity, Math.floor(Number(user.cash) / price));
  if (filledQuantity <= 0) {
    throw new Error('예수금이 부족합니다.');
  }
  const totalAmount = filledQuantity * price;
  const position = await positionFor(user.id, stockId);
  const quantity = Number(position?.quantity ?? 0);
  const averagePrice = Number(position?.average_price ?? 0);
  const nextQuantity = quantity + filledQuantity;
  const nextAveragePrice = Math.floor((averagePrice * quantity + price * filledQuantity) / nextQuantity);
  await updateCash(user.id, Number(user.cash) - totalAmount);
  await savePosition(user.id, stockId, nextQuantity, nextAveragePrice);
  await insertExecution(user.id, stockId, 'BUY', filledQuantity, price, totalAmount);
  return orderResult(stockId, 'BUY', requestedQuantity, filledQuantity, price, totalAmount, Number(user.cash) - totalAmount);
}

export async function sell(user: UserRow, stockId: string, requestedQuantity: number) {
  validateQuantity(requestedQuantity);
  const position = await positionFor(user.id, stockId);
  if (!position || Number(position.quantity) <= 0) {
    throw new Error('보유 수량이 없습니다.');
  }
  const price = await currentPrice(stockId);
  const filledQuantity = Math.min(requestedQuantity, Number(position.quantity));
  const grossAmount = filledQuantity * price;
  const totalAmount = Math.floor(grossAmount * sellNetRateNumerator / sellNetRateDenominator);
  const nextQuantity = Number(position.quantity) - filledQuantity;
  await updateCash(user.id, Number(user.cash) + totalAmount);
  await savePosition(user.id, stockId, nextQuantity, nextQuantity === 0 ? 0 : Number(position.average_price));
  await insertExecution(user.id, stockId, 'SELL', filledQuantity, price, totalAmount);
  return orderResult(stockId, 'SELL', requestedQuantity, filledQuantity, price, totalAmount, Number(user.cash) + totalAmount);
}

export async function rankings() {
  const users = await selectRows<UserRow>('users', '?select=*');
  const summaries = await Promise.all(users.map(async (user) => {
    const summary = await portfolio(user);
    return {
      nickname: user.nickname,
      profileImage: user.profile_image,
      totalAsset: summary.totalAsset,
      profitRate: summary.profitRate,
    };
  }));
  return summaries
    .sort((left, right) => right.totalAsset - left.totalAsset)
    .map((item, index) => ({ rank: index + 1, ...item }));
}

export async function forceSyncPrices() {
  await ensureSeedRows();
  const stocks = await stockRows();
  return syncLatestPricesIfNeeded(stocks, true);
}

async function currentPrice(stockId: string) {
  const stocks = await listStocks(false);
  const stock = stocks.find((item) => item.id === stockId);
  if (!stock) {
    throw new Error('종목을 찾을 수 없습니다.');
  }
  return Number(stock.currentPrice);
}

async function stockRows() {
  return selectRows<StockRow>('stocks', '?select=*&enabled=eq.true&order=id.asc');
}

async function priceMap() {
  const prices = await selectRows<PriceRow>('latest_prices', '?select=*');
  return new Map(prices.map((price) => [price.stock_id, price]));
}

async function positionFor(userId: string, stockId: string) {
  const rows = await selectRows<PositionRow>('positions', `?select=*&user_id=eq.${eq(userId)}&stock_id=eq.${eq(stockId)}&limit=1`);
  return rows[0] ?? null;
}

async function updateCash(userId: string, cash: number) {
  await patchRows('users', `?id=eq.${eq(userId)}`, { cash });
}

async function savePosition(userId: string, stockId: string, quantity: number, averagePrice: number) {
  await upsertRows('positions', [{
    user_id: userId,
    stock_id: stockId,
    quantity,
    average_price: averagePrice,
    updated_at: new Date().toISOString(),
  }], 'user_id,stock_id');
}

async function insertExecution(userId: string, stockId: string, side: 'BUY' | 'SELL', quantity: number, price: number, totalAmount: number) {
  await insertRow('executions', {
    user_id: userId,
    stock_id: stockId,
    side,
    quantity,
    price,
    total_amount: totalAmount,
  });
}

async function ensureSeedRows() {
  const rows = await selectRows<StockRow>('stocks', '?select=*&limit=1');
  if (rows.length > 0) {
    return;
  }
  await upsertRows('stocks', seedStocks.map((stock) => ({
    id: stock.id,
    name: stock.name,
    market: stock.market,
    fallback_price: stock.fallbackPrice,
    previous_close: stock.previousClose,
    image_url: stock.imageUrl,
    enabled: true,
  })), 'id');
  await upsertRows('latest_prices', seedStocks.map((stock) => ({
    stock_id: stock.id,
    current_price: stock.fallbackPrice,
    previous_close: stock.previousClose,
    change_rate: stock.previousClose === 0 ? 0 : (stock.fallbackPrice - stock.previousClose) / stock.previousClose,
    volume: 0,
    source: 'seed',
    updated_at: new Date().toISOString(),
  })), 'stock_id');
}

function stockItem(stock: StockRow, price?: PriceRow) {
  const currentPrice = Number(price?.current_price ?? stock.fallback_price);
  const previousClose = Number(price?.previous_close ?? stock.previous_close);
  return {
    id: stock.id,
    name: stock.name,
    market: stock.market,
    currentPrice,
    previousClose,
    changeRate: price ? Number(price.change_rate) : previousClose === 0 ? 0 : (currentPrice - previousClose) / previousClose,
    imageUrl: stock.image_url,
  };
}

function positionItem(position: PositionRow, stock?: StockRow, price?: PriceRow) {
  if (!stock) {
    return null;
  }
  const current = stockItem(stock, price).currentPrice;
  const quantity = Number(position.quantity);
  const averagePrice = Number(position.average_price);
  const evaluationAmount = current * quantity;
  return {
    stockId: stock.id,
    stockName: stock.name,
    quantity,
    averagePrice,
    currentPrice: current,
    evaluationAmount,
    profitAmount: (current - averagePrice) * quantity,
    profitRate: averagePrice === 0 ? 0 : (current - averagePrice) / averagePrice,
  };
}

function validateQuantity(quantity: number) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('주문 수량은 1주 이상이어야 합니다.');
  }
}

function orderResult(stockId: string, side: 'BUY' | 'SELL', requestedQuantity: number, filledQuantity: number, price: number, totalAmount: number, cash: number) {
  return {
    stockId,
    side,
    requestedQuantity,
    filledQuantity,
    price,
    totalAmount,
    cash,
  };
}

const seedStocks = [
  { id: '005930', name: '삼성전자', market: 'KOSPI', fallbackPrice: 67500, previousClose: 68400, imageUrl: 'https://file.alphasquare.co.kr/media/images/stock_logo/kr/005930.png' },
  { id: '000660', name: 'SK하이닉스', market: 'KOSPI', fallbackPrice: 114700, previousClose: 112000, imageUrl: 'https://file.alphasquare.co.kr/media/images/stock_logo/kr/000660.png' },
  { id: '035420', name: 'NAVER', market: 'KOSPI', fallbackPrice: 190900, previousClose: 188000, imageUrl: 'https://file.alphasquare.co.kr/media/images/stock_logo/kr/035420.png' },
  { id: '035720', name: '카카오', market: 'KOSPI', fallbackPrice: 41700, previousClose: 42100, imageUrl: 'https://file.alphasquare.co.kr/media/images/stock_logo/kr/035720.png' },
  { id: '005380', name: '현대차', market: 'KOSPI', fallbackPrice: 191000, previousClose: 189500, imageUrl: 'https://file.alphasquare.co.kr/media/images/stock_logo/kr/005380.png' },
  { id: '005490', name: 'POSCO홀딩스', market: 'KOSPI', fallbackPrice: 527000, previousClose: 511000, imageUrl: 'https://file.alphasquare.co.kr/media/images/stock_logo/kr/005490.png' },
  { id: '000080', name: '하이트진로', market: 'KOSPI', fallbackPrice: 19660, previousClose: 18890, imageUrl: 'https://file.alphasquare.co.kr/media/images/stock_logo/kr/000080.png' },
  { id: '015760', name: '한국전력', market: 'KOSPI', fallbackPrice: 17570, previousClose: 17500, imageUrl: 'https://file.alphasquare.co.kr/media/images/stock_logo/kr/015760.png' },
];
