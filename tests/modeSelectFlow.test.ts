// Modi 모드 선택 흐름 테스트
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

test('계획서 라우팅은 모드 선택과 모의투자 대시보드를 제공한다', () => {
  const app = readFileSync('src/App.tsx', 'utf8');
  const landing = readFileSync('src/pages/LandingPage.tsx', 'utf8');

  assert.equal(existsSync('src/pages/ModeSelectPage.tsx'), true);
  assert.equal(existsSync('src/pages/TradeDashboardPage.tsx'), true);
  assert.match(app, /path="\/mode-select"/);
  assert.match(app, /path="\/trade"/);
  assert.match(landing, /navigate\('\/select'\)/);
  assert.equal(landing.includes("navigate('/mode-select')"), false);
  assert.match(landing, /시나리오 투자/);
  assert.match(landing, /시나리오 시작/);
  const modeSelect = readFileSync('src/pages/ModeSelectPage.tsx', 'utf8');
  assert.match(modeSelect, /navigate\('\/select'\)/);
  assert.equal(modeSelect.includes('/login?next=/select'), false);
});
