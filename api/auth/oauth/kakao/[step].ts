import { authorize, callback } from '../../../_lib/oauth.ts';
import { allowMethods, fail, handleError } from '../../../_lib/http.ts';

const steps = new Set(['authorize', 'callback']);

export default async function handler(req: any, res: any) {
  const step = Array.isArray(req.query?.step) ? req.query.step[0] : req.query?.step;

  if (!steps.has(String(step))) {
    return fail(res, 404, '지원하지 않는 Kakao OAuth 요청입니다.');
  }

  if (!allowMethods(req, res, ['GET'])) {
    return;
  }

  try {
    return step === 'authorize' ? authorize(req, res) : await callback(req, res);
  } catch (error) {
    return handleError(res, error);
  }
}
