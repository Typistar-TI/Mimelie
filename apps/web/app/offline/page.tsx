import Link from 'next/link';
import { privatePageMetadata } from '../../lib/seo';
import { PageContainer } from '../../components/page-container';

export const metadata = privatePageMetadata('Sem conexão', 'Você está sem conexão com a internet.');

export default function OfflinePage() {
  return <main className="min-h-[75vh] bg-[#f3d0bd] py-20 text-center"><PageContainer className="grid place-items-center"><section className="max-w-3xl rounded-[2rem] bg-[#fefbf3] p-8 md:p-16"><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#9f4d4d]">Modo offline</p><h1 className="my-6 font-[family-name:var(--font-display)] text-6xl font-medium leading-[.88] md:text-8xl">A beleza espera um instante.</h1><p className="mx-auto max-w-xl leading-7 text-[#765052]">Não conseguimos acessar a internet agora. Seus itens continuam guardados; tente novamente quando a conexão voltar.</p><Link className="mx-auto mt-8 inline-block rounded-full bg-[#542a30] px-6 py-4 text-xs font-bold text-white hover:bg-[#9f4d4d]" href="/">Tentar novamente</Link></section></PageContainer></main>;
}
