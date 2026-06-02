import { rankings } from './_lib/trading.ts';
import { allowMethods, handleError, ok } from './_lib/http.ts';

export default async function handler(req: any, res: any) {
  if (!allowMethods(req, res, ['GET'])) {
    return;
  }
  try {
    return ok(res, await rankings());
  } catch (error) {
    return handleError(res, error);
  }
}
