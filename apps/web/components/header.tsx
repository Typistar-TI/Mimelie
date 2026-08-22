'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';
import { brand } from '../lib/brand';
import { BrandLogo } from './brand-logo';
import { BrandSymbol } from './brand-symbol';
import { BrandWordmark } from './brand-wordmark';
import { useCart } from './cart-provider';
import { Drawer } from './drawer';

const links = [
  { href: '/#colecao', label: 'Cílios', detail: 'Conheça a coleção inaugural' },
  { href: '/#ritual', label: 'Como usar', detail: 'Seu pequeno ritual' },
  { href: '/guias/como-escolher-cilios', label: 'Guias', detail: 'Escolha, aplique e cuide' },
];

export function Header() {
  const cart = useCart();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const visibleCount = cart.count > 99 ? '99+' : String(cart.count);

  return <>
    <header className="relative z-20 grid h-[76px] grid-cols-[1fr_auto_1fr] items-center border-b border-[#eec0a2] bg-[#fefbf3]/95 px-4 backdrop-blur-md md:h-[86px] md:px-[4vw]">
      <div className="col-start-1 flex min-w-0 items-center gap-3">
        <button className="relative grid size-11 place-items-center rounded-full border border-[#eec0a2] bg-white/65 outline-offset-4 hover:border-[#9f4d4d] focus-visible:outline-2 focus-visible:outline-[#9f4d4d] md:hidden" type="button" aria-label="Abrir menu" aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(true)}>
          <BrandSymbol className="size-9" decorative/>
          <span className="absolute -bottom-0.5 -right-0.5 grid size-[18px] place-items-center rounded-full border-2 border-[#fefbf3] bg-[#9f4d4d] text-white" aria-hidden="true">
            <svg viewBox="0 0 16 16" className="size-2.5"><path d="M2 4h12M2 8h12M2 12h12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </span>
        </button>
        <Link href="/" className="outline-offset-4 focus-visible:outline-2 focus-visible:outline-[#9f4d4d] md:hidden" aria-label={`${brand.name}, início`}><BrandWordmark className="text-[1.75rem]"/></Link>
        <Link href="/" className="hidden w-max outline-offset-4 focus-visible:outline-2 focus-visible:outline-[#9f4d4d] md:block" aria-label={`${brand.name}, início`}><BrandLogo symbolClassName="size-9" wordmarkClassName="text-[2rem]"/></Link>
      </div>

      <nav className="col-start-2 hidden justify-self-center gap-8 text-sm md:flex" aria-label="Navegação principal">
        {links.map((link) => <Link className="hover:text-[#9f4d4d]" href={link.href} key={link.href}>{link.label}</Link>)}
      </nav>

      <button className="relative col-start-3 grid size-11 justify-self-end place-items-center rounded-full border border-[#eec0a2] bg-white/65 text-[#542a30] outline-offset-4 transition hover:border-[#9f4d4d] hover:text-[#9f4d4d] focus-visible:outline-2 focus-visible:outline-[#9f4d4d]" type="button" aria-label={`Abrir sacola com ${cart.count} ${cart.count === 1 ? 'item' : 'itens'}`} aria-expanded={cart.isOpen} onClick={cart.open}>
        <svg className="size-[22px]" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 4.5h2.1l1.35 9.15a1.8 1.8 0 0 0 1.78 1.54h7.88a1.8 1.8 0 0 0 1.75-1.37l1.24-5.07H6.22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9.2" cy="19" r="1.25" fill="currentColor"/><circle cx="17" cy="19" r="1.25" fill="currentColor"/></svg>
        <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full border-2 border-[#fefbf3] bg-[#9f4d4d] px-1 text-[9px] font-extrabold leading-none text-white" aria-hidden="true">{visibleCount}</span>
      </button>
    </header>

    <Drawer open={menuOpen} onClose={closeMenu} side="left" eyebrow="Navegação" title="Mimelie">
      <div id="mobile-navigation" className="flex min-h-full flex-col px-4 py-5">
        <Link className={`mb-2 border px-4 py-4 ${pathname === '/' ? 'border-[#9f4d4d] bg-[#fbebdc]' : 'border-transparent hover:bg-[#fbebdc]'}`} href="/" onClick={closeMenu}><span className="block font-[family-name:var(--font-display)] text-2xl font-semibold">Início</span><small className="text-[#8c5b59]">Voltar para a vitrine</small></Link>
        {links.map((link) => <Link className={`mb-2 border px-4 py-4 ${pathname === link.href ? 'border-[#9f4d4d] bg-[#fbebdc]' : 'border-transparent hover:bg-[#fbebdc]'}`} href={link.href} key={link.href} onClick={closeMenu}><span className="block font-[family-name:var(--font-display)] text-2xl font-semibold">{link.label}</span><small className="text-[#8c5b59]">{link.detail}</small></Link>)}
        <div className="mt-auto border-t border-[#eec0a2] pt-5"><Link className="block px-4 py-3 text-sm font-bold hover:bg-[#fbebdc]" href="/entrar" onClick={closeMenu}>Entrar na minha conta</Link><Link className="block px-4 py-3 text-sm text-[#8c5b59] hover:bg-[#fbebdc]" href="/admin" onClick={closeMenu}>Painel administrativo</Link></div>
      </div>
    </Drawer>
  </>;
}
