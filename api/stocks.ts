import { allowMethods, handleError, ok } from './_lib/http';
import { listStocks } from './_lib/trading';

export default async function handler(req: any, res: any) {
  if (!allowMethods(req, res, ['GET'])) {
    return;
  }
  try {
    return ok(res, await listStocks(true));
  } catch (error) {
    return handleError(res, error);
  }
}
