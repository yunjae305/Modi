import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CandleChart } from '../components/chart/CandleChart';
import { Button } from '../components/ui/Button';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Mascot } from '../components/ui/Mascot';
import { learningTerms } from '../data/learningTerms';
import type { OHLCVBar } from '../types';
import { formatKRW } from '../utils/format';

const tutorialData: OHLCVBar[] = [
  { date: '2020-01-02', open: 1000, high: 1050, low: 980, close: 1030, volume: 120000 },
  { date: '2020-01-03', open: 1030, high: 1080, low: 1010, close: 1070, volume: 132000 },
  { date: '2020-01-06', open: 1070, high: 1090, low: 990, close: 1005, volume: 180000 },
  { date: '2020-01-07', open: 1005, high: 1020, low: 940, close: 960, volume: 210000 },
  { date: '2020-01-08', open: 960, high: 990, low: 930, close: 985, volume: 178000 },
  { date: '2020-01-09', open: 985, high: 1060, low: 980, close: 1045, volume: 160000 },
  { date: '2020-01-10', open: 1045, high: 1100, low: 1035, close: 1090, volume: 142000 },
  { date: '2020-01-13', open: 1090, high: 1115, low: 1050, close: 1060, volume: 156000 },
  { date: '2020-01-14', open: 1060, high: 1120, low: 1055, close: 1110, volume: 149000 },
  { date: '2020-01-15', open: 1110, high: 1160, low: 1100, close: 1145, volume: 171000 },
];

