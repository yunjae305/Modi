import { registerEmail, sessionCookie, toUserInfo } from '../_lib/auth.ts';
import { allowMethods, fail, handleError, ok, readBody } from '../_lib/http.ts';

export default async function handler(req: any, res: any) {
  if (!allowMethods(req, res, ['POST'])) {
    return;
  }
  try {
    const body = await readBody(req);
    const user = await registerEmail(String(body.email ?? ''), String(body.password ?? ''), String(body.nickname ?? ''));
    res.setHeader('Set-Cookie', sessionCookie(user));
    return ok(res, toUserInfo(user));
  } catch (error) {
    const message = error instanceof Error ? error.message : '회원가입을 처리하지 못했습니다.';
    if (message.includes('이미')) {
      return fail(res, 409, message);
    }
    if (message.includes('이메일') || message.includes('비밀번호') || message.includes('닉네임')) {
      return fail(res, 400, message);
    }
    return handleError(res, error);
  }
}
