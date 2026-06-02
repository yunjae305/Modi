import { requireUser } from './_lib/auth.ts';
import { executions } from './_lib/trading.ts';
import { allowMethods, fail, handleError, ok } from './_lib/http.ts';

export default async function handler(req: any, res: any) {
  if (!allowMethods(req, res, ['GET'])) {
    return;
  }
  try {
    const user = await requireUser(req);
    return ok(res, await executions(user));
  } catch (error) {
    const message = error instanceof Error ? error.message : '매매 기록을 불러오지 못했습니다.';
    if (message.includes('로그인')) {
      return fail(res, 401, message);
    }
    return handleError(res, error);
  }
}