export function TutorialPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState('');
  const [complete, setComplete] = useState(false);
  const [termIndex, setTermIndex] = useState(0);
  const [termMessage, setTermMessage] = useState('');
  const currentPrice = tutorialData[tutorialData.length - 1].close;
  const currentTerm = learningTerms[termIndex % learningTerms.length];
  const quizOptions = Array.from({ length: 4 }, (_, index) => learningTerms[(termIndex + index) % learningTerms.length]);

  const submitPractice = () => {
    if (qty === 10) {
      setComplete(true);
      setMessage('성공! 시장가 10주 매수가 체결되었습니다.');
      return;
    }
    setMessage('지시문에 맞게 10주를 입력해보세요.');
  };

  const submitTermAnswer = (word: string) => {
    if (word === currentTerm.word) {
      setTermMessage(`${word} 정답입니다.`);
      return;
    }
    setTermMessage(`${word}이 아니라 ${currentTerm.word}입니다.`);
  };

  const nextTerm = () => {
    setTermIndex((value) => (value + 1) % learningTerms.length);
    setTermMessage('');
  };

  return (
    <main className="min-h-screen px-5 py-5">
      <section className="mx-auto max-w-7xl rounded-2xl border border-[#dfe3ee] bg-white shadow-card">
        <header className="flex items-center justify-between border-b border-[#edf0f6] px-6 py-5">
          <BrandLogo />
          <div className="hidden items-center gap-12 text-sm font-extrabold text-[#111827] md:flex">
            <span className={step === 1 ? 'text-[#5b45f2]' : 'text-[#14a86b]'}>{step === 1 ? '1' : '✓'} 차트의 언어 배우기</span>
            <span className={step === 2 ? 'text-[#5b45f2]' : 'text-[#a3aab8]'}>2 최종 훈련</span>
          </div>
          <button className="text-sm font-extrabold text-[#667085] hover:text-[#111827]" onClick={() => navigate('/')}>
            처음으로
          </button>
        </header>
        <div className="px-6 py-7">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="chart"
              className="grid gap-7 lg:grid-cols-[1fr_1.4fr]"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <aside className="flex flex-col">
                <p className="text-lg font-black text-[#5b45f2]">1단계.</p>
                <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[#111827]">차트의 언어 배우기</h1>
                <p className="mt-4 text-sm font-medium leading-7 text-[#667085]">
                  캔들 위에 마우스를 올려보세요. 각 부분의 의미를 알려드릴게요.
                </p>
                <div className="mt-8 grid gap-3">
                  <div className="rounded-xl border border-[#ffe3e7] bg-[#fff7f8] p-4">
                    <h2 className="font-black text-[#ff3f55]">양봉(빨간색)</h2>
                    <p className="mt-1 text-sm font-medium text-[#667085]">종가가 시가보다 높아 주가가 오른 날</p>
                  </div>
                  <div className="rounded-xl border border-[#ded9ff] bg-[#f8f7ff] p-4">
                    <h2 className="font-black text-[#5b45f2]">음봉(파란색)</h2>
                    <p className="mt-1 text-sm font-medium text-[#667085]">종가가 시가보다 낮아 주가가 내린 날</p>
                  </div>
                  <div className="rounded-xl border border-[#dfe3ee] bg-[#f7f8fc] p-4">
                    <h2 className="font-black text-[#111827]">캔들의 구성 요소</h2>
                    <p className="mt-1 text-sm font-medium text-[#667085]">시가, 고가, 저가, 종가를 한 번에 보여줘요.</p>
                  </div>
                </div>
                <div className="mt-5 rounded-xl border border-[#ded9ff] bg-[#f8f7ff] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-black text-[#5b45f2]">용어 퀴즈</h2>
                    <button className="text-xs font-extrabold text-[#5b45f2]" type="button" onClick={nextTerm}>
                      다음 용어
                    </button>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm font-medium leading-6 text-[#667085]">{currentTerm.meaning}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {quizOptions.map((term) => (
                      <button
                        key={term.word}
                        className="rounded-lg border border-[#dfe3ee] bg-white px-3 py-2 text-sm font-extrabold text-[#111827] hover:border-[#5b45f2]"
                        type="button"
                        onClick={() => submitTermAnswer(term.word)}
                      >
                        {term.word}
                      </button>
                    ))}
                  </div>
                  {termMessage && <p className="mt-3 text-sm font-extrabold text-[#5b45f2]">{termMessage}</p>}
                </div>
                <div className="mt-auto pt-7">
                  <Button className="w-full" onClick={() => setStep(2)}>
                    다음 단계 →
                  </Button>
                </div>
              </aside>
              <CandleChart data={tutorialData} visibleCount={tutorialData.length} isTutorial />
            </motion.div>
          ) : (
            <motion.div
              key="practice"
              className="grid gap-7 lg:grid-cols-[1fr_1.2fr]"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <aside>
                <p className="text-lg font-black text-[#5b45f2]">2단계.</p>
                <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[#111827]">최종 훈련</h1>
                <p className="mt-4 text-sm font-medium leading-7 text-[#667085]">
                  이제 직접 주문을 넣어볼까요? 시장가로 10주를 매수해보세요.
                </p>
                <div className="mt-7 rounded-xl border border-[#dfe3ee] bg-[#f7f8fc] p-5">
                  <h2 className="font-black text-[#111827]">힌트 💡</h2>
                  <p className="mt-2 text-sm font-medium leading-6 text-[#667085]">
                    시장가란 현재 시장가로 즉시 체결되는 주문이에요.
                  </p>
                </div>
                <Mascot className="mt-8" />
              </aside>
              <section className="rounded-2xl border border-[#dfe3ee] bg-white p-6 shadow-card">
                <div className="mb-6 flex items-center justify-between border-b border-[#edf0f6] pb-5">
                  <div>
                    <p className="text-sm font-bold text-[#667085]">KOSPI 지수</p>
                    <p className="mt-1 text-3xl font-black text-[#ff3f55]">{currentPrice.toLocaleString('ko-KR')}</p>
                  </div>
                  <span className="font-extrabold text-[#16a34a]">+1.53%</span>
                </div>
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#667085]">주문 유형</span>
                    <span className="rounded-lg border border-[#dfe3ee] bg-[#f7f8fc] px-4 py-2 text-sm font-extrabold text-[#111827]">시장가</span>
                  </div>
                  <div>
                    <label className="mb-3 block font-bold text-[#667085]" htmlFor="tutorial-qty">
                      수량
                    </label>
                    <div className="flex overflow-hidden rounded-xl border border-[#dfe3ee]">
                      <button className="w-14 bg-[#f7f8fc] text-xl font-black" onClick={() => setQty(Math.max(1, qty - 1))}>
                        -
                      </button>
                      <input
                        id="tutorial-qty"
                        className="w-full border-x border-[#dfe3ee] px-4 py-3 text-center text-lg font-black text-[#111827] outline-none"
                        type="number"
                        min={1}
                        value={qty}
                        onChange={(event) => setQty(Number(event.target.value))}
                      />
                      <button className="w-14 bg-[#f7f8fc] text-xl font-black" onClick={() => setQty(qty + 1)}>
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#667085]">예상 금액</span>
                    <strong className="text-[#5b45f2]">{formatKRW(qty * currentPrice)}</strong>
                  </div>
                  <Button variant="danger" className="w-full" onClick={submitPractice}>
                    매수하기
                  </Button>
                </div>
                {message && (
                  <p className={`mt-5 rounded-xl p-4 text-sm font-extrabold ${complete ? 'bg-[#edfff6] text-[#14a86b]' : 'bg-[#fff7f8] text-[#ff3f55]'}`}>
                    {message}
                  </p>
                )}
                {complete && (
                  <Button className="mt-5 w-full" onClick={() => navigate('/select')}>
                    실전으로 이동하기
                  </Button>
                )}
              </section>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
