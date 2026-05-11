import type { InvestorType } from '../types';

interface InvestorResult {
  type: InvestorType;
  emoji: string;
  label: string;
  feedback: string;
}

export function getInvestorType(rate: number): InvestorResult {
  if (rate >= 0.2) {
    return {
      type: 'lion',
      emoji: '🦁',
      label: '대담한 역발상 투자자',
      feedback: '공포가 곧 기회임을 아는 당신, 워런 버핏의 재림!',
    };
  }
  if (rate >= 0) {
    return {
      type: 'turtle',
      emoji: '🐢',
      label: '안정 추구형 투자자',
      feedback: '흔들리지 않는 멘탈, 장기 투자에 최적화된 성향입니다.',
    };
  }
  if (rate >= -0.2) {
    return {
      type: 'rabbit',
      emoji: '🐇',
      label: '눈치 보기형 투자자',
      feedback: '조금 더 과감하게! 손절 타이밍을 연습해보세요.',
    };
  }
  return {
    type: 'monkey',
    emoji: '🙈',
    label: 'FOMO형 투자자',
    feedback: '뇌동매매 주의! 감정보다 차트를 먼저 보는 연습이 필요합니다.',
  };
}
