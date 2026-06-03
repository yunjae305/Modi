import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { scenarios } from '../src/data/scenarios.ts';

test('과거 시나리오는 대표 종목 20개 정적 데이터를 사용한다', () => {
  for (const scenario of scenarios) {
    const filePath = `public${scenario.dataFile}`;

    assert.equal(existsSync(filePath), true, `${scenario.id} data file exists`);
    assert.match(scenario.dataFile, /_stocks_/);

    const stocks = JSON.parse(readFileSync(filePath, 'utf8')) as unknown[];

    assert.equal(stocks.length, 20, `${scenario.id} has 20 stocks`);

    for (const stock of stocks) {
      assert.equal(typeof stock, 'object');
      assert.notEqual(stock, null);

      const item = stock as {
        id?: unknown;
        name?: unknown;
        market?: unknown;
        bars?: unknown;
      };

      assert.equal(typeof item.id, 'string');
      assert.equal(typeof item.name, 'string');
      assert.equal((item.name as string).includes('?'), false, `${scenario.id} ${item.id} stock name is not corrupted`);
      assert.equal(typeof item.market, 'string');
      assert.equal(Array.isArray(item.bars), true);
      assert.ok((item.bars as unknown[]).length >= 2);
    }
  }
});

test('시나리오 데이터 생성기는 yfinance 기반 실제 가격 출처를 남긴다', () => {
  const script = readFileSync('scripts/fetch_data.py', 'utf8');

  assert.match(script, /import yfinance as yf/);
  assert.match(script, /yf\.download/);
  assert.match(script, /scenario_sources\.json/);
  assert.equal(existsSync('public/data/scenario_sources.json'), true);

  const sources = JSON.parse(readFileSync('public/data/scenario_sources.json', 'utf8')) as Record<string, {
    source?: unknown;
    symbols?: unknown;
  }>;

  for (const fileName of ['corona_stocks_2020.json', 'sp500_stocks_2008.json', 'nasdaq_stocks_2000.json']) {
    assert.equal(sources[fileName]?.source, 'yfinance');
    assert.equal(Array.isArray(sources[fileName]?.symbols), true);
    assert.equal((sources[fileName]?.symbols as unknown[]).length, 20);
  }
});
