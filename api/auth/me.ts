import { requireUser, toUserInfo } from '../_lib/auth';
import { allowMethods, fail, handleError, ok } from '../_lib/http';

export default async function handler(req: any, res: any) {
  if (!allowMethods(req, res, ['GET'])) {
    return;
  }
  try {
    const user = await requireUser(req);
    return ok(res, toUserInfo(user));
  } catch (error) {
    const message = error instanceof Error ? error.message : '로그인이 필요합니다.';
    if (message.includes('로그인')) {
      return fail(res, 401, message);
    }
    return handleError(res, error);
  }
}
