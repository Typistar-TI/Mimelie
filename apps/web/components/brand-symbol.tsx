import Image from 'next/image';

export function BrandSymbol({ className = '', decorative = false }: { className?: string; decorative?: boolean }) {
  return <Image className={className} src="/branding/explorations/symbol-a.png" width={512} height={512} alt={decorative ? '' : 'Símbolo da Mimelie'} aria-hidden={decorative || undefined}/>;
}
