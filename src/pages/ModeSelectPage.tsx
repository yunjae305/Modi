import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Button } from '../components/ui/Button';

export function ModeSelectPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen px-5 py-5">
      <section className="mx-auto min-h-[calc(100vh-2.5rem)] max-w-6xl rounded-2xl border border-[#dfe3ee] bg-white p-6 shadow-card">
        <header className="mb-10 flex items-center justify-between">
          <BrandLogo />
          <button className="text-sm font-extrabold text-[#667085] hover:text-[#111827]" onClick={() => navigate('/')}>
            처음으로
          </button>
        </header>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-extrabold text-[#5b45f2]">모드 선택</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.03em] text-[#111827]">오늘의 투자 훈련을 선택하세요</h1>
          <p className="mt-4 text-sm font-medium leading-7 text-[#667085]">
            차트 기초부터 과거 위기장 시뮬레이션, 현재가 기반 모의투자까지 한 흐름으로 연습할 수 있습니다.
          </p>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <article className="flex min-h-[20rem] flex-col rounded-2xl border border-[#dfe3ee] bg-[#fbfbfe] p-6">
            <p className="text-sm font-extrabold text-[#14a86b]">초보자 모드</p>
            <h2 className="mt-3 text-2xl font-black text-[#111827]">튜토리얼</h2>
            <p className="mt-3 text-sm font-medium leading-7 text-[#667085]">캔들 차트와 시장가 주문, 주식 용어를 짧은 미션으로 익힙니다.</p>
            <Button className="mt-auto w-full" onClick={() => navigate('/tutorial')}>
              튜토리얼 시작
            </Button>
          </article>
          <article className="flex min-h-[20rem] flex-col rounded-2xl border border-[#ded9ff] bg-[#f8f7ff] p-6">
            <p className="text-sm font-extrabold text-[#5b45f2]">시나리오 모드</p>
            <h2 className="mt-3 text-2xl font-black text-[#111827]">블라인드 과거장</h2>
            <p className="mt-3 text-sm font-medium leading-7 text-[#667085]">코로나, 서브프라임, 닷컴버블 구간을 알 수 없는 상태로 매매합니다.</p>
            <Button className="mt-auto w-full" onClick={() => navigate('/select')}>
              시나리오 시작
            </Button>
          </article>
          <article className="flex min-h-[20rem] flex-col rounded-2xl border border-[#ffe3e7] bg-[#fff7f8] p-6">
            <p className="text-sm font-extrabold text-[#ff3f55]">모의투자 모드</p>
            <h2 className="mt-3 text-2xl font-black text-[#111827]">거래 대시보드</h2>
            <p className="mt-3 text-sm font-medium leading-7 text-[#667085]">seed 가격 또는 KIS 현재가로 포트폴리오와 전체 랭킹을 확인합니다.</p>
            <Button variant="danger" className="mt-auto w-full" onClick={() => navigate('/trade')}>
              대시보드 열기
            </Button>
          </article>
        </div>
      </section>
    </main>
  );
}
