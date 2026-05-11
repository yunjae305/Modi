import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { OHLCVBar, Scenario, Trade } from '../types';

interface TradeState {
  scenario: Scenario | null;
  chartData: OHLCVBar[];
  currentDay: number;
  isFinished: boolean;
  cash: number;
  holdings: number;
  avgPrice: number;
  peakPortfolio: number;
  maxDrawdown: number;
  tradeHistory: Trade[];
  currentPrice: () => number;
  portfolioValue: () => number;
  profitRate: () => number;
  selectScenario: (scenario: Scenario) => void;
  initScenario: (scenario: Scenario, data: OHLCVBar[]) => void;
  nextDay: () => void;
  buy: (qty: number) => void;
  sell: (qty: number) => void;
  reset: () => void;
}

const initialState = {
  scenario: null,
  chartData: [],
  currentDay: 0,
  isFinished: false,
  cash: 0,
  holdings: 0,
  avgPrice: 0,
  peakPortfolio: 0,
  maxDrawdown: 0,
  tradeHistory: [],
};

export const useTradeStore = create<TradeState>()(
  devtools((set, get) => ({
    ...initialState,
    currentPrice: () => {
      const { chartData, currentDay } = get();
      return chartData[currentDay]?.close ?? 0;
    },
    portfolioValue: () => {
      const { cash, holdings } = get();
      return cash + holdings * get().currentPrice();
    },
    profitRate: () => {
      const { scenario } = get();
      if (!scenario) {
        return 0;
      }
      return (get().portfolioValue() - scenario.initialCash) / scenario.initialCash;
    },
    selectScenario: (scenario) => {
      set(
        {
          ...initialState,
          scenario,
          cash: scenario.initialCash,
          peakPortfolio: scenario.initialCash,
        },
        false,
        'trade/selectScenario',
      );
    },
    initScenario: (scenario, data) => {
      set(
        {
          ...initialState,
          scenario,
          chartData: data,
          cash: scenario.initialCash,
          peakPortfolio: scenario.initialCash,
        },
        false,
        'trade/initScenario',
      );
    },
    nextDay: () => {
      const state = get();
      if (!state.chartData.length || state.isFinished) {
        return;
      }
      if (state.currentDay >= state.chartData.length - 1) {
        set({ isFinished: true }, false, 'trade/finish');
        return;
      }
      const currentDay = state.currentDay + 1;
      const currentPrice = state.chartData[currentDay]?.close ?? 0;
      const portfolioValue = state.cash + state.holdings * currentPrice;
      const peakPortfolio = Math.max(state.peakPortfolio, portfolioValue);
      const drawdown = peakPortfolio === 0 ? 0 : (portfolioValue - peakPortfolio) / peakPortfolio;
      set(
        {
          currentDay,
          peakPortfolio,
          maxDrawdown: Math.min(state.maxDrawdown, drawdown),
        },
        false,
        'trade/nextDay',
      );
    },
    buy: (qty) => {
      const state = get();
      const price = get().currentPrice();
      const orderQty = Math.floor(qty);
      if (orderQty <= 0 || price <= 0) {
        return;
      }
      const adjustedQty = Math.min(orderQty, Math.floor(state.cash / price));
      if (adjustedQty === 0) {
        return;
      }
      const totalAmount = adjustedQty * price;
      const holdings = state.holdings + adjustedQty;
      const avgPrice = (state.avgPrice * state.holdings + totalAmount) / holdings;
      const trade: Trade = {
        day: state.currentDay,
        date: state.chartData[state.currentDay]?.date ?? '',
        type: 'buy',
        qty: adjustedQty,
        price,
        totalAmount,
      };
      set(
        {
          cash: state.cash - totalAmount,
          holdings,
          avgPrice,
          tradeHistory: [...state.tradeHistory, trade],
        },
        false,
        'trade/buy',
      );
    },
    sell: (qty) => {
      const state = get();
      const price = get().currentPrice();
      const orderQty = Math.floor(qty);
      if (orderQty <= 0 || price <= 0 || state.holdings <= 0) {
        return;
      }
      const adjustedQty = Math.min(orderQty, state.holdings);
      const totalAmount = adjustedQty * price;
      const holdings = state.holdings - adjustedQty;
      const trade: Trade = {
        day: state.currentDay,
        date: state.chartData[state.currentDay]?.date ?? '',
        type: 'sell',
        qty: adjustedQty,
        price,
        totalAmount,
      };
      set(
        {
          cash: state.cash + totalAmount,
          holdings,
          avgPrice: holdings === 0 ? 0 : state.avgPrice,
          tradeHistory: [...state.tradeHistory, trade],
        },
        false,
        'trade/sell',
      );
    },
    reset: () => {
      set(initialState, false, 'trade/reset');
    },
  })),
);
