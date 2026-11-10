import type { ReactNode } from "react";

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "red" | "orange" | "blue";
}) {
  const tones = { neutral: "bg-surface-subtle text-ink/62", green: "bg-pine-soft text-pine", red: "bg-danger-soft text-danger", orange: "bg-amber-soft text-amber", blue: "bg-info-soft text-info" };
  return <span className={`inline-flex w-max items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tones[tone]}`}><span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />{children}</span>;
}
