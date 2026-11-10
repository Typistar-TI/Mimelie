import type { HTMLAttributes, ReactNode } from "react";

export function Card({ children, className = "", ...props }: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return <section className={`rounded-[18px] border border-line bg-paper shadow-[0_2px_8px_rgba(34,42,57,.055)] ${className}`} {...props}>{children}</section>;
}

export function PanelHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <header className="flex flex-wrap items-start justify-between gap-3"><div>{eyebrow && <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[.13em] text-ink/42">{eyebrow}</p>}<h2 className="text-lg font-semibold tracking-[-.025em] text-ink">{title}</h2>{description && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/55">{description}</p>}</div>{action && <div className="shrink-0">{action}</div>}</header>;
}

export function MetricCard({ label, value, detail, icon = "↗", tone = "neutral" }: { label: string; value: ReactNode; detail?: ReactNode; icon?: ReactNode; tone?: "neutral" | "brand" | "success" | "info" }) {
  const tones = { neutral: "bg-surface-subtle text-ink", brand: "bg-brand-soft text-brand", success: "bg-pine-soft text-pine", info: "bg-info-soft text-info" };
  return <Card className="p-4"><span className={`grid h-8 w-8 place-items-center rounded-xl text-sm font-bold ${tones[tone]}`}>{icon}</span><p className="mt-4 text-[11px] font-medium text-ink/52">{label}</p><strong className="mt-1.5 block text-[25px] font-semibold leading-none tracking-[-.055em]">{value}</strong>{detail && <p className="mt-2 text-[11px] text-ink/48">{detail}</p>}</Card>;
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="grid place-items-center rounded-2xl border border-dashed border-line bg-surface-subtle/50 px-6 py-14 text-center"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-paper text-xl shadow-sm">◌</div><h3 className="mt-4 text-base font-semibold">{title}</h3>{description && <p className="mt-1.5 max-w-md text-sm leading-6 text-ink/55">{description}</p>}{action && <div className="mt-5">{action}</div>}</div>;
}
