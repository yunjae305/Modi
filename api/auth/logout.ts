import { sessionCookieName } from '../_lib/auth.ts';
import { allowMethods, expiredCookie, ok } from '../_lib/http.ts';

export default async function handler(req: any, res: any) {
  if (!allowMethods(req, res, ['POST'])) {
    return;
  }
  res.setHeader('Set-Cookie', expiredCookie(sessionCookieName));
  return ok(res, 'success');
}
