//Modi 시뮬레이션, 시뮬레이션 결과, 초보자 가이드 페이지 Header 컴포넌트
import React from 'react';
import { BrandLogo } from './BrandLogo';

interface SubHeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode; // 우측 액션 버튼 추가 요소를 위한 슬롯
}

export function SubHeader({ title, description, children }: SubHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-[#edf0f6] pb-4 pt-5 px-6 lg:flex-row lg:items-center lg:justify-between shrink-0 bg-[#f8f9fa] w-full">
      <div className="flex items-center gap-5 shrink-0">
        <BrandLogo />
        <div className="hidden h-8 w-px bg-[#edf0f6] sm:block" />
        <div>
          <h1 className="text-sm font-black text-[#111827]">{title}</h1>
          <p className="mt-0.5 text-xs font-bold text-[#667085]">{description}</p>
        </div>
      </div>

      {/* 우측 액션 버튼 슬롯 */}
      <div className="flex items-center gap-3 shrink-0">
        {children}
      </div>
    </header>
  );
}