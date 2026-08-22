import { brand } from '../lib/brand';

export function BrandWordmark({ className = '' }: { className?: string }) {
  return <span className={`font-[family-name:var(--font-display)] font-semibold leading-none tracking-[-0.035em] ${className}`}>{brand.name}</span>;
}
