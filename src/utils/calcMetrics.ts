import type { OHLCVBar, ScenarioStock, Trade } from '../types';

export function calcHoldReturn(data: OHLCVBar[], initialCash: number): number {
  if (!data.length || initialCash <= 0) {
    return 0;
  }
  const firstPrice = data[0].close;
  const lastPrice = data[data.length - 1].close;
  if (firstPrice <= 0) {
    return 0;
  }
  const qty = Math.floor(initialCash / firstPrice);
  const cash = initialCash - qty * firstPrice;
  const finalValue = cash + qty * lastPrice;
  return (finalValue - initialCash) / initialCash;
}

export function calcPortfolioTimeSeries(
  data: OHLCVBar[],
  tradeHistory: Trade[],
  initialCash: number,
): { date: string; myValue: number; holdValue: number }[] {
  if (!data.length) {
    return [];
  }
  const tradesByDay = new Map<number, Trade[]>();
  tradeHistory.forEach((trade) => {
    tradesByDay.set(trade.day, [...(tradesByDay.get(trade.day) ?? []), trade]);
  });
  const firstPrice = data[0].close;
  const holdQty = firstPrice > 0 ? Math.floor(initialCash / firstPrice) : 0;
  const holdCash = initialCash - holdQty * firstPrice;
  let cash = initialCash;
  let holdings = 0;
  return data.map((bar, index) => {
    const trades = tradesByDay.get(index) ?? [];
    trades.forEach((trade) => {
      if (trade.type === 'buy') {
        cash -= trade.totalAmount;
        holdings += trade.qty;
      } else {
        cash += trade.totalAmount;
        holdings -= trade.qty;
      }
    });
    return {
      date: bar.date,
      myValue: Math.round(cash + holdings * bar.close),
      holdValue: Math.round(holdCash + holdQty * bar.close),
    };
  });
}

export function calcMDD(values: number[]): number {
  if (!values.length) {
    return 0;
  }
  let peak = values[0];
  let mdd = 0;
  values.forEach((value) => {
    peak = Math.max(peak, value);
    if (peak > 0) {
      mdd = Math.min(mdd, (value - peak) / peak);
    }
  });
  return mdd;
}

export function calcHoldReturnFromStocks(stocks: ScenarioStock[], initialCash: number): number {
  const stock = stocks[0];
  if (!stock?.bars.length || initialCash <= 0) {
    return 0;
  }
  const firstPrice = stock.bars[0].close;
  const lastPrice = stock.bars[stock.bars.length - 1].close;
  if (firstPrice <= 0) {
    return 0;
  }
  const qty = Math.floor(initialCash / firstPrice);
  const cash = initialCash - qty * firstPrice;
  const finalValue = cash + qty * lastPrice;
  return (finalValue - initialCash) / initialCash;
}

export function calcPortfolioTimeSeriesFromStocks(
  stocks: ScenarioStock[],
  tradeHistory: Trade[],
  initialCash: number,
): { date: string; myValue: number; holdValue: number }[] {
  const baseStock = stocks[0];
  if (!baseStock?.bars.length) {
    return [];
  }
  const stockMap = new Map(stocks.map((stock) => [stock.id, stock]));
  const dataLength = Math.min(...stocks.map((stock) => stock.bars.length));
  const tradesByDay = new Map<number, Trade[]>();
  tradeHistory.forEach((trade) => {
    tradesByDay.set(trade.day, [...(tradesByDay.get(trade.day) ?? []), trade]);
  });
  const firstPrice = baseStock.bars[0].close;
  const holdQty = firstPrice > 0 ? Math.floor(initialCash / firstPrice) : 0;
  const holdCash = initialCash - holdQty * firstPrice;
  let cash = initialCash;
  const holdings: Record<string, number> = {};
  return baseStock.bars.slice(0, dataLength).map((bar, index) => {
    const trades = tradesByDay.get(index) ?? [];
    trades.forEach((trade) => {
      if (trade.type === 'buy') {
        cash -= trade.totalAmount;
        holdings[trade.stockId] = (holdings[trade.stockId] ?? 0) + trade.qty;
      } else {
        cash += trade.totalAmount;
        holdings[trade.stockId] = (holdings[trade.stockId] ?? 0) - trade.qty;
      }
    });
    const stockValue = Object.entries(holdings).reduce((total, [stockId, qty]) => {
      const stock = stockMap.get(stockId);
      return total + Math.max(qty, 0) * (stock?.bars[index]?.close ?? 0);
    }, 0);
    return {
      date: bar.date,
      myValue: Math.round(cash + stockValue),
      holdValue: Math.round(holdCash + holdQty * bar.close),
    };
  });
}
