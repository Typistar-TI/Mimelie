import type { ButtonHTMLAttributes, ReactNode } from "react";

export function IconButton({ label, children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return <button aria-label={label} title={label} className={`grid h-9 w-9 place-items-center !rounded-[14px] border border-transparent bg-surface-subtle/85 text-base text-ink/60 transition hover:border-brand/15 hover:bg-brand-soft hover:text-brand disabled:pointer-events-none disabled:opacity-45 ${className}`} {...props}>{children}</button>;
}
