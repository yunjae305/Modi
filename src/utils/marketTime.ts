import type { MarketSpeed, OHLCVBar, ScenarioStock } from '../types';

export function getDayDurationMs(speed: MarketSpeed): number {
  return 180000 / speed;
}

export function clampProgress(progress: number): number {
  if (progress < 0) {
    return 0;
  }
  if (progress > 1) {
    return 1;
  }
  return progress;
}

export function interpolateBarPrice(bar: OHLCVBar | undefined, progress: number): number {
  if (!bar) {
    return 0;
  }
  const points = bar.close >= bar.open
    ? [
        { progress: 0, price: bar.open },
        { progress: 0.35, price: bar.low },
        { progress: 0.65, price: bar.high },
        { progress: 1, price: bar.close },
      ]
    : [
        { progress: 0, price: bar.open },
        { progress: 0.35, price: bar.high },
        { progress: 0.65, price: bar.low },
        { progress: 1, price: bar.close },
      ];
  const value = clampProgress(progress);
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const next = points[index];
    if (value <= next.progress) {
      const range = next.progress - previous.progress;
      const localProgress = range === 0 ? 0 : (value - previous.progress) / range;
      return roundPrice(previous.price + (next.price - previous.price) * localProgress);
    }
  }
  return roundPrice(bar.close);
}

export function getStockPriceAtProgress(stock: ScenarioStock | undefined, day: number, progress: number): number {
  if (!stock?.bars.length) {
    return 0;
  }
  const index = Math.min(Math.max(Math.floor(day), 0), stock.bars.length - 1);
  return interpolateBarPrice(stock.bars[index], progress);
}

function roundPrice(price: number): number {
  return Math.round(price * 100) / 100;
}
