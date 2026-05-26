import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('카카오 간편 로그인과 콜백 라우트를 제공한다', () => {
  const app = readFileSync('src/App.tsx', 'utf8');

  for (const file of [
    'src/pages/LoginPage.tsx',
    'src/pages/LoginCallbackPage.tsx',
    'src/store/authStore.ts',
    'api/auth/oauth/kakao/authorize.ts',
    'api/auth/oauth/kakao/callback.ts',
  ]) {
    assert.equal(existsSync(file), true, file);
  }

  const login = readFileSync('src/pages/LoginPage.tsx', 'utf8');
  const callback = readFileSync('src/pages/LoginCallbackPage.tsx', 'utf8');
  const store = readFileSync('src/store/authStore.ts', 'utf8');
  const providers = readFileSync('api/auth/providers.ts', 'utf8');

  assert.match(app, /path="\/login\/callback"/);
  assert.match(login, /Kakao로 시작하기/);
  assert.match(login, /loginKakao/);
  assert.match(login, /ProviderStatus/);
  assert.match(login, /apiGet<ProviderStatus>\('\/auth\/providers'\)/);
  assert.match(login, /providers\?\.providers\.kakao/);
  assert.match(callback, /refreshUser/);
  assert.match(store, /loginKakao/);
  assert.match(providers, /kakao/);

  for (const forbidden of ['Google로 시작하기', '게스트', 'loginGuest', 'google:', 'guest: true']) {
    assert.equal(login.includes(forbidden) || store.includes(forbidden) || providers.includes(forbidden), false, forbidden);
  }
});
