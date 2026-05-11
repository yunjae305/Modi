import { sessionCookieName } from '../_lib/auth';
import { allowMethods, expiredCookie, ok } from '../_lib/http';

export default async function handler(req: any, res: any) {
  if (!allowMethods(req, res, ['POST'])) {
    return;
  }
  res.setHeader('Set-Cookie', expiredCookie(sessionCookieName));
  return ok(res, 'success');
}
