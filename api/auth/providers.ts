import { hasProvider } from '../_lib/auth';
import { allowMethods, handleError, ok } from '../_lib/http';

export default async function handler(req: any, res: any) {
  if (!allowMethods(req, res, ['GET'])) {
    return;
  }
  try {
    return ok(res, {
      providers: {
        google: hasProvider('GOOGLE'),
        kakao: hasProvider('KAKAO'),
        guest: true,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
}
