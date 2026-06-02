export type OrderSide = 'BUY' | 'SELL';

export interface StockItem {
  id: string;
  name: string;
  market: string;
  currentPrice: number;
  previousClose: number;
  changeRate: number;
  imageUrl?: string | null;
}

export interface PositionItem {
  stockId: string;
  stockName: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  evaluationAmount: number;
  profitAmount: number;
  profitRate: number;
}

export interface PortfolioSummary {
  userId: string;
  seedMoney: number;
  cash: number;
  stockValue: number;
  totalAsset: number;
  profitAmount: number;
  profitRate: number;
  positions: PositionItem[];
}

export interface ExecutionItem {
  id: number;
  stockId: string;
  stockName: string;
  side: OrderSide;
  quantity: number;
  price: number;
  totalAmount: number;
  executedAt: string;
}

export interface OrderResult {
  stockId: string;
  side: OrderSide;
  requestedQuantity: number;
  filledQuantity: number;
  price: number;
  totalAmount: number;
  cash: number;
}

export interface RankingItem {
  rank: number;
  nickname: string;
  profileImage?: string | null;
  totalAsset: number;
  profitRate: number;
}

export interface ScenarioRankingItem {
  rank: number;
  nickname: string;
  profitRate: number;
  scenarioId: string;
  scenarioTitle: string;
}
