import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { MarketSpeed, OHLCVBar, Scenario, ScenarioPosition, ScenarioStock, Trade } from '../types';
import { getDayDurationMs, getStockPriceAtProgress } from '../utils/marketTime.ts';

interface TradeState {
  scenario: Scenario | null;
  scenarioStocks: ScenarioStock[];
  selectedStockId: string;
  chartData: OHLCVBar[];
  currentDay: number;
  dayProgress: number;
  marketSpeed: MarketSpeed;
  isPlaying: boolean;
  isFinished: boolean;
  cash: number;
  holdings: number;
  avgPrice: number;
  positions: Record<string, ScenarioPosition>;
  peakPortfolio: number;
  maxDrawdown: number;
  tradeHistory: Trade[];
  selectedStock: () => ScenarioStock | null;
  selectedPosition: () => ScenarioPosition | null;
  positionList: () => ScenarioPosition[];
  currentPrice: (stockId?: string) => number;
  portfolioValue: () => number;
  profitRate: () => number;
  selectScenario: (scenario: Scenario) => void;
  initScenario: (scenario: Scenario, data: ScenarioStock[]) => void;
  selectStock: (stockId: string) => void;
  setMarketSpeed: (speed: MarketSpeed) => void;
  togglePlaying: () => void;
  tick: (elapsedMs: number) => void;
  nextDay: () => void;
  buy: (qty: number) => void;
  sell: (qty: number) => void;
  reset: () => void;
}

const initialState = {
  scenario: null,
  scenarioStocks: [],
  selectedStockId: '',
  chartData: [],
  currentDay: 0,
  dayProgress: 0,
  marketSpeed: 1 as MarketSpeed,
  isPlaying: false,
  isFinished: false,
  cash: 0,
  holdings: 0,
  avgPrice: 0,
  positions: {},
  peakPortfolio: 0,
  maxDrawdown: 0,
  tradeHistory: [],
};

