import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

test('모드 선택 화면 없이 시나리오 선택으로 바로 이어진다', () => {
  const app = readFileSync('src/App.tsx', 'utf8');
  const landing = readFileSync('src/pages/LandingPage.tsx', 'utf8');

  assert.equal(existsSync('src/pages/ModeSelectPage.tsx'), false);
  assert.equal(app.includes('/mode-select'), false);
  assert.equal(app.includes('/trade'), false);
  assert.equal(landing.includes('/mode-select'), false);
  assert.equal(landing.includes('/trade'), false);
  assert.equal(landing.includes('모의투자 모드'), false);
});
