// Modi 시뮬레이션 종료 라우팅 훅
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTradeContext } from '../context/TradeContext';

// 시뮬레이션 종료 감지 훅
export function useSimulation(): void {
  const navigate = useNavigate();
  const { isFinished } = useTradeContext();

  useEffect(() => {
    // isFinished -> result 라우팅
    if (isFinished) {
      navigate('/result');
    }
  }, [isFinished, navigate]);
}