export const useTradeStore = create<TradeState>()(
  devtools((set, get) => ({
    ...initialState,
    selectedStock: () => {
      const { scenarioStocks, selectedStockId } = get();
      return scenarioStocks.find((stock) => stock.id === selectedStockId) ?? scenarioStocks[0] ?? null;
    },
    selectedPosition: () => {
      const stock = get().selectedStock();
      return stock ? get().positions[stock.id] ?? null : null;
    },
    positionList: () => Object.values(get().positions),
    currentPrice: (stockId) => {
      const { scenarioStocks, selectedStockId, currentDay, dayProgress } = get();
      const targetId = stockId ?? selectedStockId;
      const stock = scenarioStocks.find((item) => item.id === targetId) ?? scenarioStocks[0];
      return getStockPriceAtProgress(stock, currentDay, dayProgress);
    },
    portfolioValue: () => {
      const state = get();
      return Object.values(state.positions).reduce(
        (total, position) => total + position.quantity * state.currentPrice(position.stockId),
        state.cash,
      );
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
      const selectedStock = data[0] ?? null;
      set(
        {
          ...initialState,
          scenario,
          scenarioStocks: data,
          selectedStockId: selectedStock?.id ?? '',
          chartData: selectedStock?.bars ?? [],
          isPlaying: data.length > 0,
          cash: scenario.initialCash,
          peakPortfolio: scenario.initialCash,
        },
        false,
        'trade/initScenario',
      );
    },
    selectStock: (stockId) => {
      const state = get();
      const stock = state.scenarioStocks.find((item) => item.id === stockId);
      if (!stock) {
        return;
      }
      const position = state.positions[stock.id];
      set(
        {
          selectedStockId: stock.id,
          chartData: stock.bars,
          holdings: position?.quantity ?? 0,
          avgPrice: position?.averagePrice ?? 0,
        },
        false,
        'trade/selectStock',
      );
    },
    setMarketSpeed: (speed) => {
      set({ marketSpeed: speed }, false, 'trade/setMarketSpeed');
    },
    togglePlaying: () => {
      const state = get();
      if (!state.scenarioStocks.length || state.isFinished) {
        return;
      }
      set({ isPlaying: !state.isPlaying }, false, 'trade/togglePlaying');
    },
    tick: (elapsedMs) => {
      const state = get();
      if (!state.isPlaying || !state.scenarioStocks.length || state.isFinished || elapsedMs <= 0) {
        return;
      }
      const duration = getDayDurationMs(state.marketSpeed);
      let currentDay = state.currentDay;
      let dayProgress = state.dayProgress + elapsedMs / duration;
      let isFinished: boolean = state.isFinished;
      const lastDayIndex = getLastDayIndex(state.scenarioStocks);
      while (dayProgress >= 1 && !isFinished) {
        if (currentDay >= lastDayIndex) {
          isFinished = true;
          dayProgress = 1;
        } else {
          currentDay += 1;
          dayProgress -= 1;
        }
      }
      const portfolioValue = getPortfolioValueAt(state.cash, state.positions, state.scenarioStocks, currentDay, dayProgress);
      const peakPortfolio = Math.max(state.peakPortfolio, portfolioValue);
      const drawdown = peakPortfolio === 0 ? 0 : (portfolioValue - peakPortfolio) / peakPortfolio;
      set(
        {
          currentDay,
          dayProgress,
          isFinished,
          isPlaying: !isFinished,
          peakPortfolio,
          maxDrawdown: Math.min(state.maxDrawdown, drawdown),
        },
        false,
        'trade/tick',
      );
    },
    nextDay: () => {
      const state = get();
      if (!state.scenarioStocks.length || state.isFinished) {
        return;
      }
      const lastDayIndex = getLastDayIndex(state.scenarioStocks);
      if (state.currentDay >= lastDayIndex) {
        set({ isFinished: true, isPlaying: false, dayProgress: 1 }, false, 'trade/finish');
        return;
      }
      const currentDay = state.currentDay + 1;
      const dayProgress = 0;
      const portfolioValue = getPortfolioValueAt(state.cash, state.positions, state.scenarioStocks, currentDay, dayProgress);
      const peakPortfolio = Math.max(state.peakPortfolio, portfolioValue);
      const drawdown = peakPortfolio === 0 ? 0 : (portfolioValue - peakPortfolio) / peakPortfolio;
      set(
        {
          currentDay,
          dayProgress,
          peakPortfolio,
          maxDrawdown: Math.min(state.maxDrawdown, drawdown),
        },
        false,
        'trade/nextDay',
      );
    },
    buy: (qty) => {
      const state = get();
      const stock = get().selectedStock();
      const price = get().currentPrice();
      const orderQty = Math.floor(qty);
      if (!stock || orderQty <= 0 || price <= 0) {
        return;
      }
      const adjustedQty = Math.min(orderQty, Math.floor(state.cash / price));
      if (adjustedQty === 0) {
        return;
      }
      const totalAmount = adjustedQty * price;
      const previousPosition = state.positions[stock.id];
      const quantity = (previousPosition?.quantity ?? 0) + adjustedQty;
      const averagePrice = ((previousPosition?.averagePrice ?? 0) * (previousPosition?.quantity ?? 0) + totalAmount) / quantity;
      const position: ScenarioPosition = {
        stockId: stock.id,
        stockName: stock.name,
        quantity,
        averagePrice,
      };
      const trade: Trade = {
        day: state.currentDay,
        date: stock.bars[state.currentDay]?.date ?? '',
        stockId: stock.id,
        stockName: stock.name,
        type: 'buy',
        qty: adjustedQty,
        price,
        totalAmount,
      };
      set(
        {
          cash: state.cash - totalAmount,
          holdings: position.quantity,
          avgPrice: position.averagePrice,
          positions: { ...state.positions, [stock.id]: position },
          tradeHistory: [...state.tradeHistory, trade],
        },
        false,
        'trade/buy',
      );
    },
    sell: (qty) => {
      const state = get();
      const stock = get().selectedStock();
      const price = get().currentPrice();
      const orderQty = Math.floor(qty);
      const previousPosition = stock ? state.positions[stock.id] : undefined;
      if (!stock || !previousPosition || orderQty <= 0 || price <= 0) {
        return;
      }
      const adjustedQty = Math.min(orderQty, previousPosition.quantity);
      const totalAmount = adjustedQty * price;
      const quantity = previousPosition.quantity - adjustedQty;
      const positions = { ...state.positions };
      if (quantity === 0) {
        delete positions[stock.id];
      } else {
        positions[stock.id] = {
          ...previousPosition,
          quantity,
        };
      }
      const trade: Trade = {
        day: state.currentDay,
        date: stock.bars[state.currentDay]?.date ?? '',
        stockId: stock.id,
        stockName: stock.name,
        type: 'sell',
        qty: adjustedQty,
        price,
        totalAmount,
      };
      set(
        {
          cash: state.cash + totalAmount,
          holdings: quantity,
          avgPrice: quantity === 0 ? 0 : previousPosition.averagePrice,
          positions,
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

function getLastDayIndex(stocks: ScenarioStock[]): number {
  if (!stocks.length) {
    return 0;
  }
  return Math.max(0, Math.min(...stocks.map((stock) => stock.bars.length)) - 1);
}

function getPortfolioValueAt(
  cash: number,
  positions: Record<string, ScenarioPosition>,
  stocks: ScenarioStock[],
  day: number,
  progress: number,
): number {
  return Object.values(positions).reduce((total, position) => {
    const stock = stocks.find((item) => item.id === position.stockId);
    return total + position.quantity * getStockPriceAtProgress(stock, day, progress);
  }, cash);
}
