import type { ReactNode } from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`block animate-pulse rounded-lg bg-surface-subtle ${className}`} />;
}

export function SkeletonLines({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return <div className={`grid gap-2 ${className}`} aria-label="Carregando conteúdo" role="status">{Array.from({ length: lines }, (_, index) => <Skeleton key={index} className={`h-3 ${index === lines - 1 ? "w-2/3" : "w-full"}`} />)}</div>;
}

export function LoadingCard({ className = "", lines = 3 }: { className?: string; lines?: number }) {
  return <section className={`rounded-[20px] border border-line bg-paper p-5 ${className}`} role="status" aria-label="Carregando conteúdo"><Skeleton className="h-4 w-24" /><Skeleton className="mt-4 h-8 w-16" /><SkeletonLines lines={lines} className="mt-5" /></section>;
}

export function TableSkeleton({ rows = 5, columns = 5, className = "" }: { rows?: number; columns?: number; className?: string }) {
  return <div className={`overflow-hidden rounded-[20px] border border-line bg-paper ${className}`} role="status" aria-label="Carregando tabela"><div className="grid gap-3 border-b border-line bg-surface-subtle/65 px-5 py-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{Array.from({ length: columns }, (_, index) => <Skeleton key={index} className="h-3" />)}</div>{Array.from({ length: rows }, (_, row) => <div key={row} className="grid gap-3 border-b border-line px-5 py-4 last:border-b-0" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{Array.from({ length: columns }, (_, column) => <Skeleton key={column} className={`h-4 ${column === 0 ? "w-4/5" : "w-3/5"}`} />)}</div>)}</div>;
}

export function Alert({ tone = "info", title, children, className = "" }: { tone?: "info" | "success" | "error" | "warning"; title?: string; children: ReactNode; className?: string }) {
  const tones = { info: "border-info/15 bg-info-soft text-info", success: "border-pine/15 bg-pine-soft text-pine", error: "border-danger/15 bg-danger-soft text-danger", warning: "border-amber/15 bg-amber-soft text-amber" };
  const icons = { info: "i", success: "✓", error: "!", warning: "!" };
  return <div className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 text-sm ${tones[tone]} ${className}`} role={tone === "error" ? "alert" : "status"}><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-current/10 text-xs font-bold">{icons[tone]}</span><div className="min-w-0">{title && <strong className="block font-semibold">{title}</strong>}<div className={title ? "mt-0.5 leading-6 opacity-90" : "leading-6"}>{children}</div></div></div>;
}
