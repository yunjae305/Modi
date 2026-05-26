import { randomUUID } from 'node:crypto';
import { backendUrl, frontendUrl, optionalEnv, requiredEnv } from './env.ts';
import { cookie, expiredCookie, parseCookies, redirect } from './http.ts';
import { loginOAuth, oauthStateCookieName, sessionCookie, type AuthProvider, type OAuthProfile } from './auth.ts';

function encode(value: string) {
  return encodeURIComponent(value);
}

function redirectUri(req: any, provider: 'google' | 'kakao') {
  return `${backendUrl(req)}/api/auth/oauth/${provider}/callback`;
}

export function authorize(req: any, res: any, provider: 'google' | 'kakao') {
  const state = randomUUID();
  const authUrl = provider === 'kakao' ? kakaoAuthorizeUrl(req, state) : googleAuthorizeUrl(req, state);
  redirect(res, authUrl, [cookie(oauthStateCookieName, state, 60 * 10)]);
}

export async function callback(req: any, res: any, provider: 'google' | 'kakao') {
  const state = req.query.state;
  const code = req.query.code;
  const savedState = parseCookies(req)[oauthStateCookieName];
  if (!state || !code || savedState !== state) {
    throw new Error('OAuth state가 올바르지 않습니다.');
  }
  const profile = provider === 'kakao' ? await kakaoProfile(req, String(code)) : await googleProfile(req, String(code));
  const user = await loginOAuth(provider.toUpperCase() as AuthProvider, profile);
  redirect(res, `${frontendUrl()}/login/callback`, [
    sessionCookie(user),
    expiredCookie(oauthStateCookieName),
  ]);
}

function kakaoAuthorizeUrl(req: any, state: string) {
  const clientId = requiredEnv('KAKAO_CLIENT_ID');
  return 'https://kauth.kakao.com/oauth/authorize'
    + `?response_type=code&client_id=${encode(clientId)}`
    + `&redirect_uri=${encode(redirectUri(req, 'kakao'))}`
    + `&scope=${encode('profile_nickname profile_image account_email')}`
    + `&state=${encode(state)}`;
}

function googleAuthorizeUrl(req: any, state: string) {
  const clientId = requiredEnv('GOOGLE_CLIENT_ID');
  return 'https://accounts.google.com/o/oauth2/v2/auth'
    + `?response_type=code&client_id=${encode(clientId)}`
    + `&redirect_uri=${encode(redirectUri(req, 'google'))}`
    + `&scope=${encode('openid email profile')}`
    + `&state=${encode(state)}`;
}

async function kakaoProfile(req: any, code: string): Promise<OAuthProfile> {
  const form = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: requiredEnv('KAKAO_CLIENT_ID'),
    redirect_uri: redirectUri(req, 'kakao'),
    code,
  });
  const secret = optionalEnv('KAKAO_CLIENT_SECRET');
  if (secret) {
    form.set('client_secret', secret);
  }
  const token = await tokenRequest('https://kauth.kakao.com/oauth/token', form);
  const profile = await bearerJson('https://kapi.kakao.com/v2/user/me', token.access_token);
  const account = profile.kakao_account ?? {};
  const kakaoProfile = account.profile ?? {};
  return {
    providerId: String(profile.id),
    email: account.email ?? null,
    nickname: kakaoProfile.nickname ?? null,
    profileImage: kakaoProfile.profile_image_url ?? null,
  };
}

async function googleProfile(req: any, code: string): Promise<OAuthProfile> {
  const form = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: requiredEnv('GOOGLE_CLIENT_ID'),
    client_secret: requiredEnv('GOOGLE_CLIENT_SECRET'),
    redirect_uri: redirectUri(req, 'google'),
    code,
  });
  const token = await tokenRequest('https://oauth2.googleapis.com/token', form);
  const profile = await bearerJson('https://openidconnect.googleapis.com/v1/userinfo', token.access_token);
  return {
    providerId: String(profile.sub),
    email: profile.email ?? null,
    nickname: profile.name ?? null,
    profileImage: profile.picture ?? null,
  };
}

async function tokenRequest(url: string, form: URLSearchParams) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error_description ?? body.error ?? '토큰 발급에 실패했습니다.');
  }
  return body;
}

async function bearerJson(url: string, accessToken: string) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.msg ?? body.error_description ?? '프로필을 불러오지 못했습니다.');
  }
  return body;
}
