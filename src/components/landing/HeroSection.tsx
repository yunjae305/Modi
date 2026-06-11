//Modi 랜딩페이지 Main영역 일러스트 컴포넌트
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { HeroIllustration } from '../ui/HeroIllustration';

interface HeroSectionProps {
  onOpenModal: () => void;
}

export function HeroSection({ onOpenModal }: HeroSectionProps) {
  return (
    <div className="grid min-h-[585px] mx-auto max-w-[90rem] items-center justify-between lg:grid-cols-[1fr_1.1fr] w-full">
      <motion.section
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <h1 className="text-4xl font-black leading-[1.25] tracking-[-0.04em] text-[#111827] sm:text-6xl sm:leading-[1.15]">
          과거의 시장에서 배우는
          <br className="hidden sm:inline" />
          <span className="block sm:inline"> 더 나은 <span className="text-[#5b45f2]">투자</span>의 선택</span>
        </h1>
        <p className="mt-6 max-w-xl text-base font-medium leading-8 text-[#667085]">
          실제 시장 데이터를 기반으로 한 시나리오 투자로 위기 속에서 기회를 찾는 능력을 키워보세요.
        </p>
        <div className="mt-8">
          <Button className="px-8 text-[15px] font-black rounded-full" onClick={onOpenModal}>
            모드 선택
          </Button>
        </div>
      </motion.section>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.55 }}
      >
        <HeroIllustration />
      </motion.div>
    </div>
  );
}