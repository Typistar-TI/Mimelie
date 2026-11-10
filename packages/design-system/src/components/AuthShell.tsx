import type { ReactNode } from "react";
import { Card } from "./Surface.js";

/** Shared, focused layout for protected account journeys. */
export function AuthShell({ eyebrow, title, description, children }: { eyebrow: string; title: ReactNode; description: string; children: ReactNode }) {
  return <main className="mx-auto grid min-h-[calc(100vh-78px)] max-w-[1400px] items-center gap-5 px-4 py-8 sm:px-6 md:grid-cols-[1fr_430px] lg:px-8"><section className="hidden rounded-[24px] border border-white bg-white p-9 shadow-[0_3px_12px_rgba(34,42,57,.045)] md:block"><p className="text-[11px] font-semibold uppercase tracking-[.13em] text-brand">{eyebrow}</p><h1 className="mt-4 max-w-md text-[clamp(38px,4vw,52px)] font-semibold leading-[1.03] tracking-[-.065em] text-ink">{title}</h1><p className="mt-5 max-w-sm text-sm leading-7 text-ink/58">{description}</p><div className="mt-10 flex items-center gap-2 text-xs font-medium text-pine"><span className="h-2 w-2 rounded-full bg-pine" /> Ambiente protegido</div></section><Card className="p-6 shadow-[0_14px_36px_rgba(28,35,52,.06)] sm:p-8">{children}</Card></main>;
}
