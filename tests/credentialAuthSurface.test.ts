import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('아이디와 비밀번호 회원가입과 로그인을 제공한다', () => {
  const app = readFileSync('src/App.tsx', 'utf8');

  for (const file of [
    'src/pages/LoginPage.tsx',
    'src/store/authStore.ts',
    'src/types/auth.ts',
    'src/services/api.ts',
    'api/auth/register.ts',
    'api/auth/login.ts',
    'api/auth/guest.ts',
    'api/_lib/password.ts',
  ]) {
    assert.equal(existsSync(file), true, file);
  }

  const login = readFileSync('src/pages/LoginPage.tsx', 'utf8');
  const store = readFileSync('src/store/authStore.ts', 'utf8');
  const types = readFileSync('src/types/auth.ts', 'utf8');

  assert.match(app, /path="\/login"/);
  assert.match(login, /아이디/);
  assert.match(login, /비밀번호/);
  assert.match(login, /회원가입/);
  assert.match(login, /로그인/);
  assert.match(login, /게스트로 시작하기/);
  assert.match(store, /loginEmail/);
  assert.match(store, /registerEmail/);
  assert.match(store, /loginGuest/);
  assert.match(types, /EMAIL/);
  assert.match(types, /GUEST/);
});
