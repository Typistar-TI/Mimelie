import type { ReactNode } from "react";
import { Card, PanelHeader } from "./Surface.js";

export function WorkspaceOverview({ title, status, description, toolbar, metrics, children }: { title: string; status?: ReactNode; description: string; toolbar?: ReactNode; metrics: ReactNode; children: ReactNode }) {
  return <div className="grid gap-4"><Card className="overflow-hidden p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-[26px] font-semibold tracking-[-.055em] sm:text-[30px]">{title}</h2>{status}</div><p className="mt-1.5 max-w-2xl text-xs leading-5 text-ink/52">{description}</p></div>{toolbar && <div className="flex items-center gap-2">{toolbar}</div>}</div><div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics}</div></Card><Card className="overflow-hidden"><div className="border-b border-line/75 px-5 py-4 sm:px-6"><PanelHeader eyebrow="Catálogo" title="Ofertas recentes" description="Revise as últimas ofertas antes de elas entrarem na sua rotina." /></div>{children}</Card></div>;
}
