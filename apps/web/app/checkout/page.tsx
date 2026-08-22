'use client';

import type { CheckoutInput } from '@mimelie/contracts';
import { formatBRL } from '@mimelie/ui';
import { useRouter } from 'next/navigation';
import { useCreateCheckout } from '../api/checkout';
import { useCart } from '../../components/cart-provider';

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

  return <main className="mx-auto min-h-[70vh] max-w-6xl px-6 py-20"><p className="text-[10px] font-bold uppercase tracking-[.18em]">Ambiente seguro</p><h1 className="my-4 font-[family-name:var(--font-display)] text-6xl font-medium md:text-8xl">Entrega e pagamento</h1><div className="grid gap-14 lg:grid-cols-[1.4fr_.6fr]"><form className="grid grid-cols-1 gap-5 sm:grid-cols-2" action={submit}><Field name="name" label="Nome completo"/><Field name="email" label="E-mail" type="email"/><Field name="phone" label="WhatsApp"/><Field name="postalCode" label="CEP"/><Field name="street" label="Rua" full/><Field name="number" label="Número"/><Field name="complement" label="Complemento" required={false}/><Field name="district" label="Bairro"/><Field name="city" label="Cidade"/><Field name="state" label="UF" maxLength={2}/>{checkout.error&&<p className="bg-[#edbfb3] p-4 text-sm sm:col-span-2" role="alert">{checkout.error.message}</p>}<button className="border border-[#542a30] bg-[#542a30] px-6 py-4 text-xs font-bold text-white hover:bg-[#9f4d4d] disabled:opacity-50 sm:col-span-2" disabled={checkout.isPending||!cart.items.length}>{checkout.isPending?'Criando pedido…':'Ir para o pagamento seguro'}</button></form><aside className="h-max border border-[#eec0a2] bg-[#fbebdc] p-7"><h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold">Seu pedido</h2>{cart.items.map(item=><div className="flex justify-between border-b border-[#eec0a2] py-4 text-sm" key={item.variantId}><span>{item.quantity}× {item.name}</span><strong>{formatBRL(item.price*item.quantity)}</strong></div>)}<div className="flex justify-between py-4 text-lg font-bold"><span>Total</span><strong>{formatBRL(cart.total+1590)}</strong></div><p className="text-xs leading-5">Pix, cartão ou boleto via Mercado Pago.</p></aside></div></main>;
}

function Field({name,label,type='text',full=false,required=true,maxLength}:{name:string;label:string;type?:string;full?:boolean;required?:boolean;maxLength?:number}){return <div className={`flex flex-col gap-2 ${full?'sm:col-span-2':''}`}><label className="text-[10px] font-bold uppercase tracking-widest" htmlFor={name}>{label}</label><input className="border border-[#eec0a2] bg-white p-3 outline-none focus:border-[#9f4d4d] focus:ring-1 focus:ring-[#9f4d4d]" id={name} name={name} type={type} required={required} maxLength={maxLength}/></div>}
