import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('랜딩은 시나리오 투자와 로그인으로 진입한다', () => {
  const app = readFileSync('src/App.tsx', 'utf8');
  const landing = readFileSync('src/pages/LandingPage.tsx', 'utf8');

  assert.match(app, /path="\/mode-select"/);
  assert.match(app, /path="\/select"/);
  assert.match(app, /path="\/login"/);
  assert.match(app, /path="\/trade"/);
  assert.match(landing, /navigate\('\/mode-select'\)/);
  assert.match(landing, /navigate\('\/login'\)/);
  assert.match(landing, /로그인/);
  assert.match(landing, /useAuthStore/);
  assert.match(landing, /refreshUser/);
  assert.match(landing, /user\.nickname/);
  assert.match(landing, /로그아웃/);

  for (const forbidden of ['ProtectedRoute', 'RealTradingPage']) {
    assert.equal(app.includes(forbidden), false, forbidden);
  }
});
