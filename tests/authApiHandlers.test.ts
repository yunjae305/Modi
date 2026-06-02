import test from 'node:test';
import assert from 'node:assert/strict';
import registerHandler from '../api/auth/register.ts';
import loginHandler from '../api/auth/login.ts';
import guestHandler from '../api/auth/guest.ts';
import providersHandler from '../api/auth/providers.ts';
import kakaoHandler from '../api/auth/oauth/kakao/[step].ts';
import { createPasswordHash } from '../api/_lib/password.ts';

function setAuthEnv() {
  process.env.SUPABASE_URL = 'https://supabase.test';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
  process.env.JWT_SECRET = 'local-test-secret-for-auth-handlers';
  process.env.KAKAO_CLIENT_ID = 'kakao-client';
  process.env.KAKAO_CLIENT_SECRET = 'kakao-secret';
  process.env.FRONTEND_URL = 'http://localhost:8080';
  process.env.BACKEND_URL = 'http://localhost:8080';
}

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}

function createRes() {
  const headers = new Map<string, unknown>();
  return {
    statusCode: 200,
    body: undefined as unknown,
    ended: false,
    setHeader(name: string, value: unknown) {
      headers.set(name.toLowerCase(), value);
    },
    getHeader(name: string) {
      return headers.get(name.toLowerCase());
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.body = body;
      this.ended = true;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    },
  };
}

function userRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    provider: 'EMAIL',
    provider_id: 'user@example.com',
    email: 'user@example.com',
    nickname: '테스터',
    profile_image: null,
    password_hash: null,
    seed_money: 1000000000,
    cash: 1000000000,
    created_at: '2026-05-26T00:00:00.000Z',
    ...overrides,
  };
}

function assertNoStore(res: ReturnType<typeof createRes>) {
  assert.equal(res.getHeader('cache-control'), 'no-store, max-age=0');
  assert.equal(res.getHeader('vary'), 'Cookie');
}

test('아이디와 비밀번호 회원가입 API가 사용자와 세션 쿠키를 반환한다', async () => {
  setAuthEnv();
  const calls: { url: string; init?: RequestInit }[] = [];
  globalThis.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
    const href = String(url);
    calls.push({ url: href, init });
    if (href.includes('/rest/v1/users?select=*&provider=eq.EMAIL')) {
      return jsonResponse([]);
    }
    if (href.endsWith('/rest/v1/users?select=*')) {
      const body = JSON.parse(String(init?.body));
      return jsonResponse([userRow({
        provider_id: body.provider_id,
        email: body.email,
        nickname: body.nickname,
        password_hash: body.password_hash,
      })]);
    }
    throw new Error(`Unexpected fetch ${href}`);
  };

  const req = {
    method: 'POST',
    body: {
      email: ' USER@example.COM ',
      password: 'password123',
      nickname: '테스터',
    },
  };
  const res = createRes();

  await registerHandler(req, res);

  assert.equal(res.statusCode, 200);
  assertNoStore(res);
  assert.equal((res.body as any).success, true);
  assert.equal((res.body as any).data.email, 'user@example.com');
  assert.match(String(res.getHeader('set-cookie')), /MODI_SESSION=/);
  const inserted = JSON.parse(String(calls.find((call) => call.init?.method === 'POST')?.init?.body));
  assert.notEqual(inserted.password_hash.includes('password123'), true);
});

test('providers API가 아이디, Kakao, 게스트 로그인을 노출한다', async () => {
  setAuthEnv();
  const req = { method: 'GET' };
  const res = createRes();

  await providersHandler(req, res);

  assert.equal(res.statusCode, 200);
  assertNoStore(res);
  assert.deepEqual((res.body as any).data.providers, {
    email: true,
    kakao: true,
    guest: true,
  });
});

test('게스트 로그인 API가 사용자와 세션 쿠키를 반환한다', async () => {
  setAuthEnv();
  globalThis.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
    const href = String(url);
    if (href.endsWith('/rest/v1/users?select=*')) {
      const body = JSON.parse(String(init?.body));
      return jsonResponse([userRow({
        id: 'guest-user-1',
        provider: 'GUEST',
        provider_id: body.provider_id,
        email: null,
        nickname: body.nickname,
      })]);
    }
    throw new Error(`Unexpected fetch ${href}`);
  };
  const req = { method: 'POST' };
  const res = createRes();

  await guestHandler(req, res);

  assert.equal(res.statusCode, 200);
  assertNoStore(res);
  assert.equal((res.body as any).data.provider, 'GUEST');
  assert.match(String(res.getHeader('set-cookie')), /MODI_SESSION=/);
});

