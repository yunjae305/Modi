import { optionalEnv, requiredEnv } from './env.ts';
import { eq, selectOne, upsertRows } from './supabase.ts';

interface StockSeed {
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

interface TokenRow {
  id: string;
  access_token: string;
  expires_at: string;
}

export function hasKisConfig() {
  return Boolean(optionalEnv('KIS_APP_KEY') && optionalEnv('KIS_APP_SECRET'));
}

export async function syncLatestPricesIfNeeded(stocks: StockSeed[], force = false) {
  if (!hasKisConfig()) {
    return { synced: false, reason: 'missing_kis_config' };
  }
  const latest = await selectOne<PriceRow>('latest_prices', '?select=*&order=updated_at.desc&limit=1');
  const interval = Number(optionalEnv('KIS_SYNC_INTERVAL_MS', '15000'));
  if (!force && latest && Date.now() - new Date(latest.updated_at).getTime() < interval) {
    return { synced: false, reason: 'fresh' };
  }
  const token = await getKisToken();
  const rows = [];
  for (const stock of stocks.filter((item) => item.enabled)) {
    const price = await fetchCurrentPrice(stock.id, token);
    if (price) {
      rows.push(price);
    }
  }
  if (rows.length > 0) {
    await upsertRows('latest_prices', rows, 'stock_id');
  }
  return { synced: rows.length > 0, count: rows.length };
}

async function getKisToken() {
  const saved = await selectOne<TokenRow>('kis_tokens', `?select=*&id=eq.${eq('default')}`);
  if (saved && new Date(saved.expires_at).getTime() > Date.now() + 60000) {
    return saved.access_token;
  }
  const response = await fetch(`${kisBaseUrl()}/oauth2/tokenP`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      appkey: requiredEnv('KIS_APP_KEY'),
      appsecret: requiredEnv('KIS_APP_SECRET'),
    }),
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.msg1 ?? body.error_description ?? 'KIS 토큰 발급에 실패했습니다.');
  }
  const expiresIn = Number(body.expires_in ?? 86400);
  const expiresAt = new Date(Date.now() + Math.max(60, expiresIn - 60) * 1000).toISOString();
  await upsertRows('kis_tokens', [{
    id: 'default',
    access_token: body.access_token,
    expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  }], 'id');
  return String(body.access_token);
}

async function fetchCurrentPrice(stockId: string, token: string) {
  const url = new URL(`${kisBaseUrl()}/uapi/domestic-stock/v1/quotations/inquire-price`);
  url.searchParams.set('FID_COND_MRKT_DIV_CODE', 'J');
  url.searchParams.set('FID_INPUT_ISCD', stockId);
  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${token}`,
      appkey: requiredEnv('KIS_APP_KEY'),
      appsecret: requiredEnv('KIS_APP_SECRET'),
      tr_id: 'FHKST01010100',
    },
  });
  const body = await response.json();
  if (!response.ok || !body.output) {
    return null;
  }
  const output = body.output;
  const currentPrice = numberValue(output.stck_prpr);
  const changeAmount = numberValue(output.prdy_vrss);
  const previousClose = currentPrice - changeAmount;
  return {
    stock_id: stockId,
    current_price: currentPrice,
    previous_close: previousClose > 0 ? previousClose : currentPrice,
    change_rate: numberValue(output.prdy_ctrt) / 100,
    volume: numberValue(output.acml_vol),
    source: 'kis',
    updated_at: new Date().toISOString(),
  };
}

function kisBaseUrl() {
  return optionalEnv('KIS_BASE_URL', 'https://openapi.koreainvestment.com:9443').replace(/\/$/, '');
}

function numberValue(value: unknown) {
  const parsed = Number(String(value ?? '0').replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}
