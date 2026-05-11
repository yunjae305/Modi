import type { OHLCVBar, Trade } from '../types';

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
