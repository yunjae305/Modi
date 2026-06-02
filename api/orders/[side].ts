import { requireUser } from '../_lib/auth.ts';
import { buy, sell } from '../_lib/trading.ts';
import { allowMethods, fail, handleError, ok, readBody } from '../_lib/http.ts';

const sides = new Set(['buy', 'sell']);

export default async function handler(req: any, res: any) {
  const side = Array.isArray(req.query?.side) ? req.query.side[0] : req.query?.side;

  if (!sides.has(String(side))) {
    return fail(res, 404, '지원하지 않는 주문입니다.');
  }

  if (!allowMethods(req, res, ['POST'])) {
    return;
  }

  try {
    const user = await requireUser(req);
    const body = await readBody(req);
    const stockId = String(body.stockId ?? '');
    const quantity = Number(body.quantity);
    return ok(res, side === 'buy' ? await buy(user, stockId, quantity) : await sell(user, stockId, quantity));
  } catch (error) {
    const fallback = side === 'buy' ? '매수 주문을 처리하지 못했습니다.' : '매도 주문을 처리하지 못했습니다.';
    const message = error instanceof Error ? error.message : fallback;
    if (message.includes('로그인')) {
      return fail(res, 401, message);
    }
    if (message.includes('수량') || message.includes('예수금') || message.includes('보유') || message.includes('종목')) {
      return fail(res, 400, message);
    }
    return handleError(res, error);
  }
}
