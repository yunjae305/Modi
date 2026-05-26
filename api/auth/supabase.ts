import { loginSupabaseAuth, sessionCookie, toUserInfo } from '../_lib/auth';
import { allowMethods, fail, handleError, ok, readBody } from '../_lib/http';

export default async function handler(req: any, res: any) {
  if (!allowMethods(req, res, ['POST'])) {
    return;
  }
  try {
    const body = await readBody(req);
    const user = await loginSupabaseAuth(String(body.accessToken ?? ''));
    res.setHeader('Set-Cookie', sessionCookie(user));
    return ok(res, toUserInfo(user));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Supabase 로그인을 처리하지 못했습니다.';
    if (message.includes('Supabase') || message.includes('로그인') || message.includes('token')) {
      return fail(res, 401, message);
    }
    return handleError(res, error);
  }
}
