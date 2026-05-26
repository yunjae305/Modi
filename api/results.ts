import { requireUser } from './_lib/auth';
import { allowMethods, fail, handleError, ok, readBody } from './_lib/http';
import { eq, insertRow, selectRows } from './_lib/supabase';

interface ResultRecordRow {
  id: string;
  user_id: string;
  scenario_id: string;
  final_asset: number;
  profit_rate: number;
  max_drawdown: number;
  trade_count: number;
  investor_type: 'lion' | 'turtle' | 'rabbit' | 'monkey';
  created_at: string;
}

const investorTypes = ['lion', 'turtle', 'rabbit', 'monkey'];

export default async function handler(req: any, res: any) {
  if (!allowMethods(req, res, ['GET', 'POST'])) {
    return;
  }
  try {
    const user = await requireUser(req);
    if (req.method === 'GET') {
      const rows = await selectRows<ResultRecordRow>(
        'result_records',
        `?select=*&user_id=eq.${eq(user.id)}&order=created_at.desc&limit=5`,
      );
      return ok(res, rows.map(toResultRecord));
    }
    const body = await readBody(req);
    const row = await insertRow<ResultRecordRow>('result_records', {
      user_id: user.id,
      scenario_id: validateScenarioId(body.scenarioId),
      final_asset: validateNonNegativeInteger(body.finalAsset, '최종 자산'),
      profit_rate: validateFiniteNumber(body.profitRate, '수익률'),
      max_drawdown: validateFiniteNumber(body.maxDrawdown, '최대 낙폭'),
      trade_count: validateNonNegativeInteger(body.tradeCount, '매매 횟수'),
      investor_type: validateInvestorType(body.investorType),
    });
    return ok(res, toResultRecord(row));
  } catch (error) {
    const message = error instanceof Error ? error.message : '결과를 처리하지 못했습니다.';
    if (message.includes('로그인')) {
      return fail(res, 401, message);
    }
    if (message.includes('필요') || message.includes('올바르지')) {
      return fail(res, 400, message);
    }
    return handleError(res, error);
  }
}

function toResultRecord(row: ResultRecordRow) {
  return {
    id: row.id,
    scenarioId: row.scenario_id,
    finalAsset: Number(row.final_asset),
    profitRate: Number(row.profit_rate),
    maxDrawdown: Number(row.max_drawdown),
    tradeCount: Number(row.trade_count),
    investorType: row.investor_type,
    createdAt: row.created_at,
  };
}

function validateScenarioId(value: unknown) {
  const scenarioId = String(value ?? '').trim();
  if (!scenarioId) {
    throw new Error('시나리오 ID가 필요합니다.');
  }
  return scenarioId;
}

function validateFiniteNumber(value: unknown, label: string) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    throw new Error(`${label} 값이 올바르지 않습니다.`);
  }
  return numberValue;
}

function validateNonNegativeInteger(value: unknown, label: string) {
  const numberValue = validateFiniteNumber(value, label);
  if (numberValue < 0) {
    throw new Error(`${label} 값이 올바르지 않습니다.`);
  }
  return Math.round(numberValue);
}

function validateInvestorType(value: unknown): ResultRecordRow['investor_type'] {
  const investorType = String(value ?? '');
  if (!investorTypes.includes(investorType)) {
    throw new Error('투자 성향 값이 올바르지 않습니다.');
  }
  return investorType as ResultRecordRow['investor_type'];
}
