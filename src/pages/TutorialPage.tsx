// Modi 튜토리얼 페이지
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SubHeader } from '../components/ui/SubHeader';
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

  const [quizQuestions] = useState<QuizQuestion[]>(() => makeQuizQuestions());
  const [quizIndex, setQuizIndex] = useState(0);
  const [answered, setAnswered] = useState<{ word: string; correct: boolean } | null>(null);

  const [practicePhase, setPracticePhase] = useState<PracticePhase>('buy');
  const [message, setMessage] = useState('');

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
      <span className={`text-xs font-black transition-colors ${active ? 'text-[#5b45f2]' : done ? 'text-[#14a86b]' : 'text-[#a3aab8]'}`}>
        {done ? '✓' : `0${target}`} {label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] px-0 pb-6 overflow-hidden flex flex-col">
      
      {/* Header 영역 */}
      <SubHeader title="초보자 가이드" description="주식에 대한 기본 개념을 학습해보자">

        <Button 
          variant="ghost" 
          className="px-4 py-1.5 text-xs bg-white border border-[#dfe3ee] shadow-sm font-bold" 
          onClick={() => navigate('/')}
        >
          처음으로 가기
        </Button>
      </SubHeader>

      {/* Main 영역 */}
      <div className="w-full max-w-7xl mx-auto px-6 mt-5 flex-1 min-h-0">
        <div className="mb-5 flex items-center justify-between rounded-2xl border border-[#dfe3ee] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-xs font-black text-[#111827] uppercase tracking-wider">진행 단계</span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    step === s ? 'w-12 bg-[#5b45f2]' : step > s ? 'w-6 bg-[#14a86b]' : 'w-2.5 bg-[#edf0f6]'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-8 text-xs font-black tracking-tight text-[#a3aab8]">
            <span className={step === 1 ? 'text-[#5b45f2]' : step > 1 ? 'text-[#14a86b]' : ''}>01. 차트의 언어</span>
            <span className={step === 2 ? 'text-[#5b45f2]' : step > 2 ? 'text-[#14a86b]' : ''}>02. 개념 용어 퀴즈</span>
            <span className={step === 3 ? 'text-[#5b45f2]' : step > 3 ? 'text-[#14a86b]' : ''}>03. 모의 체결 훈련</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          
          {/* [1단계] */}
          {step === 1 && (
            <motion.div
              key="learn"
              className="grid gap-6 grid-cols-1 lg:grid-cols-[340px_1fr] items-stretch"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <aside className="rounded-2xl border border-[#dfe3ee] bg-white p-6 shadow-sm flex flex-col justify-between min-h-[520px]">
                <div>
                  <p className="text-xs font-black text-[#5b45f2] uppercase tracking-wider">STEP 01</p>
                  <h2 className="mt-1.5 text-2xl font-black text-[#111827] tracking-tight">차트의 언어 배우기</h2>
                  <p className="mt-3.5 text-sm font-bold leading-6 text-[#667085]">
                    오른쪽 차트의 캔들 위에 마우스를 올려보세요. 각 부분의 의미를 알려드릴게요.
                  </p>
                  
                  <div className="mt-6 space-y-3">
                    <div className="rounded-xl border border-[#ffe3e7] bg-[#fff7f8] p-5">
                      <h3 className="font-black text-[#ff3f55] text-sm">양봉(빨간색)</h3>
                      <p className="mt-1.5 text-xs font-semibold text-[#667085] leading-relaxed">종가가 시가보다 높아 주가가 오른 날</p>
                    </div>
                    <div className="rounded-xl border border-[#ded9ff] bg-[#f8f7ff] p-5">
                      <h3 className="font-black text-[#5b45f2] text-sm">음봉(파란색)</h3>
                      <p className="mt-1.5 text-xs font-semibold text-[#667085] leading-relaxed">종가가 시가보다 낮아 주가가 내린 날</p>
                    </div>
                  </div>
                </div>
                <div className="pt-6">
                  <Button className="w-full py-4 text-base font-black rounded-xl shadow-sm" onClick={() => setStep(2)}>
                    다음 단계 퀴즈 풀기 →
                  </Button>
                </div>
              </aside>

              <div className="rounded-2xl border border-[#dfe3ee] bg-white p-6 shadow-sm flex flex-col justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#8b95a7] mb-2">튜토리얼 예시 차트 보드</h3>
                <div className="w-full flex-1 min-h-0 flex items-center justify-center">
                  <CandleChart data={tutorialData} visibleCount={tutorialData.length} height={450} isTutorial />
                </div>
              </div>
            </motion.div>
          )}

          {/* [2단계] */}
          {step === 2 && (
            <motion.div
              key="quiz"
              className="mx-auto max-w-3xl rounded-2xl border border-[#dfe3ee] bg-white p-8 shadow-sm mt-4 w-full"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <p className="text-xs font-black text-[#5b45f2] uppercase tracking-wider">STEP 02</p>
              <h2 className="mt-1 text-2xl font-black text-[#111827] tracking-tight">개념 용어 퀴즈</h2>
              <p className="mt-2 text-sm font-bold text-[#667085]">설명을 보고 가장 알맞은 답을 골라주세요</p>
              
              <AnimatePresence mode="wait">
                <motion.div key={quizIndex} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="mt-6">
                  <div className="rounded-xl border border-[#ded9ff] bg-[#f8f7ff] p-8 min-h-[140px] flex items-center justify-center shadow-inner">
                    <p className="text-lg font-black text-center leading-8 text-[#111827]">{currentQuestion.term.meaning}</p>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 gap-4">
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
                    <p className="mt-4 text-center text-sm font-black text-[#ff3f55]">틀렸습니다. 다시 도전해보세요!</p>
                  )}
                  {answered && answered.correct && (
                    <p className="mt-4 text-center text-sm font-black text-[#14a86b]">정답입니다! 🎉</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* [3단계] */}
          {step === 3 && (
            <motion.div
              key="practice"
              className="grid gap-6 grid-cols-1 lg:grid-cols-[340px_1fr] items-stretch"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <aside className="rounded-2xl border border-[#dfe3ee] bg-white p-6 shadow-sm flex flex-col justify-between min-h-[520px]">
                <div>
                  <p className="text-xs font-black text-[#5b45f2] uppercase tracking-wider">FINAL STEP</p>
                  <h2 className="mt-1.5 text-2xl font-black text-[#111827] tracking-tight">최종 훈련</h2>
                  <AnimatePresence mode="wait">
                    
                    {practicePhase === 'buy' && (
                      <motion.div key="buy-guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <p className="mt-3.5 text-sm font-bold leading-6 text-[#667085]">시장가로 10주를 매수해보세요.</p>
                        <div className="mt-5 rounded-xl border border-[#ded9ff] bg-[#f8f7ff] p-5">
                          <h3 className="font-black text-[#5b45f2] text-sm">미션 1 — 시장가 매수</h3>
                          <p className="mt-1.5 text-xs font-semibold text-[#667085] leading-relaxed">하단의 매수 버튼을 누르면 실시간 시세로 즉시 체결을 실습합니다.</p>
                        </div>
                      </motion.div>
                    )}
                    {practicePhase === 'sell' && (
                      <motion.div key="sell-guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <p className="mt-3.5 text-sm font-bold leading-6 text-[#667085]">보유한 10주를 매도해보세요.</p>
                        <div className="mt-5 rounded-xl border border-[#ffe3e7] bg-[#fff7f8] p-5">
                          <h3 className="font-black text-[#ff3f55] text-sm">미션 2 — 보유 주식 매도</h3>
                          <p className="mt-1.5 text-xs font-semibold text-[#667085] leading-relaxed">현재 보유: <strong className="text-[#111827]">{PRACTICE_QTY}주</strong> · 매도하기 버튼을 눌러보세요.</p>
                        </div>
                      </motion.div>
                    )}
                    {practicePhase === 'done' && (
                      <motion.div key="done-guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <p className="mt-3.5 text-sm font-bold leading-6 text-[#667085]">매수와 매도를 모두 완료했습니다! 🎉</p>
                        <div className="mt-5 rounded-xl border border-[#c3f0d8] bg-[#edfff6] p-5">
                          <h3 className="font-black text-[#14a86b] text-sm">훈련 완료!</h3>
                          <p className="mt-1.5 text-xs font-semibold text-[#667085] leading-relaxed">이제 실전 시나리오에 도전할 준비가 됐어요.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex justify-center items-center py-3 bg-[#f7f8fc] rounded-xl border border-[#dfe3ee]">
                  <Mascot className="h-14 w-14" />
                </div>
              </aside>

              <section className="rounded-2xl border border-[#dfe3ee] bg-white p-6 shadow-sm min-h-[520px] flex flex-col justify-between">
                <div className="w-full">
                  <div className="mb-6 flex items-center justify-between border-b border-[#edf0f6] pb-5">
                    <div>
                      <p className="text-xs font-black text-[#667085] uppercase tracking-wider">KOSPI 지수</p>
                      <motion.p
                        key={livePrice}
                        className="mt-1.5 text-4xl font-black text-[#ff3f55] tracking-tight"
                        initial={{ scale: 1.04 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {livePrice.toLocaleString('ko-KR')}
                      </motion.p>
                    </div>
                    <div className="text-right">
                      <span className="rounded-md bg-[#f8f7ff] border border-[#ded9ff] px-2.5 py-1 text-[11px] font-black text-[#5b45f2]">
                        가상 실시간 시세
                      </span>
                      {practicePhase === 'sell' && (
                        <p className="mt-2 text-xs font-black text-[#5b45f2]">보유 {PRACTICE_QTY}주</p>
                      )}
                    </div>
                  </div>
                  {practicePhase !== 'done' ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-xl bg-[#f7f8fc] px-6 py-4 border border-[#edf0f6]">
                        <span className="text-sm font-extrabold text-[#667085]">수량</span>
                        <span className="text-lg font-black text-[#111827]">{PRACTICE_QTY}주</span>
                      </div>
                      <div className="flex items-center justify-between px-1">
                        <span className="text-sm font-extrabold text-[#667085]">예상 금액</span>
                        <strong className="text-2xl font-black text-[#5b45f2] tracking-tight">{formatKRW(PRACTICE_QTY * livePrice)}</strong>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="w-full pt-6">
                  {practicePhase !== 'done' ? (
                    <div className="space-y-3">
                      {practicePhase === 'buy' ? (
                        <Button className="w-full py-4 text-base font-black rounded-xl" onClick={submitBuy}>
                          매수하기 ({PRACTICE_QTY}주)
                        </Button>
                      ) : (
                        <Button variant="ghost" className="w-full border-2 border-[#5b45f2] text-[#5b45f2] py-4 text-base font-black rounded-xl hover:bg-[#fbfbfe]" onClick={submitSell}>
                          매도하기 ({PRACTICE_QTY}주)
                        </Button>
                      )}
                      {message && (
                        <p className="rounded-xl bg-[#edfff6] border border-[#c3f0d8] p-4 text-xs font-black text-[#14a86b] text-center">
                          {message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-center py-4">
                      <p className="text-5xl animate-bounce">🏆</p>
                      <h3 className="text-xl font-black text-[#111827]">매수 & 매도 완료!</h3>
                      <Button className="w-full py-4 text-base font-black rounded-xl shadow-md" onClick={() => navigate('/select')}>
                        실전 시나리오 시작하기
                      </Button>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
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
          ? { backgroundColor: ['#ffffff', '#dcfce7', '#dcfce7', '#ffffff'], scale: [1, 1.02, 1] }
          : wrong
            ? { backgroundColor: ['#ffffff', '#fee2e2', '#fee2e2', '#ffffff'], x: [0, -5, 5, -3, 3, 0] }
            : { backgroundColor: '#ffffff', scale: 1, x: 0 }
      }
      transition={{ duration: 0.5 }}
      className={`rounded-xl border px-6 py-4 text-base font-black text-[#111827] transition-colors shadow-sm
        ${correct ? 'border-[#14a86b] text-[#14a86b]' : wrong ? 'border-[#ff3f55] text-[#ff3f55]' : 'border-[#dfe3ee] hover:border-[#5b45f2] bg-white hover:bg-[#fbfbfe]'}
        ${disabled && !correct && !wrong ? 'cursor-not-allowed opacity-50' : ''}
      `}
    >
      {word}
    </motion.button>
  );
}