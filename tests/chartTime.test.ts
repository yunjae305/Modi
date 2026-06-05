import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getChartDate } from '../src/utils/chartTime.ts';

test('chart date uses the first date from a display range', () => {
  assert.equal(getChartDate('2000-01-03 ~ 2000-01-07'), '2000-01-03');
});

test('chart date keeps a single date unchanged', () => {
  assert.equal(getChartDate('2020-01-02'), '2020-01-02');
});

test('charts normalize compressed date ranges before rendering', () => {
  const candleChart = readFileSync('src/components/chart/CandleChart.tsx', 'utf8');
  const profitChart = readFileSync('src/components/result/ProfitChart.tsx', 'utf8');

  assert.match(candleChart, /getChartDate\(bar\.date\)/);
  assert.match(profitChart, /getChartDate\(point\.date\)/);
  assert.equal(candleChart.includes('time: bar.date as Time'), false);
  assert.equal(profitChart.includes('time: point.date as Time'), false);
});
