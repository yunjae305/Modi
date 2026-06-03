import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('시나리오 랭킹은 현재 로그인 유저 기록을 식별하고 굵게 표시한다', () => {
  const tradingApi = readFileSync('api/_lib/trading.ts', 'utf8');
  const resourceApi = readFileSync('api/[resource].ts', 'utf8');
  const tradePage = readFileSync('src/pages/TradeDashboardPage.tsx', 'utf8');
  const tradingTypes = readFileSync('src/types/trading.ts', 'utf8');

  assert.match(tradingApi, /scenarioRankings\(currentUser/);
  assert.match(tradingApi, /userId: record\.user_id/);
  assert.match(tradingApi, /isCurrentUser: currentUser\?\.id === record\.user_id/);
  assert.match(resourceApi, /scenarioRankings\(user\)/);
  assert.match(tradingTypes, /userId: string/);
  assert.match(tradingTypes, /isCurrentUser: boolean/);
  assert.match(tradePage, /item\.isCurrentUser/);
  assert.match(tradePage, /내 기록/);
  assert.match(tradePage, /font-black/);
});
