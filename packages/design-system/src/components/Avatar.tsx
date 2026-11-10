import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Avatar({ name, src, size = "md", className = "" }: { name: string; src?: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const sizes = { sm: "h-7 w-7 text-[10px]", md: "h-9 w-9 text-xs", lg: "h-12 w-12 text-base" };
  return <span aria-label={name} title={name} className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-brand-soft font-semibold text-brand ${sizes[size]} ${className}`}>{src ? <img className="h-full w-full object-cover" src={src} alt="" /> : name.slice(0, 1).toUpperCase()}</span>;
}

export function TextButton({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return <button className={`text-sm font-semibold text-ink/58 transition hover:text-brand disabled:pointer-events-none disabled:opacity-45 ${className}`} {...props}>{children}</button>;
}
