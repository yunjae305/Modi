import { callback } from '../../../_lib/oauth.ts';
import { allowMethods, handleError } from '../../../_lib/http.ts';

export default async function handler(req: any, res: any) {
  if (!allowMethods(req, res, ['GET'])) {
    return;
  }
  try {
    return await callback(req, res, 'kakao');
  } catch (error) {
    return handleError(res, error);
  }
}
