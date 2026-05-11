import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

test('아니오 선택 후 시나리오 모드와 모의투자 모드를 다시 선택한다', () => {
  const app = readFileSync('src/App.tsx', 'utf8');
  const landing = readFileSync('src/pages/LandingPage.tsx', 'utf8');

  assert.equal(existsSync('src/pages/ModeSelectPage.tsx'), true);
  assert.match(app, /path="\/mode-select"/);
  assert.match(landing, /navigate\('\/mode-select'\)/);

  const modeSelect = readFileSync('src/pages/ModeSelectPage.tsx', 'utf8');

  assert.match(modeSelect, /시나리오 모드/);
  assert.match(modeSelect, /모의투자 모드/);
  assert.match(modeSelect, /navigate\('\/select'\)/);
  assert.match(modeSelect, /navigate\('\/trade'\)/);
});
