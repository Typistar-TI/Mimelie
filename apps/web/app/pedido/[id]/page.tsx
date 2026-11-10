import { formatBRL } from '@mimelie/ui';
import { getOrder } from '../../api/order.server';
import { PageContainer } from '../../../components/page-container';
import { PixCopy } from '../../../components/pix-copy';
import { PixQr } from '../../../components/pix-qr';

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ access?: string }> }) {
  const { id } = await params;
  const access = (await searchParams).access ?? '';
  const order = access ? await getOrder(id, access) : null;
  const pix = order?.payment?.pix;
  const waiting = order?.payment?.status === 'PENDING' && pix?.copyPaste;
  return <main className="min-h-[75vh] bg-[#fbebdc] py-20"><PageContainer className="grid place-items-center"><section className="w-full max-w-3xl rounded-[2rem] bg-[#fefbf3] p-7 md:p-12"><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#9f4d4d]">Pedido recebido</p><h1 className="my-6 font-[family-name:var(--font-display)] text-6xl font-medium leading-[.88] md:text-8xl">Agora é com a gente.</h1><div className="border-t border-[#eec0a2] pt-7">{order?<><h2 className="font-[family-name:var(--font-display)] text-4xl">{order.number}</h2><div className="flex justify-between border-b border-[#eec0a2] py-4"><span>Status</span><strong>{order.status==='PENDING_PAYMENT'?'Aguardando pagamento':order.status}</strong></div><div className="flex justify-between py-4 text-lg"><span>Total</span><strong>{formatBRL(order.total)}</strong></div>{waiting?<div className="mt-4"><p className="mb-4 text-sm leading-6 text-[#765052]">Abra o app do seu banco, escolha pagar com PIX e escaneie o QR code ou cole o código abaixo. A confirmação é feita pela nossa equipe.</p><div className="flex flex-col items-center gap-5 rounded-2xl bg-[#fbebdc] p-5 sm:flex-row sm:items-start"><PixQr value={pix!.copyPaste}/><PixCopy code={pix!.copyPaste}/></div></div>:<p className="rounded-2xl bg-[#f3d0bd] p-4 text-sm">{order.status==='PENDING_PAYMENT'?'Assim que o pagamento for confirmado, avisamos você.':'Pagamento confirmado. Já estamos preparando seu pedido.'}</p>}</>:<><h2 className="font-[family-name:var(--font-display)] text-4xl">Não encontramos esse pedido.</h2><p className="mt-3 text-[#765052]">Confira o link recebido por e-mail.</p></>}</div></section></PageContainer></main>;
}
