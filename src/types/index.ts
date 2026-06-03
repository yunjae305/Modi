export interface OHLCVBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Scenario {
  id: 'corona' | 'subprime' | 'dotcom' | 'practice';
  title: string;
  subtitle: string;
  dataFile: string;
  market: string;
  period: string;
  lesson: string;
  initialCash: number;
  revealText: string;
}

export interface ScenarioStock {
  id: string;
  name: string;
  market: string;
  bars: OHLCVBar[];
}

export type MarketSpeed = 1 | 2 | 4;

export interface Trade {
  day: number;
  date: string;
  stockId: string;
  stockName: string;
  type: 'buy' | 'sell';
  qty: number;
  price: number;
  totalAmount: number;
}

export interface ScenarioPosition {
  stockId: string;
  stockName: string;
  quantity: number;
  averagePrice: number;
}

export type InvestorType = 'lion' | 'turtle' | 'rabbit' | 'monkey';

export interface ResultRecord {
  id: string;
  scenarioId: Scenario['id'];
  finalAsset: number;
  profitRate: number;
  maxDrawdown: number;
  tradeCount: number;
  investorType: InvestorType;
  createdAt: string;
}

export interface SaveResultRecordInput {
  scenarioId: Scenario['id'];
  finalAsset: number;
  profitRate: number;
  maxDrawdown: number;
  tradeCount: number;
  investorType: InvestorType;
}
