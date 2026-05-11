import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('랜딩의 로그인과 회원가입 버튼은 소셜 로그인 화면으로 이동한다', () => {
  const landing = readFileSync('src/pages/LandingPage.tsx', 'utf8');
  const login = readFileSync('src/pages/LoginPage.tsx', 'utf8');
  const api = readFileSync('src/services/api.ts', 'utf8');

  assert.match(landing, /const openAuth = \(\) =>/);
  assert.equal((landing.match(/onClick=\{openAuth\}/g) ?? []).length, 2);
  assert.match(login, /Google로 시작하기/);
  assert.match(login, /Kakao로 시작하기/);
  assert.equal(api.includes("?? '/api'"), true);
});
