// Modi 브랜드 로고 컴포넌트
interface BrandLogoProps {
  muted?: boolean;
}

// 브랜드 로고 표시 컴포넌트
export function BrandLogo({ muted = false }: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-4 text-[23px] text-[#5b45f2] font-black ${muted ? 'text-[#b6bcc9]' : 'text-[#111827]'}`}>
      <span className={`grid h-8 w-8 place-items-center rounded-lg ${muted ? 'bg-[#eef0f6]' : 'bg-[#f0edff]'}`}>
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-[#5b45f2]" fill="none" aria-hidden="true">
          <path d="M5 17V7l5 5 2-3 2 3 5-5v10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      Modi
    </div>
  );
}
