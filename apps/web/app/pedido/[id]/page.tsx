import { formatBRL } from '@mimelie/ui';
import { getOrder } from '../../api/order.server';

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ access?: string }> }) {
  const { id } = await params;
  const access = (await searchParams).access ?? '';
  const order = access ? await getOrder(id, access) : null;
  return <main className="mx-auto min-h-[70vh] max-w-4xl px-6 py-20"><p className="text-[10px] font-bold uppercase tracking-[.18em]">Pedido recebido</p><h1 className="my-6 font-[family-name:var(--font-display)] text-7xl font-medium">Agora é com a gente.</h1><div className="border border-[#eec0a2] bg-[#fbebdc] p-8">{order?<><h2 className="font-[family-name:var(--font-display)] text-4xl">{order.number}</h2><div className="flex justify-between border-b border-[#eec0a2] py-4"><span>Status</span><strong>{order.status==='PENDING_PAYMENT'?'Aguardando pagamento':order.status}</strong></div><div className="flex justify-between py-4 text-lg"><span>Total</span><strong>{formatBRL(order.total)}</strong></div><p className="text-sm">O pagamento do Mercado Pago aparecerá aqui quando as credenciais forem configuradas.</p></>:<><h2 className="font-[family-name:var(--font-display)] text-4xl">Não encontramos esse pedido.</h2><p>Confira o link recebido por e-mail.</p></>}</div></main>;
}
