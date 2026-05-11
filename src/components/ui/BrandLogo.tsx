interface BrandLogoProps {
  muted?: boolean;
}

export function BrandLogo({ muted = false }: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-2 text-sm font-black ${muted ? 'text-[#b6bcc9]' : 'text-[#111827]'}`}>
      <span className={`grid h-7 w-7 place-items-center rounded-lg ${muted ? 'bg-[#eef0f6]' : 'bg-[#f0edff]'}`}>
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#5b45f2]" fill="none" aria-hidden="true">
          <path d="M5 17V7l5 5 2-3 2 3 5-5v10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      Modi
    </div>
  );
}
