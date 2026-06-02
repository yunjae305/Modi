import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('카카오 간편 로그인, 게스트 세션, 콜백 라우트를 제공한다', () => {
  const app = readFileSync('src/App.tsx', 'utf8');

  for (const file of [
    'src/pages/LoginPage.tsx',
    'src/pages/LoginCallbackPage.tsx',
    'src/store/authStore.ts',
    'api/auth/guest.ts',
    'api/auth/oauth/kakao/[step].ts',
  ]) {
    assert.equal(existsSync(file), true, file);
  }

  const login = readFileSync('src/pages/LoginPage.tsx', 'utf8');
  const callback = readFileSync('src/pages/LoginCallbackPage.tsx', 'utf8');
  const select = readFileSync('src/pages/ScenarioSelectPage.tsx', 'utf8');
  const store = readFileSync('src/store/authStore.ts', 'utf8');
  const providers = readFileSync('api/auth/providers.ts', 'utf8');

  assert.match(app, /path="\/login\/callback"/);
  assert.match(login, /Kakao로 시작하기/);
  assert.match(login, /게스트로 시작하기/);
  assert.match(login, /loginKakao/);
  assert.match(login, /loginGuest/);
  assert.match(login, /ProviderStatus/);
  assert.match(login, /apiGet<ProviderStatus>\('\/auth\/providers'\)/);
  assert.match(login, /providers\?\.providers\.kakao/);
  assert.match(callback, /refreshUser/);
  assert.match(select, /useAuthStore/);
  assert.match(select, /refreshUser/);
  assert.match(select, /user\.nickname/);
  assert.match(select, /로그아웃/);
  assert.match(store, /loginKakao/);
  assert.match(store, /loginGuest/);
  assert.match(providers, /kakao/);
  assert.match(providers, /guest: hasProvider\('GUEST'\)/);

  assert.equal(login.includes('Kakao로 시작하기'), true);
});

test('로컬 개발 서버는 로그인 API와 프론트엔드를 함께 실행한다', () => {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
    scripts: Record<string, string>;
  };
  const envExample = readFileSync('.env.example', 'utf8');
  const readme = readFileSync('README.md', 'utf8');

  assert.match(packageJson.scripts.dev, /vite/);
  assert.match(packageJson.scripts['dev:vercel'], /vercel dev/);
  assert.match(packageJson.scripts['dev:vercel'], /127\.0\.0\.1:8080/);
  assert.match(envExample, /VITE_API_BASE_URL=http:\/\/localhost:8080\/api/);
  assert.match(envExample, /FRONTEND_URL=http:\/\/localhost:8080/);
  assert.match(envExample, /BACKEND_URL=http:\/\/localhost:8080/);
  assert.match(readme, /http:\/\/localhost:8080/);
  assert.match(readme, /npm run dev:vercel/);
});
