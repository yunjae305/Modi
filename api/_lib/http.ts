import { isProduction } from './env.ts';

export function ok(res: any, data: unknown) {
  noStore(res);
  return res.status(200).json({ success: true, data, error: null });
}

export function fail(res: any, status: number, error: string) {
  noStore(res);
  return res.status(status).json({ success: false, data: null, error });
}

export function allowMethods(req: any, res: any, methods: string[]) {
  if (!methods.includes(req.method)) {
    res.setHeader('Allow', methods.join(', '));
    fail(res, 405, '허용되지 않는 요청입니다.');
    return false;
  }
  return true;
}

export function redirect(res: any, location: string, cookies: string[] = []) {
  noStore(res);
  if (cookies.length > 0) {
    res.setHeader('Set-Cookie', cookies);
  }
  res.statusCode = 302;
  res.setHeader('Location', location);
  res.end();
}

export function cookie(name: string, value: string, maxAge: number) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ];
  if (isProduction()) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

export function expiredCookie(name: string) {
  return cookie(name, '', 0);
}

export function parseCookies(req: any) {
  const header = req.headers.cookie ?? '';
  return String(header)
    .split(';')
    .map((value) => value.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((cookies, pair) => {
      const index = pair.indexOf('=');
      if (index > -1) {
        cookies[pair.slice(0, index)] = decodeURIComponent(pair.slice(index + 1));
      }
      return cookies;
    }, {});
}

export async function readBody(req: any) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    return JSON.parse(req.body);
  }
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

export function handleError(res: any, error: unknown) {
  const message = error instanceof Error ? error.message : '요청을 처리하지 못했습니다.';
  return fail(res, 500, message);
}

function noStore(res: any) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Vary', 'Cookie');
}
