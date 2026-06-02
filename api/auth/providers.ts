import { hasProvider } from '../_lib/auth.ts';
import { allowMethods, handleError, ok } from '../_lib/http.ts';

export default async function handler(req: any, res: any) {
  if (!allowMethods(req, res, ['GET'])) {
    return;
  }
  try {
    return ok(res, {
      providers: {
        email: hasProvider('EMAIL'),
        kakao: hasProvider('KAKAO'),
        guest: hasProvider('GUEST'),
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
}
