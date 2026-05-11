import { requireUser } from '../_lib/auth';
import { allowMethods, fail, handleError, ok, readBody } from '../_lib/http';
import { sell } from '../_lib/trading';

export default async function handler(req: any, res: any) {
  if (!allowMethods(req, res, ['POST'])) {
    return;
  }
  try {
    const user = await requireUser(req);
    const body = await readBody(req);
    return ok(res, await sell(user, String(body.stockId), Number(body.quantity)));
  } catch (error) {
    const message = error instanceof Error ? error.message : '요청을 처리하지 못했습니다.';
    if (message.includes('로그인')) {
      return fail(res, 401, message);
    }
    if (message.includes('보유') || message.includes('수량') || message.includes('종목')) {
      return fail(res, 400, message);
    }
    return handleError(res, error);
  }
}
