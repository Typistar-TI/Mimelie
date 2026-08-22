'use client';
import Link from 'next/link';
import { brand } from '../lib/brand';
import { useCart } from './cart-provider';
import { LashMark } from './lash-mark';

export function Header() {
  const { count } = useCart();
  return <header className="relative z-20 grid h-[76px] grid-cols-[1fr_auto] items-center border-b border-[#eec0a2] bg-[#fefbf3]/95 px-5 backdrop-blur-md md:h-[86px] md:grid-cols-[1fr_auto_1fr] md:px-[4vw]"><Link href="/" className="flex w-max items-center gap-2 font-[family-name:var(--font-display)] text-2xl font-bold tracking-wide outline-offset-4 focus-visible:outline-2 focus-visible:outline-[#9f4d4d]" aria-label={`${brand.name}, início`}><LashMark className="h-6 w-11 text-[#c3866b]"/><span>{brand.name}</span></Link><nav className="hidden gap-8 text-sm md:flex" aria-label="Navegação principal"><Link className="hover:text-[#9f4d4d]" href="/#colecao">Cílios</Link><Link className="hover:text-[#9f4d4d]" href="/#ritual">Como usar</Link><Link className="hover:text-[#9f4d4d]" href="/guias/como-escolher-cilios">Guias</Link></nav><Link href="/carrinho" className="justify-self-end text-sm font-semibold hover:text-[#9f4d4d]" aria-label={`Sacola com ${count} itens`}>Sacola <span className="ml-2 inline-grid size-7 place-items-center rounded-full bg-[#edbfb3] text-[10px]">{String(count).padStart(2, '0')}</span></Link></header>;
}
