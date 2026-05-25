# Scenario Stock Trading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build scenario-mode trading around 20 selectable representative stocks per scenario, multi-stock positions, automatic market time, and speed controls.

**Architecture:** Keep the scenario mode fully frontend/static. Add stock-bundle JSON files under `public/data/`, focused market-time utilities under `src/utils/`, and extend `tradeStore` from single-index holdings to selected-stock and multi-position state. Reuse the existing chart, asset, order, and result surfaces with targeted component additions.

**Tech Stack:** React, TypeScript, Vite, Zustand, lightweight-charts, Node test runner.

---

### Task 1: Static Scenario Stock Data

**Files:**
- Create: `public/data/corona_stocks_2020.json`
- Create: `public/data/sp500_stocks_2008.json`
- Create: `public/data/nasdaq_stocks_2000.json`
- Modify: `src/data/scenarios.ts`
- Test: `tests/scenarioStockData.test.ts`

- [ ] **Step 1: Write failing surface test**

Create `tests/scenarioStockData.test.ts` that imports `scenarios`, reads every scenario `dataFile`, asserts every file exists, asserts each JSON array has 20 stocks, and checks each stock has `id`, `name`, `market`, and at least 2 OHLCV bars.

- [ ] **Step 2: Run test to verify RED**

Run: `node --test --experimental-strip-types tests/scenarioStockData.test.ts`
Expected: FAIL because the new files and scenario paths do not exist yet.

- [ ] **Step 3: Add static stock files and scenario paths**

Generate or write the three JSON files with 20 stocks each. Update the three historical scenarios to point to `/data/corona_stocks_2020.json`, `/data/sp500_stocks_2008.json`, and `/data/nasdaq_stocks_2000.json`.

- [ ] **Step 4: Run test to verify GREEN**

Run: `node --test --experimental-strip-types tests/scenarioStockData.test.ts`
Expected: PASS.

### Task 2: Market Time Utilities

**Files:**
- Create: `src/utils/marketTime.ts`
- Test: `tests/marketTime.test.ts`

- [ ] **Step 1: Write failing utility tests**

Create tests for `getDayDurationMs`, `clampProgress`, `interpolateBarPrice`, and `getStockPriceAtProgress`.

- [ ] **Step 2: Run test to verify RED**

Run: `node --test --experimental-strip-types tests/marketTime.test.ts`
Expected: FAIL because `src/utils/marketTime.ts` does not exist.

- [ ] **Step 3: Implement utilities**

Implement speed durations for `0.5`, `1`, and `2`, progress clamping, OHLC interpolation, and stock current-price lookup.

- [ ] **Step 4: Run test to verify GREEN**

Run: `node --test --experimental-strip-types tests/marketTime.test.ts`
Expected: PASS.

### Task 3: Multi-Stock Trade Store

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/store/tradeStore.ts`
- Modify: `src/hooks/useChartData.ts`
- Test: `tests/scenarioTradeStore.test.ts`

- [ ] **Step 1: Write failing store tests**

Create tests that initialize a scenario with two stocks, select a stock, buy multiple stocks, sell partial and full positions, cap buy quantity by cash, advance market time, and verify speed changes preserve progress.

- [ ] **Step 2: Run test to verify RED**

Run: `node --test --experimental-strip-types tests/scenarioTradeStore.test.ts`
Expected: FAIL because the store is still single-holding.

- [ ] **Step 3: Implement store state**

Add scenario stock types, selected stock state, position map, market speed, playing state, day progress, current price per stock, portfolio value across positions, buy/sell by selected stock, manual next-day, and tick progression.

- [ ] **Step 4: Run test to verify GREEN**

Run: `node --test --experimental-strip-types tests/scenarioTradeStore.test.ts`
Expected: PASS.

### Task 4: Result Metrics for Multi-Stock Portfolio

**Files:**
- Modify: `src/utils/calcMetrics.ts`
- Modify: `src/pages/ResultPage.tsx`
- Test: `tests/scenarioPortfolioMetrics.test.ts`

- [ ] **Step 1: Write failing metrics tests**

Create tests that calculate hold return from the first scenario stock and portfolio time series from trades containing stock IDs.

- [ ] **Step 2: Run test to verify RED**

Run: `node --test --experimental-strip-types tests/scenarioPortfolioMetrics.test.ts`
Expected: FAIL because metrics only support one chart.

- [ ] **Step 3: Implement metrics**

Support both existing single-chart helpers and new multi-stock helpers. Wire `ResultPage` to use the multi-stock helpers when stock data exists.

- [ ] **Step 4: Run test to verify GREEN**

Run: `node --test --experimental-strip-types tests/scenarioPortfolioMetrics.test.ts`
Expected: PASS.

### Task 5: Simulation UI

**Files:**
- Create: `src/components/trade/StockList.tsx`
- Create: `src/components/trade/MarketTimeControls.tsx`
- Modify: `src/pages/SimulationPage.tsx`
- Modify: `src/components/trade/AssetStatus.tsx`
- Modify: `src/components/trade/TradePanel.tsx`
- Modify: `src/components/trade/NextDayButton.tsx`
- Modify: `src/components/result/TradeHistory.tsx`
- Test: `tests/scenarioTradingSurface.test.ts`

- [ ] **Step 1: Write failing surface test**

Create a text-surface test that checks for stock list, market time controls, 0.5배속, 1배속, 2배속, selected-stock order wiring, and stock fields in trade history.

- [ ] **Step 2: Run test to verify RED**

Run: `node --test --experimental-strip-types tests/scenarioTradingSurface.test.ts`
Expected: FAIL because the components do not exist yet.

- [ ] **Step 3: Implement UI components**

Render 20 stock cards, selected-stock chart, portfolio asset status, selected-stock order panel, market play/pause, speed buttons, and stock-aware trade history.

- [ ] **Step 4: Run test to verify GREEN**

Run: `node --test --experimental-strip-types tests/scenarioTradingSurface.test.ts`
Expected: PASS.

### Task 6: Offline Cache and Full Verification

**Files:**
- Modify: `public/sw.js`
- Modify: `README.md`

- [ ] **Step 1: Update static cache and docs**

Cache the three stock-bundle JSON files and document the representative-stock scenario flow.

- [ ] **Step 2: Run full tests**

Run: `node --test --experimental-strip-types tests/*.test.ts`
Expected: PASS.

- [ ] **Step 3: Run build**

Run: `npm.cmd run build`
Expected: PASS.
