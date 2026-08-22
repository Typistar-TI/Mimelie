import { BrandSymbol } from './brand-symbol';
import { BrandWordmark } from './brand-wordmark';

export function BrandLogo({ className = '', symbolClassName = 'size-8', wordmarkClassName = 'text-3xl' }: { className?: string; symbolClassName?: string; wordmarkClassName?: string }) {
  return <span className={`inline-flex items-center gap-[.42em] ${className}`}><BrandSymbol className={`shrink-0 ${symbolClassName}`} decorative/><BrandWordmark className={wordmarkClassName}/></span>;
}
