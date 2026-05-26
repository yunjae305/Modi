import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('시뮬레이션 화면은 종목 목록과 시장 시간 컨트롤을 사용한다', () => {
  assert.equal(existsSync('src/components/trade/StockList.tsx'), true);
  assert.equal(existsSync('src/components/trade/MarketTimeControls.tsx'), true);

  const simulationPage = readFileSync('src/pages/SimulationPage.tsx', 'utf8');
  const stockList = readFileSync('src/components/trade/StockList.tsx', 'utf8');
  const marketTimeControls = readFileSync('src/components/trade/MarketTimeControls.tsx', 'utf8');
  const tradePanel = readFileSync('src/components/trade/TradePanel.tsx', 'utf8');
  const tradeHistory = readFileSync('src/components/result/TradeHistory.tsx', 'utf8');

  assert.match(simulationPage, /StockList/);
  assert.match(simulationPage, /MarketTimeControls/);
  assert.match(stockList, /scenarioStocks/);
  assert.match(stockList, /selectStock/);
  assert.match(marketTimeControls, /0\.5배속/);
  assert.match(marketTimeControls, /1배속/);
  assert.match(marketTimeControls, /2배속/);
  assert.match(marketTimeControls, /togglePlaying/);
  assert.match(tradePanel, /selectedStock/);
  assert.match(tradeHistory, /stockName/);
});
