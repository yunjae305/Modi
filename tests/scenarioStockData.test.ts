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
      assert.equal(typeof item.market, 'string');
      assert.equal(Array.isArray(item.bars), true);
      assert.ok((item.bars as unknown[]).length >= 2);
    }
  }
});
