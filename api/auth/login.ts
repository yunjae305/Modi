import { loginEmail, sessionCookie, toUserInfo } from '../_lib/auth.ts';
import { allowMethods, fail, handleError, ok, readBody } from '../_lib/http.ts';

export default async function handler(req: any, res: any) {
  if (!allowMethods(req, res, ['POST'])) {
    return;
  }
  try {
    const body = await readBody(req);
    const user = await loginEmail(String(body.email ?? ''), String(body.password ?? ''));
    res.setHeader('Set-Cookie', sessionCookie(user));
    return ok(res, toUserInfo(user));
  } catch (error) {
    const message = error instanceof Error ? error.message : '로그인을 처리하지 못했습니다.';
    if (message.includes('이메일') || message.includes('비밀번호')) {
      return fail(res, 400, message);
    }
    return handleError(res, error);
  }
}