test('아이디와 비밀번호 로그인 API가 저장된 해시를 검증하고 세션 쿠키를 반환한다', async () => {
  setAuthEnv();
  const passwordHash = await createPasswordHash('password123');
  globalThis.fetch = async (url: RequestInfo | URL) => {
    const href = String(url);
    if (href.includes('/rest/v1/users?select=*&provider=eq.EMAIL')) {
      return jsonResponse([userRow({ password_hash: passwordHash })]);
    }
    throw new Error(`Unexpected fetch ${href}`);
  };

  const req = {
    method: 'POST',
    body: {
      email: 'user@example.com',
      password: 'password123',
    },
  };
  const res = createRes();

  await loginHandler(req, res);

  assert.equal(res.statusCode, 200);
  assertNoStore(res);
  assert.equal((res.body as any).success, true);
  assert.equal((res.body as any).data.provider, 'EMAIL');
  assert.match(String(res.getHeader('set-cookie')), /MODI_SESSION=/);
});

test('아이디와 비밀번호 로그인 API가 잘못된 비밀번호를 거부한다', async () => {
  setAuthEnv();
  const passwordHash = await createPasswordHash('password123');
  globalThis.fetch = async (url: RequestInfo | URL) => {
    const href = String(url);
    if (href.includes('/rest/v1/users?select=*&provider=eq.EMAIL')) {
      return jsonResponse([userRow({ password_hash: passwordHash })]);
    }
    throw new Error(`Unexpected fetch ${href}`);
  };

  const req = {
    method: 'POST',
    body: {
      email: 'user@example.com',
      password: 'wrong-password',
    },
  };
  const res = createRes();

  await loginHandler(req, res);

  assert.equal(res.statusCode, 400);
  assertNoStore(res);
  assert.equal((res.body as any).success, false);
  assert.equal(res.getHeader('set-cookie'), undefined);
});

test('Kakao authorize API가 카카오 인증 URL과 state 쿠키를 반환한다', async () => {
  setAuthEnv();
  const req = { method: 'GET', query: { step: 'authorize' }, headers: { host: 'localhost:8080' } };
  const res = createRes();

  await kakaoHandler(req, res);

  assert.equal(res.statusCode, 302);
  assertNoStore(res);
  assert.match(String(res.getHeader('location')), /^https:\/\/kauth\.kakao\.com\/oauth\/authorize/);
  assert.match(String(res.getHeader('location')), /client_id=kakao-client/);
  assert.match(String(res.getHeader('location')), /redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Fauth%2Foauth%2Fkakao%2Fcallback/);
  assert.match(String(res.getHeader('set-cookie')), /MODI_OAUTH_STATE=/);
});

test('Kakao callback API가 카카오 프로필을 사용자 세션으로 전환한다', async () => {
  setAuthEnv();
  const state = 'state-123';
  globalThis.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
    const href = String(url);
    if (href === 'https://kauth.kakao.com/oauth/token') {
      const form = init?.body as URLSearchParams;
      assert.equal(form.get('code'), 'auth-code');
      assert.equal(form.get('client_id'), 'kakao-client');
      return jsonResponse({ access_token: 'kakao-token' });
    }
    if (href === 'https://kapi.kakao.com/v2/user/me') {
      assert.equal((init?.headers as Record<string, string>).Authorization, 'Bearer kakao-token');
      return jsonResponse({
        id: 12345,
        kakao_account: {
          email: 'kakao@example.com',
          profile: {
            nickname: '카카오 사용자',
            profile_image_url: 'https://example.com/profile.png',
          },
        },
      });
    }
    if (href.includes('/rest/v1/users?select=*&provider=eq.KAKAO')) {
      return jsonResponse([]);
    }
    if (href.endsWith('/rest/v1/users?select=*')) {
      const body = JSON.parse(String(init?.body));
      return jsonResponse([userRow({
        id: 'kakao-user-1',
        provider: 'KAKAO',
        provider_id: body.provider_id,
        email: body.email,
        nickname: body.nickname,
        profile_image: body.profile_image,
      })]);
    }
    throw new Error(`Unexpected fetch ${href}`);
  };
  const req = {
    method: 'GET',
    query: {
      step: 'callback',
      code: 'auth-code',
      state,
    },
    headers: {
      host: 'localhost:8080',
      cookie: `MODI_OAUTH_STATE=${state}`,
    },
  };
  const res = createRes();

  await kakaoHandler(req, res);

  assert.equal(res.statusCode, 302);
  assertNoStore(res);
  assert.equal(res.getHeader('location'), 'http://localhost:8080/login/callback');
  const cookies = res.getHeader('set-cookie') as string[];
  assert.equal(cookies.some((value) => value.includes('MODI_SESSION=')), true);
  assert.equal(cookies.some((value) => value.includes('MODI_OAUTH_STATE=')), true);
});
