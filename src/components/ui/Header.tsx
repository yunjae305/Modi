import { useNavigate, useLocation } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import { Button } from './Button';
import { useAuthContext } from '../../context/AuthContext';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthContext();

  // 현재 활성화된 메뉴 하이라이트 클래스 반환
  const getLinkClass = (path: string) => {
    const baseClass = "transition-colors duration-500 ease-in-out font-bold text-[15px]";
    return location.pathname === path
      ? `${baseClass} text-[#5b45f2]`
      : `${baseClass} text-[#111827] hover:text-[#5b45f2]`;
  };

  return (
    <header className="flex items-center justify-between pt-8 max-w-[90rem] mx-auto w-full">
      <BrandLogo />
      <nav className="hidden items-center gap-[6rem] md:flex">
        <button className={getLinkClass('/select')} onClick={() => navigate('/select')}>
          시나리오 투자
        </button>
        <button className={getLinkClass('/tutorial')} onClick={() => navigate('/tutorial')}>
          학습 가이드
        </button>
        <button className={getLinkClass('/trade')} onClick={() => navigate('/trade')}>
          순위 대시보드
        </button>
      </nav>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="hidden text-[15px] font-bold text-[#111827] sm:block">{user.nickname}님</span>
            <Button variant="primary" className="hidden px-4 py-2 text-xs sm:block font-bold rounded-xl shadow-sm" onClick={() => logout()}>
              로그아웃
            </Button>
          </>
        ) : (
          <Button variant="ghost" className="hidden px-7 py-2 sm:block" onClick={() => navigate('/login')}>
            로그인
          </Button>
        )}
      </div>
    </header>
  );
}