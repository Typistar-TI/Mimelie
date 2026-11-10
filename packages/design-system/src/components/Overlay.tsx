import { useEffect, type ReactNode } from "react";
import { Button } from "./Button.js";

function useEscape(onClose: () => void, open: boolean) {
  useEffect(() => { if (!open) return; const listener = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; window.addEventListener("keydown", listener); return () => window.removeEventListener("keydown", listener); }, [onClose, open]);
}

export function Modal({ open, onClose, title, description, children, footer, className = "" }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; footer?: ReactNode; className?: string }) {
  useEscape(onClose, open);
  if (!open) return null;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className={`max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-[22px] border border-line bg-paper p-6 shadow-[0_24px_70px_rgba(28,35,52,.22)] sm:p-7 ${className}`} role="dialog" aria-modal="true" aria-label={title}><header className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold tracking-[-.035em]">{title}</h2>{description && <p className="mt-1.5 text-sm leading-6 text-ink/55">{description}</p>}</div><Button variant="ghost" size="sm" className="h-9 w-9 shrink-0 px-0 text-lg" type="button" onClick={onClose} aria-label="Fechar">×</Button></header><div className="mt-6">{children}</div>{footer && <footer className="mt-7 flex flex-wrap justify-end gap-2 border-t border-line pt-5">{footer}</footer>}</section></div>;
}

export function Sheet({ open, onClose, title, description, children, side = "right" }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; side?: "right" | "left" }) {
  useEscape(onClose, open);
  if (!open) return null;
  return <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[1px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside className={`absolute inset-y-0 flex w-full max-w-md flex-col bg-paper p-6 shadow-[-18px_0_60px_rgba(28,35,52,.18)] ${side === "right" ? "right-0" : "left-0"}`} role="dialog" aria-modal="true" aria-label={title}><header className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold tracking-[-.035em]">{title}</h2>{description && <p className="mt-1.5 text-sm text-ink/55">{description}</p>}</div><Button variant="ghost" size="sm" className="h-9 w-9 shrink-0 px-0 text-lg" type="button" onClick={onClose} aria-label="Fechar">×</Button></header><div className="mt-6 min-h-0 flex-1 overflow-y-auto">{children}</div></aside></div>;
}
