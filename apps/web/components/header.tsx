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
import { PageContainer } from './page-container';

const links = [
  { label: 'Novidades', href: '/#colecao' },
  { label: 'Como escolher', href: '/guias/como-escolher-cilios' },
  { label: 'Entrega', href: '/entrega' },
];
const categories = [
  { label: 'Efeito natural', detail: 'Leve e quase imperceptível', href: '/produto/curva-de-caramelo', surface: 'bg-[#f2dfd0]' },
  { label: 'Volume leve', detail: 'Presença sem pesar', href: '/produto/nuvem-de-cacau', surface: 'bg-[#e5d5cb]' },
  { label: 'Curva aberta', detail: 'Um olhar mais luminoso', href: '/produto/laco-de-rosas', surface: 'bg-[#efd6d8]' },
];

export function Header() {
  const cart = useCart();
  const pathname = usePathname();
  const overlaysHero = pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const visibleCount = cart.count > 99 ? '99+' : String(cart.count);

  return <>
    <header className={`${overlaysHero ? 'absolute inset-x-0 top-0 border-transparent bg-transparent' : 'relative border-[#eec0a2] bg-[#fefbf3]/95 backdrop-blur-md'} z-40 h-[76px] border-b md:h-[86px]`}><PageContainer className="grid h-full grid-cols-[1fr_auto_1fr] items-center">
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

      <nav className="col-start-2 hidden h-full items-center justify-self-center gap-5 md:flex lg:gap-8" aria-label="Navegação principal">
        <Link className="text-[11px] font-bold transition hover:text-[#9f4d4d]" href={links[0]!.href}>{links[0]!.label}</Link>
        <div className="group relative flex h-full items-center"><button className="flex items-center gap-1.5 text-[11px] font-bold transition group-hover:text-[#9f4d4d]" type="button" aria-haspopup="true">Categorias <span className="text-[9px] transition-transform group-hover:rotate-180">⌄</span></button><div className="invisible absolute left-1/2 top-[calc(100%-8px)] w-[560px] -translate-x-1/2 translate-y-2 rounded-[1.5rem] border border-[#542a30]/10 bg-[#fefbf3]/95 p-3 opacity-0 shadow-[0_24px_60px_rgba(84,42,48,.16)] backdrop-blur-xl transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"><div className="grid grid-cols-3 gap-2">{categories.map((category)=><Link className={`group/category rounded-[1rem] p-4 ${category.surface}`} href={category.href} key={category.label}><span className="block font-[family-name:var(--font-display)] text-xl font-semibold leading-none transition group-hover/category:text-[#9f4d4d]">{category.label}</span><small className="mt-2 block text-[10px] leading-4 text-[#765052]">{category.detail}</small></Link>)}</div><Link className="mt-2 flex items-center justify-between rounded-xl px-4 py-3 text-[10px] font-extrabold uppercase tracking-[.14em] hover:bg-[#fbebdc]" href="/#colecao">Ver toda a coleção <span>→</span></Link></div></div>
        {links.slice(1).map((link)=><Link className="text-[11px] font-bold transition hover:text-[#9f4d4d]" href={link.href} key={link.href}>{link.label}</Link>)}
      </nav>

      <button className="relative col-start-3 grid size-11 justify-self-end place-items-center rounded-full border border-[#eec0a2] bg-white/65 text-[#542a30] outline-offset-4 transition hover:border-[#9f4d4d] hover:text-[#9f4d4d] focus-visible:outline-2 focus-visible:outline-[#9f4d4d]" type="button" aria-label={`Abrir sacola com ${cart.count} ${cart.count === 1 ? 'item' : 'itens'}`} aria-expanded={cart.isOpen} onClick={cart.open}>
        <svg className="size-[22px]" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 4.5h2.1l1.35 9.15a1.8 1.8 0 0 0 1.78 1.54h7.88a1.8 1.8 0 0 0 1.75-1.37l1.24-5.07H6.22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9.2" cy="19" r="1.25" fill="currentColor"/><circle cx="17" cy="19" r="1.25" fill="currentColor"/></svg>
        <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full border-2 border-[#fefbf3] bg-[#9f4d4d] px-1 text-[9px] font-extrabold leading-none text-white" aria-hidden="true">{visibleCount}</span>
      </button>
    </PageContainer></header>

    <Drawer open={menuOpen} onClose={closeMenu} side="left" eyebrow="Navegação" title="Mimelie">
      <div id="mobile-navigation" className="flex min-h-full flex-col px-4 py-5">
        <Link className="mb-2 rounded-[1.25rem] px-4 py-4 hover:bg-[#fbebdc]" href="/#colecao" onClick={closeMenu}><span className="block font-[family-name:var(--font-display)] text-2xl font-semibold">Novidades</span><small className="text-[#765052]">Conheça a primeira coleção</small></Link>
        <p className="mb-2 mt-4 px-4 text-[9px] font-extrabold uppercase tracking-[.18em] text-[#9f4d4d]">Categorias</p>
        {categories.map((category) => <Link className={`mb-2 rounded-[1.25rem] px-4 py-4 transition-colors hover:brightness-[.98] ${category.surface}`} href={category.href} key={category.label} onClick={closeMenu}><span className="block font-[family-name:var(--font-display)] text-2xl font-semibold">{category.label}</span><small className="text-[#765052]">{category.detail}</small></Link>)}
        <Link className="mt-2 rounded-[1.25rem] px-4 py-4 hover:bg-[#fbebdc]" href="/guias/como-escolher-cilios" onClick={closeMenu}><span className="block font-[family-name:var(--font-display)] text-2xl font-semibold">Como escolher</span><small className="text-[#765052]">Guias para encontrar seu efeito</small></Link>
        <Link className="rounded-[1.25rem] px-4 py-4 hover:bg-[#fbebdc]" href="/entrega" onClick={closeMenu}><span className="block font-[family-name:var(--font-display)] text-2xl font-semibold">Entrega</span><small className="text-[#765052]">Prazos e rastreamento</small></Link>
        <div className="mt-auto border-t border-[#eec0a2] pt-5"><Link className="block px-4 py-3 text-sm font-bold hover:bg-[#fbebdc]" href="/entrar" onClick={closeMenu}>Entrar na minha conta</Link><Link className="block px-4 py-3 text-sm text-[#8c5b59] hover:bg-[#fbebdc]" href="/admin" onClick={closeMenu}>Painel administrativo</Link></div>
      </div>
    </Drawer>
  </>;
}
