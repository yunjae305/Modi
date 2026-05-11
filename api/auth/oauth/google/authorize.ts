import { authorize } from '../../../_lib/oauth';
import { allowMethods, handleError } from '../../../_lib/http';

export default async function handler(req: any, res: any) {
  if (!allowMethods(req, res, ['GET'])) {
    return;
  }
  try {
    return authorize(req, res, 'google');
  } catch (error) {
    return handleError(res, error);
  }
}
