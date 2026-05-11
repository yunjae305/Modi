import type { Scenario } from '../types';

export const scenarios: Scenario[] = [
  {
    id: 'corona',
    title: 'V자 반등의 정석',
    subtitle: '2020년 코로나 폭락장',
    dataFile: '/data/kospi_2020.json',
    market: 'KOSPI',
    period: '2020.01 ~ 2020.12',
    lesson: '공포에 매수하는 법',
    initialCash: 10000000,
    revealText: '정체는 2020년 코로나 폭락장 KOSPI였습니다. 공포가 가장 컸던 시점 뒤에 강한 반등이 숨어 있었습니다.',
  },
  {
    id: 'subprime',
    title: '끝없는 하락의 공포',
    subtitle: '2008년 서브프라임 사태',
    dataFile: '/data/sp500_2008.json',
    market: 'S&P 500',
    period: '2007.01 ~ 2009.12',
    lesson: '손절매의 중요성 체감',
    initialCash: 10000000,
    revealText: '정체는 2008년 서브프라임 금융위기 S&P 500이었습니다. 떨어지는 칼날 앞에서 현금 관리가 얼마나 중요한지 보여줍니다.',
  },
  {
    id: 'dotcom',
    title: '버블의 끝',
    subtitle: '2000년 닷컴버블 붕괴',
    dataFile: '/data/nasdaq_2000.json',
    market: 'NASDAQ',
    period: '1999.01 ~ 2002.12',
    lesson: '고점에서 탐욕을 경계하는 법',
    initialCash: 10000000,
    revealText: '정체는 2000년 닷컴버블 붕괴 NASDAQ이었습니다. 모두가 낙관할 때도 버블의 끝은 갑자기 찾아올 수 있습니다.',
  },
];

export const practiceScenario: Scenario = {
  id: 'practice',
  title: '10억 모의투자',
  subtitle: '랭킹 반영 없는 자유 연습',
  dataFile: '/data/kospi_2020.json',
  market: 'KOSPI 자유 연습장',
  period: '2020.01 ~ 2020.12',
  lesson: '초기금 10억 원으로 매수와 매도를 자유롭게 연습',
  initialCash: 1000000000,
  revealText: '10억 모의투자 연습이 완료되었습니다. 시나리오 결과와 별개로 큰 자금을 운용할 때 현금 비중과 진입 타이밍이 어떻게 달라지는지 확인해보세요.',
};
