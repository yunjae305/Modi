import test from 'node:test';
import assert from 'node:assert/strict';
import { useTradeStore } from '../src/store/tradeStore.ts';
import type { Scenario, ScenarioStock } from '../src/types/index.ts';

const scenario: Scenario = {
  id: 'corona',
  title: 'Test Scenario',
  subtitle: 'Test',
  dataFile: '/data/test_stocks.json',
  market: 'TEST',
  period: '2020.01 ~ 2020.01',
  lesson: 'Test',
  initialCash: 1000,
  revealText: 'Test',
};

const stocks: ScenarioStock[] = [
  {
    id: 'AAA',
    name: 'Alpha',
    market: 'TEST',
    bars: [
      { date: '2020-01-02', open: 100, high: 130, low: 90, close: 120, volume: 1000 },
      { date: '2020-01-03', open: 120, high: 150, low: 110, close: 140, volume: 1000 },
    ],
  },
  {
    id: 'BBB',
    name: 'Beta',
    market: 'TEST',
    bars: [
      { date: '2020-01-02', open: 20, high: 25, low: 18, close: 22, volume: 1000 },
      { date: '2020-01-03', open: 22, high: 26, low: 19, close: 21, volume: 1000 },
    ],
  },
];

test('여러 종목을 선택해 매수하고 종목별 보유 수량을 평가한다', () => {
  const store = useTradeStore.getState();

  store.reset();
  useTradeStore.getState().initScenario(scenario, stocks);
  assert.equal(useTradeStore.getState().selectedStockId, 'AAA');

  useTradeStore.getState().selectStock('BBB');
  assert.equal(useTradeStore.getState().selectedStock?.().id, 'BBB');
  assert.equal(useTradeStore.getState().currentPrice(), 20);

  useTradeStore.getState().buy(2);
  assert.equal(useTradeStore.getState().cash, 960);
  assert.equal(useTradeStore.getState().positions.BBB.quantity, 2);
  assert.equal(useTradeStore.getState().positions.BBB.averagePrice, 20);

  useTradeStore.getState().selectStock('AAA');
  useTradeStore.getState().buy(5);
  assert.equal(useTradeStore.getState().cash, 460);
  assert.equal(useTradeStore.getState().positions.AAA.quantity, 5);
  assert.equal(useTradeStore.getState().portfolioValue(), 1000);
});

test('현금과 보유 수량 안에서만 매수와 매도를 체결한다', () => {
  useTradeStore.getState().reset();
  useTradeStore.getState().initScenario(scenario, stocks);

  useTradeStore.getState().buy(100);
  assert.equal(useTradeStore.getState().positions.AAA.quantity, 10);
  assert.equal(useTradeStore.getState().cash, 0);

  useTradeStore.getState().sell(4);
  assert.equal(useTradeStore.getState().positions.AAA.quantity, 6);
  assert.equal(useTradeStore.getState().cash, 400);

  useTradeStore.getState().sell(100);
  assert.equal(useTradeStore.getState().positions.AAA, undefined);
  assert.equal(useTradeStore.getState().cash, 1000);
});

test('시장 시간 진행과 속도 변경은 진행률과 날짜를 갱신한다', () => {
  useTradeStore.getState().reset();
  useTradeStore.getState().initScenario(scenario, stocks);

  useTradeStore.getState().setMarketSpeed(2);
  useTradeStore.getState().tick(75000);
  assert.equal(useTradeStore.getState().dayProgress, 0.5);
  assert.equal(useTradeStore.getState().currentDay, 0);
  assert.equal(useTradeStore.getState().currentPrice(), 110);

  useTradeStore.getState().setMarketSpeed(0.5);
  assert.equal(useTradeStore.getState().dayProgress, 0.5);

  useTradeStore.getState().tick(300000);
  assert.equal(useTradeStore.getState().currentDay, 1);
  assert.equal(useTradeStore.getState().dayProgress, 0);
});
