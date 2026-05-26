import { useEffect, useState } from 'react';
import type { Scenario, ScenarioStock } from '../types';
import { useTradeStore } from '../store/tradeStore';

interface ChartDataState {
  data: ScenarioStock[];
  loading: boolean;
  error: string | null;
}

export function useChartData(scenario: Scenario | null): ChartDataState {
  const initScenario = useTradeStore((state) => state.initScenario);
  const [state, setState] = useState<ChartDataState>({
    data: [],
    loading: Boolean(scenario),
    error: null,
  });

  useEffect(() => {
    if (!scenario) {
      setState({ data: [], loading: false, error: null });
      return;
    }
    let ignore = false;
    setState({ data: [], loading: true, error: null });
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
        const data = raw as ScenarioStock[];
        if (data.length < 20) {
          throw new Error('대표 종목 데이터가 부족합니다.');
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
      ignore = true;
    };
  }, [initScenario, scenario]);

  return state;
}
