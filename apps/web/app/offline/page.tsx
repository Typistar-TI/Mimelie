import Link from 'next/link';
import { privatePageMetadata } from '../../lib/seo';

export const metadata = privatePageMetadata('Sem conexão', 'Você está sem conexão com a internet.');

export default function OfflinePage() {
  return <main className="mx-auto grid min-h-[70vh] max-w-3xl place-content-center px-6 py-20 text-center"><p className="text-[10px] font-bold uppercase tracking-[.18em]">Modo offline</p><h1 className="my-6 font-[family-name:var(--font-display)] text-6xl font-medium md:text-8xl">A beleza espera um instante.</h1><p className="mx-auto max-w-xl leading-7">Não conseguimos acessar a internet agora. Seus itens continuam guardados nesta tela; tente novamente quando a conexão voltar.</p><Link className="mx-auto mt-8 border border-[#542a30] bg-[#542a30] px-6 py-4 text-xs font-bold text-white hover:bg-[#9f4d4d]" href="/">Tentar novamente</Link></main>;
}
