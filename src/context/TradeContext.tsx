import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { MarketSpeed, OHLCVBar, Scenario, ScenarioPosition, ScenarioStock, Trade } from '../types';
import { getDayDurationMs, getStockPriceAtProgress } from '../utils/marketTime';

const initialState = {
  scenario: null as Scenario | null,
  scenarioStocks: [] as ScenarioStock[],
  selectedStockId: '',
  chartData: [] as OHLCVBar[],
  currentDay: 0,
  dayProgress: 0,
  marketSpeed: 1 as MarketSpeed,
  isPlaying: false,
  isFinished: false,
  cash: 0,
  holdings: 0,
  avgPrice: 0,
  positions: {} as Record<string, ScenarioPosition>,
  peakPortfolio: 0,
  maxDrawdown: 0,
  realizedProfit: 0,
  tradeHistory: [] as Trade[],
};

type TradeState = typeof initialState;

interface TradeContextValue extends TradeState {
  selectedStock: ScenarioStock | null;
  selectedPosition: ScenarioPosition | null;
  positionList: ScenarioPosition[];
  currentPrice: number;
  totalPurchaseAmount: number;
  totalEvaluationAmount: number;
  estimatedAssets: number;
  portfolioValue: number;
  profitRate: number;
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

const TradeContext = createContext<TradeContextValue | null>(null);

function getLastDayIndex(stocks: ScenarioStock[]): number {
  if (!stocks.length) return 0;
  return Math.max(0, Math.min(...stocks.map((s) => s.bars.length)) - 1);
}

function getPortfolioValueAt(
  cash: number,
  positions: Record<string, ScenarioPosition>,
  stocks: ScenarioStock[],
  day: number,
  progress: number,
): number {
  return Object.values(positions).reduce((total, position) => {
    const stock = stocks.find((s) => s.id === position.stockId);
    return total + position.quantity * getStockPriceAtProgress(stock, day, progress);
  }, cash);
}

export function TradeProvider({ children }: { children: React.ReactNode }) {
  const [state, setStateRaw] = useState<TradeState>(initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const setState = useCallback((partial: Partial<TradeState>) => {
    setStateRaw((prev) => ({ ...prev, ...partial }));
  }, []);

  const selectedStock = useMemo(
    () => state.scenarioStocks.find((s) => s.id === state.selectedStockId) ?? state.scenarioStocks[0] ?? null,
    [state.scenarioStocks, state.selectedStockId],
  );

  const selectedPosition = useMemo(
    () => (selectedStock ? state.positions[selectedStock.id] ?? null : null),
    [selectedStock, state.positions],
  );

  const positionList = useMemo(() => Object.values(state.positions), [state.positions]);

  const currentPrice = useMemo(
    () => getStockPriceAtProgress(selectedStock ?? undefined, state.currentDay, state.dayProgress),
    [selectedStock, state.currentDay, state.dayProgress],
  );

  const totalPurchaseAmount = useMemo(
    () => positionList.reduce((sum, p) => sum + p.quantity * p.averagePrice, 0),
    [positionList],
  );

  const totalEvaluationAmount = useMemo(() => {
    const { scenarioStocks, currentDay, dayProgress } = state;
    return positionList.reduce((sum, p) => {
      const s = scenarioStocks.find((st) => st.id === p.stockId) ?? scenarioStocks[0];
      return sum + p.quantity * getStockPriceAtProgress(s, currentDay, dayProgress);
    }, 0);
  }, [positionList, state.scenarioStocks, state.currentDay, state.dayProgress]);

  const estimatedAssets = useMemo(() => state.cash + totalEvaluationAmount, [state.cash, totalEvaluationAmount]);

  const portfolioValue = useMemo(() => {
    const { scenarioStocks, currentDay, dayProgress, cash } = state;
    return positionList.reduce((sum, p) => {
      const s = scenarioStocks.find((st) => st.id === p.stockId) ?? scenarioStocks[0];
      return sum + p.quantity * getStockPriceAtProgress(s, currentDay, dayProgress);
    }, cash);
  }, [positionList, state.scenarioStocks, state.currentDay, state.dayProgress, state.cash]);

  const profitRate = useMemo(() => {
    if (!state.scenario) return 0;
    return (portfolioValue - state.scenario.initialCash) / state.scenario.initialCash;
  }, [portfolioValue, state.scenario]);

  const selectScenario = useCallback(
    (scenario: Scenario) => {
      setState({ ...initialState, scenario, cash: scenario.initialCash, peakPortfolio: scenario.initialCash });
    },
    [setState],
  );

  const initScenario = useCallback(
    (scenario: Scenario, data: ScenarioStock[]) => {
      const firstStock = data[0] ?? null;
      setState({
        ...initialState,
        scenario,
        scenarioStocks: data,
        selectedStockId: firstStock?.id ?? '',
        chartData: firstStock?.bars ?? [],
        isPlaying: data.length > 0,
        cash: scenario.initialCash,
        peakPortfolio: scenario.initialCash,
      });
    },
    [setState],
  );

  const selectStock = useCallback(
    (stockId: string) => {
      const { scenarioStocks, positions } = stateRef.current;
      const stock = scenarioStocks.find((s) => s.id === stockId);
      if (!stock) return;
      const position = positions[stock.id];
      setState({ selectedStockId: stock.id, chartData: stock.bars, holdings: position?.quantity ?? 0, avgPrice: position?.averagePrice ?? 0 });
    },
    [setState],
  );

  const setMarketSpeed = useCallback(
    (speed: MarketSpeed) => setState({ marketSpeed: speed }),
    [setState],
  );

  const togglePlaying = useCallback(() => {
    const { scenarioStocks, isFinished, isPlaying } = stateRef.current;
    if (!scenarioStocks.length || isFinished) return;
    setState({ isPlaying: !isPlaying });
  }, [setState]);

  const tick = useCallback(
    (elapsedMs: number) => {
      const { isPlaying, scenarioStocks, isFinished, currentDay, dayProgress, marketSpeed, cash, positions, peakPortfolio, maxDrawdown } = stateRef.current;
      if (!isPlaying || !scenarioStocks.length || isFinished || elapsedMs <= 0) return;
      const duration = getDayDurationMs(marketSpeed);
      const lastDayIndex = getLastDayIndex(scenarioStocks);
      let newDay = currentDay;
      let newProgress = dayProgress + elapsedMs / duration;
      let newIsFinished = false;
      while (newProgress >= 1 && !newIsFinished) {
        if (newDay >= lastDayIndex) { newIsFinished = true; newProgress = 1; }
        else { newDay += 1; newProgress -= 1; }
      }
      const pv = getPortfolioValueAt(cash, positions, scenarioStocks, newDay, newProgress);
      const newPeak = Math.max(peakPortfolio, pv);
      const drawdown = newPeak === 0 ? 0 : (pv - newPeak) / newPeak;
      setState({ currentDay: newDay, dayProgress: newProgress, isFinished: newIsFinished, isPlaying: !newIsFinished, peakPortfolio: newPeak, maxDrawdown: Math.min(maxDrawdown, drawdown) });
    },
    [setState],
  );

  const nextDay = useCallback(() => {
    const { scenarioStocks, isFinished, currentDay, cash, positions, peakPortfolio, maxDrawdown } = stateRef.current;
    if (!scenarioStocks.length || isFinished) return;
    const lastDayIndex = getLastDayIndex(scenarioStocks);
    if (currentDay >= lastDayIndex) { setState({ isFinished: true, isPlaying: false, dayProgress: 1 }); return; }
    const newDay = currentDay + 1;
    const pv = getPortfolioValueAt(cash, positions, scenarioStocks, newDay, 0);
    const newPeak = Math.max(peakPortfolio, pv);
    const drawdown = newPeak === 0 ? 0 : (pv - newPeak) / newPeak;
    setState({ currentDay: newDay, dayProgress: 0, peakPortfolio: newPeak, maxDrawdown: Math.min(maxDrawdown, drawdown) });
  }, [setState]);

  const buy = useCallback(
    (qty: number) => {
      const { scenarioStocks, selectedStockId, currentDay, dayProgress, cash, positions, tradeHistory } = stateRef.current;
      const stock = scenarioStocks.find((s) => s.id === selectedStockId) ?? scenarioStocks[0];
      const price = getStockPriceAtProgress(stock, currentDay, dayProgress);
      const orderQty = Math.floor(qty);
      if (!stock || orderQty <= 0 || price <= 0) return;
      const adjustedQty = Math.min(orderQty, Math.floor(cash / price));
      if (adjustedQty === 0) return;
      const totalAmount = adjustedQty * price;
      const prev = positions[stock.id];
      const newQty = (prev?.quantity ?? 0) + adjustedQty;
      const avgPr = ((prev?.averagePrice ?? 0) * (prev?.quantity ?? 0) + totalAmount) / newQty;
      const position: ScenarioPosition = { stockId: stock.id, stockName: stock.name, quantity: newQty, averagePrice: avgPr };
      const trade: Trade = { day: currentDay, date: stock.bars[currentDay]?.date ?? '', stockId: stock.id, stockName: stock.name, type: 'buy', qty: adjustedQty, price, totalAmount };
      setState({ cash: cash - totalAmount, holdings: position.quantity, avgPrice: position.averagePrice, positions: { ...positions, [stock.id]: position }, tradeHistory: [...tradeHistory, trade] });
    },
    [setState],
  );

  const sell = useCallback(
    (qty: number) => {
      const { scenarioStocks, selectedStockId, currentDay, dayProgress, cash, positions, tradeHistory, realizedProfit } = stateRef.current;
      const stock = scenarioStocks.find((s) => s.id === selectedStockId) ?? scenarioStocks[0];
      const price = getStockPriceAtProgress(stock, currentDay, dayProgress);
      const orderQty = Math.floor(qty);
      const prevPos = stock ? positions[stock.id] : undefined;
      if (!stock || !prevPos || orderQty <= 0 || price <= 0) return;
      const adjustedQty = Math.min(orderQty, prevPos.quantity);
      const totalAmount = adjustedQty * price;
      const newQty = prevPos.quantity - adjustedQty;
      const newPositions = { ...positions };
      if (newQty === 0) delete newPositions[stock.id];
      else newPositions[stock.id] = { ...prevPos, quantity: newQty };
      const trade: Trade = { day: currentDay, date: stock.bars[currentDay]?.date ?? '', stockId: stock.id, stockName: stock.name, type: 'sell', qty: adjustedQty, price, totalAmount };
      setState({ cash: cash + totalAmount, holdings: newQty, avgPrice: newQty === 0 ? 0 : prevPos.averagePrice, positions: newPositions, realizedProfit: realizedProfit + (price - prevPos.averagePrice) * adjustedQty, tradeHistory: [...tradeHistory, trade] });
    },
    [setState],
  );

  const reset = useCallback(() => setState(initialState), [setState]);

  const value: TradeContextValue = {
    ...state,
    selectedStock,
    selectedPosition,
    positionList,
    currentPrice,
    totalPurchaseAmount,
    totalEvaluationAmount,
    estimatedAssets,
    portfolioValue,
    profitRate,
    selectScenario,
    initScenario,
    selectStock,
    setMarketSpeed,
    togglePlaying,
    tick,
    nextDay,
    buy,
    sell,
    reset,
  };

  return <TradeContext.Provider value={value}>{children}</TradeContext.Provider>;
}

export function useTradeContext(): TradeContextValue {
  const ctx = useContext(TradeContext);
  if (!ctx) throw new Error('useTradeContext must be used within TradeProvider');
  return ctx;
}
