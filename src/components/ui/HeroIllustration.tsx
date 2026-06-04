// Modi 랜딩 히어로 일러스트 컴포넌트
// 랜딩 히어로 이미지 컴포넌트
export function HeroIllustration() {
  const candles = [
    { x: 52, y: 98, h: 26, up: true },
    { x: 82, y: 84, h: 42, up: true },
    { x: 112, y: 92, h: 34, up: false },
    { x: 142, y: 72, h: 48, up: true },
    { x: 172, y: 66, h: 54, up: true },
    { x: 202, y: 58, h: 60, up: false },
    { x: 232, y: 45, h: 72, up: true },
  ];

  return (
    <div className="relative mx-auto h-[310px] max-w-[520px]">
      <div className="absolute left-10 top-12 h-48 w-[330px] rotate-[-4deg] rounded-2xl border border-[#dfe3ee] bg-white shadow-card" />
      <div className="absolute left-4 top-7 h-48 w-[350px] rounded-2xl border border-[#dfe3ee] bg-white shadow-card">
        <svg viewBox="0 0 300 170" className="h-full w-full" aria-hidden="true">
          <path d="M20 132C64 108 88 116 119 94C158 66 184 88 218 55C242 31 260 34 282 24" fill="none" stroke="#d7d4ff" strokeWidth="3" />
          <line x1="28" y1="28" x2="280" y2="28" stroke="#edf0f6" />
          <line x1="28" y1="70" x2="280" y2="70" stroke="#edf0f6" />
          <line x1="28" y1="112" x2="280" y2="112" stroke="#edf0f6" />
          {candles.map((candle) => (
            <g key={candle.x}>
              <line x1={candle.x} x2={candle.x} y1={candle.y - 18} y2={candle.y + candle.h} stroke={candle.up ? '#5b45f2' : '#ff3f55'} strokeWidth="3" strokeLinecap="round" />
              <rect x={candle.x - 6} y={candle.y} width="12" height={candle.h} rx="3" fill={candle.up ? '#5b45f2' : '#ff3f55'} />
            </g>
          ))}
        </svg>
      </div>
      <div className="absolute bottom-0 right-8 h-44 w-40">
        <div className="absolute left-14 top-0 h-16 w-16 rounded-full bg-[#ffd6b8]" />
        <div className="absolute left-10 top-11 h-10 w-24 rounded-[2rem] bg-[#332a2a]" />
        <div className="absolute bottom-0 left-2 h-28 w-36 rounded-[2rem_2rem_1rem_1rem] bg-[#7657ff]" />
        <div className="absolute bottom-0 left-10 h-20 w-28 rounded-2xl bg-[#d9dce4]" />
        <div className="absolute bottom-8 left-20 text-lg font-black text-white">M</div>
      </div>
      <div className="absolute bottom-6 left-10 h-20 w-28 rotate-[-8deg] rounded-xl border border-[#dfe3ee] bg-white p-3 shadow-card">
        <div className="mb-2 h-2 w-14 rounded-full bg-[#d8d3ff]" />
        <div className="mb-2 h-2 w-20 rounded-full bg-[#edf0f6]" />
        <div className="h-2 w-16 rounded-full bg-[#edf0f6]" />
      </div>
    </div>
  );
}
