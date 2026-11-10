import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type ToastTone = "success" | "error" | "info";
type ToastInput = { title: string; description?: string; tone?: ToastTone; duration?: number };
type Toast = ToastInput & { id: number };
type ToastContextValue = { showToast: (input: ToastInput) => void; dismissToast: (id: number) => void };

const ToastContext = createContext<ToastContextValue | null>(null);
const tones: Record<ToastTone, string> = { success: "border-pine/20 bg-paper text-ink", error: "border-danger/20 bg-paper text-ink", info: "border-line bg-paper text-ink" };
const toneIcons: Record<ToastTone, string> = { success: "✓", error: "!", info: "i" };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismissToast = useCallback((id: number) => setToasts((items) => items.filter((item) => item.id !== id)), []);
  const showToast = useCallback((input: ToastInput) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((items) => [...items.slice(-3), { ...input, id }]);
    const duration = input.duration ?? 4500;
    if (duration > 0) window.setTimeout(() => dismissToast(id), duration);
  }, [dismissToast]);
  const value = useMemo(() => ({ showToast, dismissToast }), [dismissToast, showToast]);
  return <ToastContext.Provider value={value}>{children}<div className="pointer-events-none fixed inset-x-0 top-5 z-50 flex flex-col items-center gap-2 px-4" aria-live="polite" aria-atomic="true">{toasts.map((toast) => { const tone = toast.tone ?? "info"; return <div className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border px-3.5 py-3 shadow-[0_16px_42px_rgba(28,35,52,.15)] ${tones[tone]}`} key={toast.id} role={tone === "error" ? "alert" : "status"}><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${tone === "success" ? "bg-pine-soft text-pine" : tone === "error" ? "bg-danger-soft text-danger" : "bg-info-soft text-info"}`}>{toneIcons[tone]}</span><div className="min-w-0 flex-1 pt-0.5"><strong className="block text-sm font-semibold">{toast.title}</strong>{toast.description && <p className="mt-0.5 text-xs leading-5 text-ink/58">{toast.description}</p>}</div><button className="-mr-1 -mt-1 grid h-7 w-7 place-items-center rounded-lg text-lg leading-none text-ink/45 transition hover:bg-surface-subtle hover:text-ink" aria-label="Fechar aviso" onClick={() => dismissToast(toast.id)}>×</button></div>; })}</div></ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
