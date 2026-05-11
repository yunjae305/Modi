import { requireUser } from './_lib/auth';
import { allowMethods, fail, handleError, ok } from './_lib/http';
import { portfolio } from './_lib/trading';

export default async function handler(req: any, res: any) {
  if (!allowMethods(req, res, ['GET'])) {
    return;
  }
  try {
    const user = await requireUser(req);
    return ok(res, await portfolio(user));
  } catch (error) {
    const message = error instanceof Error ? error.message : '요청을 처리하지 못했습니다.';
    if (message.includes('로그인')) {
      return fail(res, 401, message);
    }
    return handleError(res, error);
  }
}
