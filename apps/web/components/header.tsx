'use client';
import Link from 'next/link';
import { brand } from '../lib/brand';
import { useCart } from './cart-provider';
import { BrandLogo } from './brand-logo';

export function Header() {
  const { count } = useCart();
  return <header className="relative z-20 grid h-[76px] grid-cols-[1fr_auto] items-center border-b border-[#eec0a2] bg-[#fefbf3]/95 px-5 backdrop-blur-md md:h-[86px] md:grid-cols-[1fr_auto_1fr] md:px-[4vw]"><Link href="/" className="w-max outline-offset-4 focus-visible:outline-2 focus-visible:outline-[#9f4d4d]" aria-label={`${brand.name}, início`}><BrandLogo symbolClassName="size-8 md:size-9" wordmarkClassName="text-[1.75rem] md:text-[2rem]"/></Link><nav className="hidden gap-8 text-sm md:flex" aria-label="Navegação principal"><Link className="hover:text-[#9f4d4d]" href="/#colecao">Cílios</Link><Link className="hover:text-[#9f4d4d]" href="/#ritual">Como usar</Link><Link className="hover:text-[#9f4d4d]" href="/guias/como-escolher-cilios">Guias</Link></nav><Link href="/carrinho" className="justify-self-end text-sm font-semibold hover:text-[#9f4d4d]" aria-label={`Sacola com ${count} itens`}>Sacola <span className="ml-2 inline-grid size-7 place-items-center rounded-full bg-[#edbfb3] text-[10px]">{String(count).padStart(2, '0')}</span></Link></header>;
}
