import { allowMethods, handleError, ok } from '../_lib/http';
import { forceSyncPrices } from '../_lib/trading';

export default async function handler(req: any, res: any) {
  if (!allowMethods(req, res, ['GET', 'POST'])) {
    return;
  }
  try {
    return ok(res, await forceSyncPrices());
  } catch (error) {
    return handleError(res, error);
  }
}
