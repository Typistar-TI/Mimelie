'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, type PointerEvent } from 'react';
import type { Product } from '../app/api/products';
import { BrandSymbol } from './brand-symbol';
import { PageContainer } from './page-container';

const scenes = [
  { image: '/media/hero/curva-caramelo.webp', background: 'bg-[#f2dfd0]', glow: 'bg-[#d99b79]/45', accent: 'text-[#a75154]', label: 'Natural' },
  { image: '/media/hero/nuvem-cacau.webp', background: 'bg-[#e5d5cb]', glow: 'bg-[#9b7365]/35', accent: 'text-[#754449]', label: 'Volume leve' },
  { image: '/media/hero/laco-rosas.webp', background: 'bg-[#efd6d8]', glow: 'bg-[#d98a9d]/40', accent: 'text-[#9f4d5d]', label: 'Curva aberta' },
] as const;

export function HeroShowcase({ products }: { products: Product[] }) {
  const showcase = products.slice(0, scenes.length);
  const [active, setActive] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const product = showcase[active];
  const scene = scenes[active % scenes.length]!;

  useEffect(() => {
    if (showcase.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % showcase.length), 6200);
    return () => window.clearInterval(timer);
  }, [showcase.length]);

  if (!product) return null;

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setTilt({ x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 8, y: ((event.clientY - bounds.top) / bounds.height - 0.5) * -6 });
  }

  return (
    <section id="hero" className={`relative isolate min-h-[900px] scroll-mt-0 overflow-hidden transition-colors duration-1000 sm:min-h-[940px] lg:min-h-screen ${scene.background}`} aria-labelledby="hero-title">
      <div className={`absolute left-1/2 top-[45%] -z-20 aspect-square w-[min(88vw,760px)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[90px] transition-colors duration-1000 ${scene.glow}`} />
      <BrandSymbol className="absolute left-1/2 top-1/2 -z-10 hidden size-[min(48vw,680px)] -translate-x-1/2 -translate-y-1/2 opacity-[.045] lg:block" decorative />

      <PageContainer className="pointer-events-none absolute inset-0 z-20"><div className="relative h-full"><div className="pointer-events-auto absolute left-0 top-[15%] max-w-[90vw] lg:top-[28%] lg:max-w-[34vw]"><p className={`mb-4 text-[10px] font-extrabold uppercase tracking-[.22em] transition-colors duration-700 ${scene.accent}`}>Leve por natureza</p><h1 id="hero-title" className="font-[family-name:var(--font-display)] text-[clamp(4.2rem,7.3vw,7.5rem)] font-semibold uppercase leading-[.72] tracking-[-.06em]">Feito para<br /><span className={`block transition-[color,filter,opacity] duration-700 ${scene.accent}`}>o seu olhar.</span></h1></div><div className="pointer-events-auto absolute bottom-[84px] left-0 max-w-sm lg:bottom-[5vh]"><p className="mb-6 text-sm leading-6 text-[#684245] sm:text-base sm:leading-7">{product.shortDescription}</p><Link className="group inline-flex items-center gap-8 rounded-lg bg-[#542a30] px-6 py-4 text-[10px] font-extrabold uppercase tracking-[.12em] text-white shadow-[0_10px_28px_rgba(84,42,48,.2)] transition hover:-translate-y-1 hover:bg-[#9f4d4d]" href={`/produto/${product.slug}`}>Explorar agora <span className="text-base transition-transform group-hover:translate-x-1">→</span></Link></div><div className="absolute right-0 top-[36%] hidden text-right lg:block"><p className="font-[family-name:var(--font-display)] text-[clamp(4rem,6vw,6.8rem)] font-bold uppercase leading-[.64] tracking-[-.07em] text-[#542a30] [text-shadow:1px_1px_0_rgba(84,42,48,.24),2px_2px_0_rgba(84,42,48,.18),3px_3px_0_rgba(84,42,48,.12),4px_4px_0_rgba(84,42,48,.08)]">Sua<br />curva.<br />Sua.</p></div></div></PageContainer>

      <div className="absolute inset-x-[20vw] bottom-20 top-24 z-10 hidden items-center justify-center lg:flex" onPointerMove={handlePointerMove} onPointerLeave={() => setTilt({ x: 0, y: 0 })}>
        <div className="relative size-full transition-transform duration-500 ease-out motion-reduce:transform-none" style={{ transform: `perspective(1200px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)` }}>
          {showcase.map((item, index) => {
            const selected = index === active;
            const position = index < active ? '-translate-x-[38%] rotate-[12deg]' : 'translate-x-[38%] -rotate-[12deg]';
            return <div className={`absolute inset-0 transition-[opacity,transform,filter] duration-[1100ms] ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none ${selected ? 'translate-x-0 rotate-0 scale-100 opacity-100 blur-0' : `${position} pointer-events-none scale-75 opacity-0 blur-sm`}`} key={item.id} aria-hidden={!selected}><Image className="object-contain drop-shadow-[0_38px_34px_rgba(84,42,48,.22)]" src={scenes[index]!.image} alt={selected ? `Embalagem aberta dos cílios ${item.name}` : ''} fill priority={index === 0} sizes="(min-width:1024px) 68vw, 94vw" /></div>;
          })}
        </div>
      </div>

      <div className="absolute inset-x-4 top-[250px] z-10 h-[390px] sm:top-[270px] sm:h-[440px] lg:hidden">
        {showcase.map((item, index) => {
          const selected = index === active;
          return <div className={`absolute inset-0 transition-[opacity,transform] duration-1000 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none ${selected ? 'translate-x-0 scale-100 opacity-100' : 'translate-x-20 scale-90 opacity-0'}`} key={item.id} aria-hidden={!selected}><Image className="object-contain drop-shadow-[0_28px_25px_rgba(84,42,48,.2)]" src={scenes[index]!.image} alt={selected ? `Embalagem aberta dos cílios ${item.name}` : ''} fill priority={index === 0} sizes="94vw" /></div>;
        })}
      </div>

      <div className="absolute bottom-7 left-1/2 z-30 flex -translate-x-1/2 items-center gap-4 lg:bottom-[5vh]">
        <button className="grid size-11 place-items-center rounded-full bg-[#542a30] text-lg text-white shadow-lg transition hover:scale-110 hover:bg-[#9f4d4d] active:scale-95" onClick={() => setActive((active - 1 + showcase.length) % showcase.length)} type="button" aria-label="Produto anterior">‹</button>
        <div className="min-w-36 text-center sm:min-w-48"><strong className="block font-[family-name:var(--font-display)] text-lg leading-none sm:text-xl" aria-live="polite">{product.name}</strong><span className={`mt-1 block text-[8px] font-extrabold uppercase tracking-[.16em] ${scene.accent}`}>{scene.label}</span></div>
        <button className="grid size-11 place-items-center rounded-full bg-[#542a30] text-lg text-white shadow-lg transition hover:scale-110 hover:bg-[#9f4d4d] active:scale-95" onClick={() => setActive((active + 1) % showcase.length)} type="button" aria-label="Próximo produto">›</button>
      </div>

      <div className="absolute bottom-[4vh] right-[4vw] z-20 hidden size-32 place-items-center rounded-full border border-[#542a30]/25 bg-white/30 backdrop-blur-md xl:grid"><span className="absolute inset-2 rounded-full border border-dashed border-[#542a30]/45 motion-safe:animate-[spin_22s_linear_infinite]" /><BrandSymbol className="size-16" decorative /></div>
    </section>
  );
}
