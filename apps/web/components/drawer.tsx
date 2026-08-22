'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  side: 'left' | 'right';
  title: string;
  eyebrow?: string;
  children: ReactNode;
};

export function Drawer({ open, onClose, side, title, eyebrow, children }: DrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  const [rendered, setRendered] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    let firstFrame = 0;
    let secondFrame = 0;
    let unmountTimer: ReturnType<typeof setTimeout> | undefined;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (open) {
      setRendered(true);
      if (reduceMotion) setVisible(true);
      else firstFrame = requestAnimationFrame(() => {
          secondFrame = requestAnimationFrame(() => setVisible(true));
        });
    } else {
      setVisible(false);
      unmountTimer = setTimeout(() => setRendered(false), reduceMotion ? 0 : 240);
    }

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      if (unmountTimer) clearTimeout(unmountTimer);
    };
  }, [open]);

  useEffect(() => {
    if (!rendered) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCloseRef.current();
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [rendered]);

  if (!rendered || typeof document === 'undefined') return null;

  const closedTransform = side === 'left'
    ? '-translate-x-5 scale-[.985] opacity-0'
    : 'translate-x-5 scale-[.985] opacity-0';
  const transformOrigin = side === 'left' ? 'origin-left' : 'origin-right';

  return createPortal(<div className="fixed inset-0 z-[100]" role="presentation"><button className={`absolute inset-0 cursor-default bg-[#542a30]/40 backdrop-blur-[2px] transition-opacity duration-200 ease-out motion-reduce:transition-none ${visible ? 'opacity-100' : 'opacity-0'}`} type="button" aria-label="Fechar painel" onClick={onClose}/><section ref={panelRef} className={`absolute inset-y-0 flex w-[min(92vw,430px)] flex-col bg-[#fefbf3] shadow-2xl outline-none transition-[transform,opacity] duration-[240ms] ease-[cubic-bezier(.22,1,.36,1)] will-change-[transform,opacity] motion-reduce:transition-none ${transformOrigin} ${visible ? 'translate-x-0 scale-100 opacity-100' : closedTransform} ${side === 'left' ? 'left-0 border-r border-[#eec0a2]' : 'right-0 border-l border-[#eec0a2]'}`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}><header className="flex items-start justify-between gap-6 border-b border-[#eec0a2] px-6 py-6"><div>{eyebrow&&<p className="mb-2 text-[9px] font-bold uppercase tracking-[.18em] text-[#9f4d4d]">{eyebrow}</p>}<h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-none" id={titleId}>{title}</h2></div><button className="grid size-10 shrink-0 place-items-center rounded-full border border-[#eec0a2] text-2xl leading-none transition hover:border-[#9f4d4d] hover:text-[#9f4d4d]" type="button" aria-label="Fechar" onClick={onClose}>×</button></header><div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div></section></div>, document.body);
}
