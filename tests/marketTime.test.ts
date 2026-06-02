import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampProgress,
  getDayDurationMs,
  getStockPriceAtProgress,
  interpolateBarPrice,
} from '../src/utils/marketTime.ts';
import type { ScenarioStock } from '../src/types/index.ts';

test('시장 속도별 하루 진행 시간을 계산한다', () => {
  assert.equal(getDayDurationMs(1), 180000);
  assert.equal(getDayDurationMs(2), 90000);
  assert.equal(getDayDurationMs(3), 60000);
});

test('진행률을 0부터 1 사이로 제한한다', () => {
  assert.equal(clampProgress(-0.2), 0);
  assert.equal(clampProgress(0.4), 0.4);
  assert.equal(clampProgress(1.2), 1);
});

test('상승일은 시가에서 저가와 고가를 지나 종가에 도착한다', () => {
  const bar = {
    date: '2020-01-02',
    open: 100,
    high: 130,
    low: 90,
    close: 120,
    volume: 1000,
  };

  assert.equal(interpolateBarPrice(bar, 0), 100);
  assert.equal(interpolateBarPrice(bar, 0.35), 90);
  assert.equal(interpolateBarPrice(bar, 0.65), 130);
  assert.equal(interpolateBarPrice(bar, 1), 120);
});

test('하락일은 시가에서 고가와 저가를 지나 종가에 도착한다', () => {
  const bar = {
    date: '2020-01-03',
    open: 120,
    high: 130,
    low: 90,
    close: 100,
    volume: 1000,
  };

  assert.equal(interpolateBarPrice(bar, 0), 120);
  assert.equal(interpolateBarPrice(bar, 0.35), 130);
  assert.equal(interpolateBarPrice(bar, 0.65), 90);
  assert.equal(interpolateBarPrice(bar, 1), 100);
});

test('종목의 현재 날짜와 진행률 기준 표시 가격을 계산한다', () => {
  const stock: ScenarioStock = {
    id: 'TEST',
    name: 'Test Stock',
    market: 'TEST',
    bars: [
      { date: '2020-01-02', open: 100, high: 130, low: 90, close: 120, volume: 1000 },
      { date: '2020-01-03', open: 120, high: 140, low: 110, close: 130, volume: 1000 },
    ],
  };

  assert.equal(getStockPriceAtProgress(stock, 0, 0), 100);
  assert.equal(getStockPriceAtProgress(stock, 1, 1), 130);
  assert.equal(getStockPriceAtProgress(stock, 10, 0.5), 125);
});
