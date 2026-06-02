import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { optionalEnv, requiredEnv } from './env.ts';
import { cookie, parseCookies } from './http.ts';
import { eq, insertRow, patchRows, selectOne } from './supabase.ts';
import { createPasswordHash, normalizeCredentialEmail, verifyPasswordHash } from './password.ts';

export const sessionCookieName = 'MODI_SESSION';
export const oauthStateCookieName = 'MODI_OAUTH_STATE';
const initialCash = 1000000000;

export type AuthProvider = 'KAKAO' | 'GUEST' | 'EMAIL';

export interface UserRow {
  id: string;
  provider: AuthProvider;
  provider_id: string;
  email: string | null;
  nickname: string;
  profile_image: string | null;
  password_hash: string | null;
  seed_money: number;
  cash: number;
  created_at: string;
}

export interface OAuthProfile {
  providerId: string;
  email: string | null;
  nickname: string | null;
  profileImage: string | null;
}

function base64url(value: Buffer | string) {
  return Buffer.from(value).toString('base64url');
}

function sign(value: string) {
  return createHmac('sha256', requiredEnv('JWT_SECRET')).update(value).digest('base64url');
}

export function createSessionToken(userId: string) {
  const payload = base64url(JSON.stringify({
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14,
  }));
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string) {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) {
    throw new Error('로그인이 필요합니다.');
  }
  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    throw new Error('로그인이 필요합니다.');
  }
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('로그인이 필요합니다.');
  }
  return String(data.sub);
}

export function sessionCookie(user: UserRow) {
  return cookie(sessionCookieName, createSessionToken(user.id), 60 * 60 * 24 * 14);
}

export function toUserInfo(user: UserRow) {
  return {
    id: user.id,
    provider: user.provider,
    nickname: user.nickname,
    email: user.email,
    profileImage: user.profile_image,
    seedMoney: Number(user.seed_money),
    cash: Number(user.cash),
    createdAt: user.created_at,
  };
}

export async function loginOAuth(provider: AuthProvider, profile: OAuthProfile) {
  const query = `?select=*&provider=eq.${eq(provider)}&provider_id=eq.${eq(profile.providerId)}`;
  const existing = await selectOne<UserRow>('users', query);
  const nickname = profile.nickname && profile.nickname.trim() ? profile.nickname : `${provider} 사용자`;
  if (existing) {
    const rows = await patchRows<UserRow>('users', `?id=eq.${eq(existing.id)}`, {
      email: profile.email,
      nickname,
      profile_image: profile.profileImage,
    });
    return rows[0];
  }
  return insertRow<UserRow>('users', {
    provider,
    provider_id: profile.providerId,
    email: profile.email,
    nickname,
    profile_image: profile.profileImage,
    seed_money: initialCash,
    cash: initialCash,
  });
}

export async function loginGuest() {
  return insertRow<UserRow>('users', {
    provider: 'GUEST',
    provider_id: `guest-${randomUUID()}`,
    email: null,
    nickname: '게스트 투자자',
    profile_image: null,
    seed_money: initialCash,
    cash: initialCash,
  });
}

export async function registerEmail(email: string, password: string, nickname: string) {
  const normalizedEmail = normalizeAndValidateEmail(email);
  validatePassword(password);
  const normalizedNickname = normalizeNickname(nickname);
  const existing = await selectOne<UserRow>('users', `?select=*&provider=eq.EMAIL&provider_id=eq.${eq(normalizedEmail)}`);
  if (existing) {
    throw new Error('이미 가입된 이메일입니다.');
  }
  return insertRow<UserRow>('users', {
    provider: 'EMAIL',
    provider_id: normalizedEmail,
    email: normalizedEmail,
    nickname: normalizedNickname,
    profile_image: null,
    password_hash: await createPasswordHash(password),
    seed_money: initialCash,
    cash: initialCash,
  });
}

export async function loginEmail(email: string, password: string) {
  const normalizedEmail = normalizeAndValidateEmail(email);
  const user = await selectOne<UserRow>('users', `?select=*&provider=eq.EMAIL&provider_id=eq.${eq(normalizedEmail)}`);
  if (!user || !user.password_hash || !(await verifyPasswordHash(password, user.password_hash))) {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
  }
  return user;
}

export async function requireUser(req: any) {
  const token = parseCookies(req)[sessionCookieName];
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }
  const userId = verifySessionToken(token);
  const user = await selectOne<UserRow>('users', `?select=*&id=eq.${eq(userId)}`);
  if (!user) {
    throw new Error('사용자를 찾을 수 없습니다.');
  }
  return user;
}

export function hasProvider(provider: AuthProvider) {
  if (provider === 'EMAIL') {
    return true;
  }
  if (provider === 'KAKAO') {
    return Boolean(optionalEnv('KAKAO_CLIENT_ID'));
  }
  return true;
}

function normalizeAndValidateEmail(email: string) {
  const normalizedEmail = normalizeCredentialEmail(String(email ?? ''));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error('이메일 형식이 올바르지 않습니다.');
  }
  return normalizedEmail;
}

function validatePassword(password: string) {
  if (String(password ?? '').length < 8) {
    throw new Error('비밀번호는 8자 이상이어야 합니다.');
  }
}

function normalizeNickname(nickname: string) {
  const normalizedNickname = String(nickname ?? '').trim();
  if (normalizedNickname.length < 2) {
    throw new Error('닉네임은 2자 이상이어야 합니다.');
  }
  return normalizedNickname;
}
