// Modi 브랜드 로고 컴포넌트
import { useNavigate } from 'react-router-dom';

// 브랜드 로고 표시 컴포넌트
export function BrandLogo() {
  const navigate = useNavigate();

  return (
    <div className={`flex items-center gap-4 text-[23px] font-black cursor-pointer`} onClick={() => navigate('/')}>
      <span className={`grid h-8 w-8 place-items-center rounded-lg bg-[#eef0f6]`}>
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-[#5b45f2]" fill="none" aria-hidden="true">
          <path d="M5 17V7l5 5 2-3 2 3 5-5v10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-[#5b45f2] hover:text-[#4932e0] transition-all duration-500">
        Modi
      </span>
    </div>
  );
}
