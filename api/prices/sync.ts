import { forceSyncPrices } from '../_lib/trading.ts';
import { allowMethods, handleError, ok } from '../_lib/http.ts';

export default async function handler(req: any, res: any) {
  if (!allowMethods(req, res, ['POST'])) {
    return;
  }
  try {
    return ok(res, await forceSyncPrices());
  } catch (error) {
    return handleError(res, error);
  }
}
