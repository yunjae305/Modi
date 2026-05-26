import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calcHoldReturnFromStocks,
  calcPortfolioTimeSeriesFromStocks,
} from '../src/utils/calcMetrics.ts';
import type { ScenarioStock, Trade } from '../src/types/index.ts';

const stocks: ScenarioStock[] = [
  {
    id: 'AAA',
    name: 'Alpha',
    market: 'TEST',
    bars: [
      { date: '2020-01-02', open: 100, high: 100, low: 100, close: 100, volume: 1000 },
      { date: '2020-01-03', open: 200, high: 200, low: 200, close: 200, volume: 1000 },
    ],
  },
  {
    id: 'BBB',
    name: 'Beta',
    market: 'TEST',
    bars: [
      { date: '2020-01-02', open: 20, high: 20, low: 20, close: 20, volume: 1000 },
      { date: '2020-01-03', open: 10, high: 10, low: 10, close: 10, volume: 1000 },
    ],
  },
];

test('첫 번째 종목 기준 존버 수익률을 계산한다', () => {
  assert.equal(calcHoldReturnFromStocks(stocks, 1000), 1);
});

test('여러 종목 거래 내역으로 포트폴리오 자산 흐름을 계산한다', () => {
  const trades: Trade[] = [
    {
      day: 0,
      date: '2020-01-02',
      stockId: 'AAA',
      stockName: 'Alpha',
      type: 'buy',
      qty: 2,
      price: 100,
      totalAmount: 200,
    },
    {
      day: 0,
      date: '2020-01-02',
      stockId: 'BBB',
      stockName: 'Beta',
      type: 'buy',
      qty: 5,
      price: 20,
      totalAmount: 100,
    },
    {
      day: 1,
      date: '2020-01-03',
      stockId: 'AAA',
      stockName: 'Alpha',
      type: 'sell',
      qty: 1,
      price: 200,
      totalAmount: 200,
    },
  ];

  assert.deepEqual(calcPortfolioTimeSeriesFromStocks(stocks, trades, 1000), [
    { date: '2020-01-02', myValue: 1000, holdValue: 1000 },
    { date: '2020-01-03', myValue: 1150, holdValue: 2000 },
  ]);
});
