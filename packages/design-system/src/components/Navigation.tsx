import type { ButtonHTMLAttributes, ReactNode } from "react";

export function NavigationItem({ active = false, icon, children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; icon?: ReactNode; children: ReactNode }) {
  return <button className={`inline-flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium transition disabled:pointer-events-none disabled:opacity-45 ${active ? "bg-brand text-white shadow-[0_5px_12px_rgba(238,77,45,.16)]" : "text-ink/58 hover:bg-surface-subtle hover:text-ink"} ${className}`} {...props}>{icon && <span className="grid h-4 w-4 place-items-center">{icon}</span>}{children}</button>;
}
