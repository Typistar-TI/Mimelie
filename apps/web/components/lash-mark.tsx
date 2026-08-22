export function LashMark({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 180 74" role="img" aria-label="Curva de cílio em forma de calda">
    <path d="M9 52c35 19 100 17 157-25" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <path d="M45 57 34 37M68 57 61 31M92 53 90 25M116 46l5-24M139 36l11-20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <circle cx="14" cy="54" r="5" fill="currentColor" />
  </svg>;
}
