import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

const control = "w-full !rounded-[14px] border border-line/80 bg-[var(--ui-control)] px-3.5 text-sm text-ink outline-none transition placeholder:text-ink/38 hover:border-ink/15 hover:bg-paper focus:border-brand focus:bg-paper focus:ring-4 focus:ring-brand/10 disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-ink/45";

export function Field({ label, hint, error, children, className = "" }: { label: string; hint?: string; error?: string; children: ReactNode; className?: string }) {
  return <label className={`grid gap-1.5 ${className}`}><span className="text-xs font-semibold text-ink/75">{label}</span>{children}{error ? <span className="text-xs text-danger">{error}</span> : hint ? <span className="text-xs leading-5 text-ink/48">{hint}</span> : null}</label>;
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className = "", ...props }, ref) {
  return <input ref={ref} className={`${control} min-h-10 ${className}`} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className = "", ...props }, ref) {
  return <textarea ref={ref} className={`${control} min-h-28 resize-y py-2.5 ${className}`} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className = "", children, ...props }, ref) {
  return <span className="relative block"><select ref={ref} className={`${control} min-h-10 appearance-none pr-9 ${className}`} {...props}>{children}</select><svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></span>;
});

export function Checkbox({ label, className = "", ...props }: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return <label className={`flex cursor-pointer items-center gap-2.5 text-sm text-ink/72 ${className}`}><input {...props} type="checkbox" className="h-4 w-4 rounded border-line accent-brand" />{label}</label>;
}
