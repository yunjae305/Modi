// Modi 마스코트 컴포넌트
interface MascotProps {
  className?: string;
}

// 마스코트 표시 컴포넌트
export function Mascot({ className = '' }: MascotProps) {
  return (
    <div className={`relative h-24 w-24 ${className}`}>
      <div className="absolute left-1/2 top-4 h-14 w-16 -translate-x-1/2 rounded-[1.4rem] border-2 border-[#8172ff] bg-[#f8f7ff] shadow-[0_12px_24px_rgba(91,69,242,0.18)]">
        <div className="absolute left-1/2 top-4 flex h-7 w-10 -translate-x-1/2 items-center justify-center gap-2 rounded-full bg-[#4f3ed7]">
          <span className="h-2 w-2 rounded-full bg-[#90f5ff]" />
          <span className="h-2 w-2 rounded-full bg-[#90f5ff]" />
        </div>
        <div className="absolute bottom-2 left-1/2 h-1.5 w-5 -translate-x-1/2 rounded-full bg-[#c7c1ff]" />
      </div>
      <div className="absolute left-2 top-10 h-8 w-3 rounded-full bg-[#d9d5ff]" />
      <div className="absolute right-2 top-10 h-8 w-3 rounded-full bg-[#d9d5ff]" />
      <div className="absolute bottom-2 left-7 h-7 w-3 rounded-full bg-[#d9d5ff]" />
      <div className="absolute bottom-2 right-7 h-7 w-3 rounded-full bg-[#d9d5ff]" />
      <div className="absolute left-1/2 top-1 h-3 w-3 -translate-x-1/2 rounded-full bg-[#5b45f2]" />
      <div className="absolute left-1/2 top-3 h-4 w-0.5 -translate-x-1/2 bg-[#8172ff]" />
    </div>
  );
}
