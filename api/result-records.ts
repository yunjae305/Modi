import { requireUser } from './_lib/auth.ts';
import { saveResultRecord } from './_lib/trading.ts';
import { allowMethods, fail, handleError, ok, readBody } from './_lib/http.ts';

export default async function handler(req: any, res: any) {
  if (!allowMethods(req, res, ['POST'])) {
    return;
  }

  try {
    const user = await requireUser(req);
    const body = await readBody(req);
    const scenarioId = String(body.scenarioId ?? '');
    const validScenarios = new Set(['corona', 'subprime', 'dotcom', 'practice']);
    if (!validScenarios.has(scenarioId)) {
      return fail(res, 400, '유효하지 않은 시나리오입니다.');
    }
    const validInvestorTypes = new Set(['lion', 'turtle', 'rabbit', 'monkey']);
    const investorType = String(body.investorType ?? '');
    if (!validInvestorTypes.has(investorType)) {
      return fail(res, 400, '유효하지 않은 투자자 유형입니다.');
    }
    await saveResultRecord(user, {
      scenarioId,
      finalAsset: Number(body.finalAsset),
      profitRate: Number(body.profitRate),
      maxDrawdown: Number(body.maxDrawdown),
      tradeCount: Math.max(0, Math.floor(Number(body.tradeCount))),
      investorType,
    });
    return ok(res, { saved: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : '저장하지 못했습니다.';
    if (message.includes('로그인')) {
      return fail(res, 401, message);
    }
    return handleError(res, error);
  }
}
