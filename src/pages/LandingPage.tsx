// Modi 랜딩 페이지
import { useEffect, useState } from 'react';
import { Header } from '../components/ui/Header';
import { Footer } from '../components/ui/Footer';
import { HeroSection } from '../components/landing/HeroSection'; 
import { FeatureCard } from '../components/landing/FeatureCard';
import { ModeSelectModal } from '../components/ui/ModeSelectModal';
import { useAuthContext } from '../context/AuthContext';

export function LandingPage() {
  const { user, refreshUser } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      refreshUser();
    }
  }, [refreshUser, user]);

  return (
    <>
      {/* Header 영역 */}
      <Header />

      {/* Main 영역 */}
      <HeroSection onOpenModal={() => setIsOpen(true)} />

      <div id="service" className="grid gap-5 border-[#edf0f6] pb-16 md:grid-cols-3 max-w-[90rem] mx-auto w-full">
        {[
          ['실제 과거 데이터 기반', '공포와 회복 데이터로 현실감 있는 경험'],
          ['리스크 없는 학습', '가상 자금으로 매매하며 투자 연습'],
          ['실전 감각 향상', '위기 대응 능력과 판단력 강화'],
        ].map(([title, desc]) => (
          <FeatureCard key={title} title={title} desc={desc} />
        ))}
      </div>

      {/* Footer 영역 */}
      <Footer />

      {/* 모드 선택 Modal */}
      <ModeSelectModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}