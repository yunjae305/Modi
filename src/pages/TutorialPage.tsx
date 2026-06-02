import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CandleChart } from '../components/chart/CandleChart';
import { Button } from '../components/ui/Button';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Mascot } from '../components/ui/Mascot';
import { learningTerms } from '../data/learningTerms';
import type { LearningTerm } from '../data/learningTerms';
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

const PRACTICE_QTY = 10;

interface QuizQuestion {
  term: LearningTerm;
  options: LearningTerm[];
}

function makeQuizQuestions(): QuizQuestion[] {
  const shuffled = [...learningTerms].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map((term) => {
    const wrong = shuffled.filter((t) => t.word !== term.word).slice(0, 3);
    const options = [...wrong, term].sort(() => Math.random() - 0.5);
    return { term, options };
  });
}

type PracticePhase = 'buy' | 'sell' | 'done';

export function TutorialPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Quiz state
  const [quizQuestions] = useState<QuizQuestion[]>(() => makeQuizQuestions());
  const [quizIndex, setQuizIndex] = useState(0);
  const [answered, setAnswered] = useState<{ word: string; correct: boolean } | null>(null);

  // Practice state
  const [practicePhase, setPracticePhase] = useState<PracticePhase>('buy');
  const [message, setMessage] = useState('');

  // Fluctuating live price
  const basePrice = tutorialData[tutorialData.length - 1].close;
  const [livePrice, setLivePrice] = useState(basePrice);
  const livePriceRef = useRef(basePrice);

  useEffect(() => {
    if (step !== 3 || practicePhase === 'done') return;
    const timer = setInterval(() => {
      const change = (Math.random() - 0.5) * 0.012;
      const next = Math.round(livePriceRef.current * (1 + change));
      livePriceRef.current = next;
      setLivePrice(next);
    }, 1200);
    return () => clearInterval(timer);
  }, [step, practicePhase]);

  const currentQuestion = quizQuestions[quizIndex];

  const handleAnswer = (word: string) => {
    if (answered) return;
    const correct = word === currentQuestion.term.word;
    setAnswered({ word, correct });
    if (correct) {
      setTimeout(() => {
        if (quizIndex < quizQuestions.length - 1) {
          setQuizIndex((i) => i + 1);
          setAnswered(null);
        } else {
          setStep(3);
        }
      }, 900);
    } else {
      setTimeout(() => setAnswered(null), 800);
    }
  };

  const submitBuy = () => {
    setMessage(`${PRACTICE_QTY}주 매수 체결! 이제 보유 중인 주식을 매도해보세요.`);
    setTimeout(() => {
      setPracticePhase('sell');
      setMessage('');
    }, 1200);
  };

  const submitSell = () => {
    setMessage(`${PRACTICE_QTY}주 매도 체결! 수익 실현 완료!`);
    setTimeout(() => setPracticePhase('done'), 1000);
  };

  const stepLabel = (target: number, label: string) => {
    const active = step === target;
    const done = step > target;
    return (
      <span className={active ? 'text-[#5b45f2]' : done ? 'text-[#14a86b]' : 'text-[#a3aab8]'}>
        {done ? '✓' : target} {label}
      </span>
    );
  };

  return (
    <main className="min-h-screen px-5 py-5">
      <section className="mx-auto max-w-7xl rounded-2xl border border-[#dfe3ee] bg-white shadow-card">
        <header className="flex items-center justify-between border-b border-[#edf0f6] px-6 py-5">
          <BrandLogo />
          <div className="hidden items-center gap-10 text-sm font-extrabold md:flex">
            {stepLabel(1, '차트의 언어 배우기')}
            {stepLabel(2, '용어 퀴즈')}
            {stepLabel(3, '최종 훈련')}
          </div>
          <button className="text-sm font-extrabold text-[#667085] hover:text-[#111827]" onClick={() => navigate('/')}>
            처음으로
          </button>
        </header>
        <div className="px-6 py-7">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="learn"
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
                  <div className="mt-auto pt-7">
                    <Button className="w-full" onClick={() => setStep(2)}>
                      다음 단계 →
                    </Button>
                  </div>
                </aside>
                <CandleChart data={tutorialData} visibleCount={tutorialData.length} isTutorial />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="quiz"
                className="mx-auto max-w-xl"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
              >
                <p className="text-lg font-black text-[#5b45f2]">2단계.</p>
                <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[#111827]">용어 퀴즈</h1>
                <p className="mt-4 text-sm font-medium text-[#667085]">설명을 읽고 알맞은 용어를 고르세요.</p>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={quizIndex}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    className="mt-8"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      {quizQuestions.map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 flex-1 rounded-full transition-colors ${i < quizIndex ? 'bg-[#14a86b]' : i === quizIndex ? 'bg-[#5b45f2]' : 'bg-[#edf0f6]'}`}
                        />
                      ))}
                    </div>
                    <p className="mb-1 text-right text-xs font-extrabold text-[#8b95a7]">
                      {quizIndex + 1} / {quizQuestions.length}
                    </p>
                    <div className="rounded-2xl border border-[#ded9ff] bg-[#f8f7ff] p-6">
                      <p className="text-base font-bold leading-7 text-[#111827]">{currentQuestion.term.meaning}</p>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      {currentQuestion.options.map((opt) => {
                        const isSelected = answered?.word === opt.word;
                        const isCorrect = isSelected && answered?.correct;
                        const isWrong = isSelected && !answered?.correct;
                        return (
                          <QuizButton
                            key={opt.word}
                            word={opt.word}
                            correct={isCorrect ?? false}
                            wrong={isWrong ?? false}
                            disabled={!!answered}
                            onClick={() => handleAnswer(opt.word)}
                          />
                        );
                      })}
                    </div>
                    {answered && !answered.correct && (
                      <p className="mt-4 text-center text-sm font-extrabold text-[#ff3f55]">틀렸습니다. 다시 도전해보세요!</p>
                    )}
                    {answered && answered.correct && (
                      <p className="mt-4 text-center text-sm font-extrabold text-[#14a86b]">정답입니다! 🎉</p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="practice"
                className="grid gap-7 lg:grid-cols-[1fr_1.2fr]"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
              >
                <aside>
                  <p className="text-lg font-black text-[#5b45f2]">3단계.</p>
                  <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[#111827]">최종 훈련</h1>
                  <AnimatePresence mode="wait">
                    {practicePhase === 'buy' && (
                      <motion.div key="buy-guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <p className="mt-4 text-sm font-medium leading-7 text-[#667085]">
                          시장가로 10주를 매수해보세요.
                        </p>
                        <div className="mt-5 rounded-xl border border-[#ded9ff] bg-[#f8f7ff] p-4">
                          <h2 className="font-black text-[#5b45f2]">미션 1 — 매수 10주</h2>
                          <p className="mt-1 text-sm font-medium text-[#667085]">매수하기 버튼을 눌러보세요. 가격이 실시간으로 변합니다.</p>
                        </div>
                      </motion.div>
                    )}
                    {practicePhase === 'sell' && (
                      <motion.div key="sell-guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <p className="mt-4 text-sm font-medium leading-7 text-[#667085]">
                          보유한 10주를 매도해보세요.
                        </p>
                        <div className="mt-5 rounded-xl border border-[#ffe3e7] bg-[#fff7f8] p-4">
                          <h2 className="font-black text-[#ff3f55]">미션 2 — 매도 10주</h2>
                          <p className="mt-1 text-sm font-medium text-[#667085]">
                            현재 보유: <strong className="text-[#111827]">{PRACTICE_QTY}주</strong> · 매도하기 버튼을 눌러보세요.
                          </p>
                        </div>
                      </motion.div>
                    )}
                    {practicePhase === 'done' && (
                      <motion.div key="done-guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <p className="mt-4 text-sm font-medium leading-7 text-[#667085]">
                          매수와 매도를 모두 완료했습니다! 🎉
                        </p>
                        <div className="mt-5 rounded-xl border border-[#c3f0d8] bg-[#edfff6] p-4">
                          <h2 className="font-black text-[#14a86b]">훈련 완료!</h2>
                          <p className="mt-1 text-sm font-medium text-[#667085]">이제 실전 시나리오에 도전할 준비가 됐어요.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Mascot className="mt-8" />
                </aside>

                <section className="rounded-2xl border border-[#dfe3ee] bg-white p-6 shadow-card">
                  <div className="mb-6 flex items-center justify-between border-b border-[#edf0f6] pb-5">
                    <div>
                      <p className="text-sm font-bold text-[#667085]">KOSPI 지수</p>
                      <motion.p
                        key={livePrice}
                        className="mt-1 text-3xl font-black text-[#ff3f55]"
                        initial={{ scale: 1.06 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {livePrice.toLocaleString('ko-KR')}
                      </motion.p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-[#8b95a7]">시장가</p>
                      {practicePhase === 'sell' && (
                        <p className="mt-1 text-xs font-extrabold text-[#5b45f2]">보유 {PRACTICE_QTY}주</p>
                      )}
                    </div>
                  </div>
                  {practicePhase !== 'done' ? (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between rounded-xl bg-[#f7f8fc] px-5 py-4">
                        <span className="font-bold text-[#667085]">수량</span>
                        <span className="text-lg font-black text-[#111827]">{PRACTICE_QTY}주</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#667085]">예상 금액</span>
                        <strong className="text-[#5b45f2]">{formatKRW(PRACTICE_QTY * livePrice)}</strong>
                      </div>
                      {practicePhase === 'buy' ? (
                        <Button variant="danger" className="w-full" onClick={submitBuy}>
                          매수하기 ({PRACTICE_QTY}주)
                        </Button>
                      ) : (
                        <Button variant="ghost" className="w-full border border-[#5b45f2] text-[#5b45f2]" onClick={submitSell}>
                          매도하기 ({PRACTICE_QTY}주)
                        </Button>
                      )}
                      {message && (
                        <p className="rounded-xl bg-[#edfff6] p-4 text-sm font-extrabold text-[#14a86b]">
                          {message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-5 py-6 text-center">
                      <p className="text-4xl">🏆</p>
                      <p className="text-lg font-black text-[#111827]">매수 & 매도 완료!</p>
                      <Button className="w-full" onClick={() => navigate('/select')}>
                        실전 시나리오 시작하기 →
                      </Button>
                    </div>
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

function QuizButton({
  word,
  correct,
  wrong,
  disabled,
  onClick,
}: {
  word: string;
  correct: boolean;
  wrong: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      animate={
        correct
          ? { backgroundColor: ['#ffffff', '#dcfce7', '#dcfce7', '#ffffff'], scale: [1, 1.04, 1] }
          : wrong
            ? { backgroundColor: ['#ffffff', '#fee2e2', '#fee2e2', '#ffffff'], x: [0, -8, 8, -6, 6, 0] }
            : { backgroundColor: '#ffffff', scale: 1, x: 0 }
      }
      transition={{ duration: 0.6 }}
      className={`rounded-xl border px-4 py-4 text-sm font-extrabold text-[#111827] transition-colors
        ${correct ? 'border-[#14a86b] text-[#14a86b]' : wrong ? 'border-[#ff3f55] text-[#ff3f55]' : 'border-[#dfe3ee] hover:border-[#5b45f2]'}
        ${disabled && !correct && !wrong ? 'cursor-not-allowed opacity-60' : ''}
      `}
    >
      {word}
    </motion.button>
  );
}
