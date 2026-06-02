import { requireUser } from './_lib/auth.ts';
import { executions, listStocks, portfolio, rankings, scenarioRankings } from './_lib/trading.ts';
import { allowMethods, fail, handleError, ok } from './_lib/http.ts';

const resources = new Set(['stocks', 'portfolio', 'executions', 'rankings', 'scenario-rankings']);

export default async function handler(req: any, res: any) {
  const resource = Array.isArray(req.query?.resource) ? req.query.resource[0] : req.query?.resource;

  if (!resources.has(String(resource))) {
    return fail(res, 404, '지원하지 않는 API입니다.');
  }

  if (!allowMethods(req, res, ['GET'])) {
    return;
  }

  try {
    if (resource === 'stocks') {
      return ok(res, await listStocks());
    }
    if (resource === 'rankings') {
      return ok(res, await rankings());
    }
    if (resource === 'scenario-rankings') {
      return ok(res, await scenarioRankings());
    }

    const user = await requireUser(req);
    if (resource === 'portfolio') {
      return ok(res, await portfolio(user));
    }
    return ok(res, await executions(user));
  } catch (error) {
    const message = error instanceof Error ? error.message : '요청을 처리하지 못했습니다.';
    if (message.includes('로그인')) {
      return fail(res, 401, message);
    }
    return handleError(res, error);
  }
}
