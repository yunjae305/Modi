import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTradeStore } from '../store/tradeStore';

export function useSimulation(): void {
  const navigate = useNavigate();
  const isFinished = useTradeStore((state) => state.isFinished);

  useEffect(() => {
    if (isFinished) {
      navigate('/result');
    }
  }, [isFinished, navigate]);
}
