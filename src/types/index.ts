export interface OHLCVBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Scenario {
  id: 'corona' | 'subprime' | 'dotcom';
  title: string;
  subtitle: string;
  dataFile: string;
  market: string;
  period: string;
  lesson: string;
  initialCash: number;
  revealText: string;
}

export interface Trade {
  day: number;
  date: string;
  type: 'buy' | 'sell';
  qty: number;
  price: number;
  totalAmount: number;
}

export type InvestorType = 'lion' | 'turtle' | 'rabbit' | 'monkey';
