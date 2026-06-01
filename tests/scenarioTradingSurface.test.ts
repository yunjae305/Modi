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
  const assetStatus = readFileSync('src/components/trade/AssetStatus.tsx', 'utf8');
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
  assert.match(assetStatus, /총매입금액/);
  assert.match(assetStatus, /총평가금액/);
  assert.match(assetStatus, /추정자산/);
  assert.match(assetStatus, /실현손익/);
  assert.match(assetStatus, /totalPurchaseAmount/);
  assert.match(assetStatus, /totalEvaluationAmount/);
  assert.match(assetStatus, /estimatedAssets/);
  assert.match(assetStatus, /realizedProfit/);
  assert.match(tradeHistory, /stockName/);
  assert.match(tradeHistory, /min-w-0/);
});

test('시뮬레이션 화면은 빈 차트 영역을 줄이고 매매 기록을 중앙에서 당겨 보여준다', () => {
  const simulationPage = readFileSync('src/pages/SimulationPage.tsx', 'utf8');

  const chartIndex = simulationPage.indexOf('<CandleChart');
  const asideIndex = simulationPage.indexOf('<aside');
  const tradePanelIndex = simulationPage.indexOf('<TradePanel');
  const tradeHistoryIndex = simulationPage.indexOf('<TradeHistory');

  assert.notEqual(chartIndex, -1);
  assert.notEqual(asideIndex, -1);
  assert.notEqual(tradePanelIndex, -1);
  assert.notEqual(tradeHistoryIndex, -1);
  assert.equal(tradeHistoryIndex > chartIndex, true);
  assert.equal(tradeHistoryIndex < asideIndex, true);
  assert.equal(tradeHistoryIndex < tradePanelIndex, true);
  assert.match(simulationPage, /<div className="grid min-w-0 content-start gap-5">\s*<section className="min-w-0 rounded-2xl border border-\[#dfe3ee\]/);
  assert.match(simulationPage, /<CandleChart[\s\S]*height=\{320\}/);
  assert.match(simulationPage, /<TradeHistory trades=\{tradeHistory\}/);
});
