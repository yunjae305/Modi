import { loginGuest, sessionCookie, toUserInfo } from '../_lib/auth.ts';
import { allowMethods, handleError, ok } from '../_lib/http.ts';

export default async function handler(req: any, res: any) {
  if (!allowMethods(req, res, ['POST'])) {
    return;
  }
  try {
    const user = await loginGuest();
    res.setHeader('Set-Cookie', sessionCookie(user));
    return ok(res, toUserInfo(user));
  } catch (error) {
    return handleError(res, error);
  }
}
