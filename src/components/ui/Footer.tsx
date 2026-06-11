//Modi Footer 영역 컴포넌트 (랜딩페이지)
export function Footer() {
  return (
    <footer className="border-t border-[#edf0f6] pt-8 pb-16 max-w-[90rem] mx-auto w-full flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between text-xs font-semibold text-[#8b95a7]">
      <div>
        <p>© 2026 Modi. All rights reserved.</p>
        <p className="mt-1 text-[11px] text-[#a3aab8] font-medium">크로스플랫폼프로그래밍2 기말 프로젝트 — 과거 주식시장 빅데이터를 활용한 개인 투자 리스크 관리 학습 플랫폼</p>
      </div>
    </footer>
  );
}