import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';

interface ModeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ModeSelectModal({ isOpen, onClose }: ModeSelectModalProps) {
  const navigate = useNavigate();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        
        <h2 className="text-2xl font-black text-[#111827]">오늘의 투자 훈련 선택</h2>
        <p className="mt-3 text-sm font-medium leading-6 text-[#667085]">훈련 목적에 맞는 시뮬레이션 모드를 선택해주세요.</p>
        
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          
          {/* 🟢 왼쪽: 초보자 튜토리얼 카드[cite: 10] */}
          <button
            type="button"
            className="rounded-2xl bg-[#f7f6ff] p-6 text-left transition hover:bg-[#f0edff]"
            onClick={() => {
              onClose();
              navigate('/tutorial');
            }}
          >
            
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-white text-[#5b45f2] shadow-card">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
                <path d="M4 8l8-4 8 4-8 4-8-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M7 11v4l5 3 5-3v-4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </div>

            <strong className="text-lg text-[#111827]">초보자 튜토리얼</strong>
            <p className="mt-2 text-sm font-medium leading-6 text-[#667085]">캔들 차트와 주문 방법 등 주식의 기본 개념을 익힙니다.</p>
          </button>

          {/* 🔵 오른쪽: 실전 시나리오 카드[cite: 10] */}
          <button
            type="button"
            className="rounded-2xl bg-[#f7f6ff] p-6 text-left transition hover:bg-[#f0edff]"
            onClick={() => {
              onClose();
              navigate('/select');
            }}
          >
            
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-white text-[#5b45f2] shadow-card">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
                <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" stroke="currentColor" strokeWidth="2" />
                <path d="M12 7v5l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            
            <strong className="text-lg text-[#111827]">실전 시나리오 투자</strong>
            <p className="mt-2 text-sm font-medium leading-6 text-[#667085]">과거 역사적인 폭락장 데이터를 기반으로 모의투자를 진행합니다.</p>
          </button>
          
        </div>
        
        <div className="mt-8 pt-4 border-t border-[#edf0f6]">
          <button
            type="button"
            className="w-full rounded-xl bg-[#f3f4f8] py-3.5 text-sm font-extrabold text-[#667085] hover:bg-[#eaf0f6] transition-colors"
            onClick={onClose}
          >
            대시보드로 돌아가기
          </button>
        </div>
        
      </div>
    </Modal>
  );
}