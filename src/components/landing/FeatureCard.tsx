interface FeatureCardProps {
  title: string;
  desc: string;
}

export function FeatureCard({ title, desc }: FeatureCardProps) {
  return (
    <article className="rounded-3xl bg-[#fbfbfe] p-6 text-center transition-all border border-[#edf0f6] hover:shadow-[0_12px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1 duration-200">
      <div className="mx-auto mb-4 grid h-10 w-10 place-items-center rounded-xl bg-[#f0edff] text-[#5b45f2] ">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="font-black text-[#111827]">{title}</h2>
      <p className="mt-2 text-sm font-medium text-[#667085]">{desc}</p>
    </article>
  );
}