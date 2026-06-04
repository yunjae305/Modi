// Modi 시나리오 차트 데이터 훅
import { useEffect, useState } from 'react';
import type { Scenario, ScenarioStock } from '../types';
import { useTradeContext } from '../context/TradeContext';
import { compressScenarioStocks } from '../utils/marketTime';

interface ChartDataState {
  data: ScenarioStock[];
  loading: boolean;
  error: string | null;
}

// 시나리오 JSON 로딩 훅
export function useChartData(scenario: Scenario | null): ChartDataState {
  const { initScenario } = useTradeContext();
  const [state, setState] = useState<ChartDataState>({
    data: [],
    loading: Boolean(scenario),
    error: null,
  });

  useEffect(() => {
    // 시나리오 없음 상태 초기화
    if (!scenario) {
      setState({ data: [], loading: false, error: null });
      return;
    }
    let ignore = false;
    setState({ data: [], loading: true, error: null });
    // public/data 정적 JSON 로드
    fetch(scenario.dataFile)
      .then((response) => {
        if (!response.ok) {
          throw new Error('데이터 파일을 불러오지 못했습니다.');
        }
        return response.json();
      })
      .then((raw: unknown) => {
        if (!Array.isArray(raw)) {
          throw new Error('데이터 형식이 올바르지 않습니다.');
        }
        const rawData = raw as ScenarioStock[];
        if (rawData.length < 20) {
          throw new Error('대표 종목 데이터가 부족합니다.');
        }
        // 과거 데이터 압축
        const data = compressScenarioStocks(rawData);
        if (data.some((stock) => stock.bars.length === 0)) {
          throw new Error('종목별 차트 데이터가 부족합니다.');
        }
        if (!ignore) {
          initScenario(scenario, data);
          setState({ data, loading: false, error: null });
        }
      })
      .catch((error: Error) => {
        if (!ignore) {
          setState({ data: [], loading: false, error: error.message });
        }
      });
    return () => {
      // 늦게 도착한 fetch 결과 차단
      ignore = true;
    };
  }, [initScenario, scenario]);

  return state;
}
