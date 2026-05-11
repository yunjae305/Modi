import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'danger' | 'ghost' | 'soft';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-[#5b45f2] text-white shadow-glow hover:bg-[#4934d6]',
  danger: 'bg-[#ff3f55] text-white shadow-[0_14px_30px_rgba(255,63,85,0.24)] hover:bg-[#e93449]',
  ghost: 'border border-[#dfe3ee] bg-white text-[#111827] hover:border-[#c8cedd] hover:bg-[#f8f9fd]',
  soft: 'border border-[#ded9ff] bg-[#f4f2ff] text-[#5b45f2] hover:bg-[#eeeaff]',
};

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-xl px-5 py-3 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
