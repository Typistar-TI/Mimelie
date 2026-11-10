import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "subtle" | "danger";
export type ButtonSize = "sm" | "md" | "lg";
const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white shadow-[0_7px_16px_rgba(238,77,45,.19)] hover:bg-brand-dark hover:shadow-[0_9px_18px_rgba(238,77,45,.25)]",
  secondary: "border border-line/80 bg-paper text-ink shadow-[0_1px_2px_rgba(26,32,44,.035)] hover:border-brand/30 hover:bg-brand-soft",
  ghost: "bg-transparent text-ink/62 hover:bg-surface-subtle hover:text-ink",
  subtle: "bg-surface-subtle/90 text-ink/72 hover:bg-surface-subtle hover:text-ink",
  danger: "bg-danger text-white shadow-[0_7px_16px_rgba(223,76,91,.14)] hover:bg-[#c83b4b]",
};
const sizes: Record<ButtonSize, string> = {
  sm: "min-h-8 !rounded-[14px] px-3 text-[11px]",
  md: "min-h-10 !rounded-[14px] px-4 text-xs",
  lg: "min-h-11 !rounded-[16px] px-5 text-sm",
};

export function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  leading,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize; leading?: ReactNode }) {
  return (
    <button className={`inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition duration-150 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {leading}{children}
    </button>
  );
}
