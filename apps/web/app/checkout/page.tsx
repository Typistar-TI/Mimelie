'use client';

import type { CheckoutInput } from '@mimelie/contracts';
import { formatBRL } from '@mimelie/ui';
import { useRouter } from 'next/navigation';
import { useCreateCheckout } from '../api/checkout';
import { useCart } from '../../components/cart-provider';
import { PageContainer } from '../../components/page-container';

export default function CheckoutPage() {
  const cart = useCart();
  const router = useRouter();
  const checkout = useCreateCheckout();

  function submit(formData: FormData) {
    const value = (name: string) => String(formData.get(name) ?? '');
    const complement = value('complement');
    const input: CheckoutInput = {
      email: value('email'),
      name: value('name'),
      phone: value('phone'),
      items: cart.items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
      shippingAddress: {
        recipient: value('name'),
        postalCode: value('postalCode'),
        street: value('street'),
        number: value('number'),
        ...(complement ? { complement } : {}),
        district: value('district'),
        city: value('city'),
        state: value('state'),
        country: 'BR',
      },
      shippingQuoteId: 'site-standard',
      consentVersion: '2026-01',
    };

    checkout.mutate(input, {
      onSuccess: (result) => {
        cart.clear();
        router.push(`/pedido/${result.order.id}?access=${encodeURIComponent(result.accessToken)}`);
      },
    });
  }

  return <main className="bg-[#fefbf3] py-16 md:py-24"><PageContainer><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#9f4d4d]">Ambiente seguro · etapa 1 de 2</p><h1 className="mb-12 mt-4 font-[family-name:var(--font-display)] text-6xl font-medium leading-none md:text-8xl">Para onde<br/>enviamos?</h1><div className="grid gap-10 lg:grid-cols-[1.25fr_.75fr]"><form className="grid grid-cols-1 gap-5 rounded-[2rem] bg-[#fbebdc] p-6 sm:grid-cols-2 md:p-9" action={submit}><Field name="name" label="Nome completo"/><Field name="email" label="E-mail" type="email"/><Field name="phone" label="WhatsApp"/><Field name="postalCode" label="CEP"/><Field name="street" label="Rua" full/><Field name="number" label="Número"/><Field name="complement" label="Complemento" required={false}/><Field name="district" label="Bairro"/><Field name="city" label="Cidade"/><Field name="state" label="UF" maxLength={2}/>{checkout.error&&<p className="rounded-2xl bg-[#edbfb3] p-4 text-sm sm:col-span-2" role="alert">{checkout.error.message}</p>}<button className="rounded-full bg-[#542a30] px-6 py-4 text-xs font-extrabold text-white transition hover:bg-[#9f4d4d] disabled:opacity-50 sm:col-span-2" disabled={checkout.isPending||!cart.items.length}>{checkout.isPending?'Criando pedido…':'Continuar para pagamento'}</button><p className="text-center text-[10px] leading-5 text-[#765052] sm:col-span-2">Ao continuar, você concorda com os Termos de uso e a Política de privacidade.</p></form><aside className="h-max rounded-[2rem] border border-[#542a30]/15 bg-white p-7 lg:sticky lg:top-28"><p className="text-[9px] font-extrabold uppercase tracking-[.18em] text-[#9f4d4d]">Resumo</p><h2 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold">Sua escolha</h2>{cart.items.map(item=><div className="flex justify-between border-b border-[#eec0a2] py-4 text-sm" key={item.variantId}><span>{item.quantity}× {item.name}</span><strong>{formatBRL(item.price*item.quantity)}</strong></div>)}<div className="flex justify-between py-4 text-lg font-bold"><span>Total estimado</span><strong>{formatBRL(cart.total+1590)}</strong></div><p className="text-xs leading-5 text-[#765052]">Inclui frete padrão estimado. Pix, cartão ou boleto via Mercado Pago.</p></aside></div></PageContainer></main>;
}

function Field({name,label,type='text',full=false,required=true,maxLength}:{name:string;label:string;type?:string;full?:boolean;required?:boolean;maxLength?:number}){return <div className={`flex flex-col gap-2 ${full?'sm:col-span-2':''}`}><label className="text-[10px] font-extrabold uppercase tracking-widest" htmlFor={name}>{label}</label><input className="rounded-2xl border border-[#eec0a2] bg-white px-4 py-3 outline-none transition focus:border-[#9f4d4d] focus:ring-2 focus:ring-[#9f4d4d]/20" id={name} name={name} type={type} required={required} maxLength={maxLength}/></div>}
