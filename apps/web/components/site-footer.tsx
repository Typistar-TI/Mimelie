'use client';

import Link from 'next/link';
import { BrandLogo } from './brand-logo';
import { PageContainer } from './page-container';

const columns: Array<{ title: string; links: Array<[string, string]> }> = [
  { title: 'Descobrir', links: [['Coleção','/#colecao'],['Como escolher','/guias/como-escolher-cilios'],['Como aplicar','/#ritual']] },
  { title: 'Atendimento', links: [['Entrega e rastreio','/entrega'],['Trocas e devoluções','/trocas-e-devolucoes'],['Entrar na conta','/entrar']] },
  { title: 'Transparência', links: [['Privacidade','/privacidade'],['Política de cookies','/cookies'],['Termos de uso','/termos']] },
];

export function SiteFooter() {
  return <footer className="bg-[#542a30] text-[#fefbf3]"><div className="border-b border-white/15 py-14"><PageContainer className="grid gap-12 xl:grid-cols-[1.3fr_2fr]"><div><BrandLogo symbolClassName="size-14 md:size-16" wordmarkClassName="text-5xl text-white md:text-7xl"/><p className="mt-5 max-w-sm text-sm leading-6 text-white/65">Cílios leves para fazer parte do seu rosto — e não tomar o lugar dele.</p><a className="mt-7 inline-block border-b border-[#edbfb3] pb-1 text-xs font-bold text-[#edbfb3]" href="mailto:oi@mimelie.com.br">oi@mimelie.com.br</a></div><nav className="grid grid-cols-2 gap-9 md:grid-cols-3" aria-label="Rodapé">{columns.map((column)=><div key={column.title}><h2 className="mb-5 text-[10px] font-extrabold uppercase tracking-[.2em] text-[#edbfb3]">{column.title}</h2><ul className="space-y-3 text-sm text-white/75">{column.links.map(([label,href])=><li key={href}><Link className="transition hover:text-white" href={href}>{label}</Link></li>)}</ul></div>)}</nav></PageContainer></div>
    <PageContainer className="flex flex-col gap-5 py-6 text-[10px] text-white/55 md:flex-row md:items-center md:justify-between"><p>© {new Date().getFullYear()} Mimelie. Todos os direitos reservados.</p><div className="flex flex-wrap items-center gap-5"><span>Pix · cartão · boleto</span><span>Envio para todo o Brasil</span><button type="button" className="border-b border-white/40 pb-0.5 transition hover:text-white" onClick={()=>window.dispatchEvent(new Event('mimelie:open-cookie-settings'))}>Configurar cookies</button></div></PageContainer>
  </footer>;
}
