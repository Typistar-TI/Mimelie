'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useConsumeMagicLink } from '../api/consume-magic-link';
import { useRequestMagicLink } from '../api/request-magic-link';
import { PageContainer } from '../../components/page-container';

export default function SignInPage() {
  return <Suspense fallback={<main className="min-h-[70vh] py-20"><PageContainer>Carregando acesso…</PageContainer></main>}><Content/></Suspense>;
}

function Content() {
  const params = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const token = params.get('token');
  const consume = useConsumeMagicLink();
  const request = useRequestMagicLink();

  useEffect(() => {
    if (!token) return;
    consume.mutate(token, {
      onSuccess: () => router.replace('/'),
      onError: () => setMessage('Este link expirou ou já foi usado.'),
    });
  }, [token]);

  function submit(formData: FormData) {
    request.mutate({ email: String(formData.get('email') ?? '') }, {
      onSuccess: () => setMessage('Enviamos um link de acesso. Confira seu e-mail.'),
      onError: () => setMessage('Não foi possível enviar o link.'),
    });
  }

  return <main className="min-h-[75vh] bg-[#f3d0bd] py-20"><PageContainer className="grid place-items-center"><section className="w-full max-w-2xl rounded-[2rem] bg-[#fefbf3] p-7 shadow-[0_24px_70px_rgba(84,42,48,.12)] md:p-12"><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#9f4d4d]">Conta sem senha</p><h1 className="my-6 font-[family-name:var(--font-display)] text-6xl font-medium leading-[.88] md:text-8xl">{token?'Abrindo sua conta…':'Que bom ver você.'}</h1><p className="mb-8 max-w-lg text-sm leading-6 text-[#765052]">Enviaremos um link de uso único. Nada de criar ou lembrar outra senha.</p>{!token&&<form className="flex flex-col gap-3 sm:flex-row" action={submit}><label className="sr-only" htmlFor="email">Seu e-mail</label><input className="min-w-0 flex-1 rounded-full border border-[#eec0a2] bg-white px-5 py-4 outline-none focus:ring-2 focus:ring-[#9f4d4d]/30" id="email" name="email" type="email" placeholder="seu@email.com" required/><button className="rounded-full bg-[#542a30] px-7 py-4 text-xs font-extrabold text-white hover:bg-[#9f4d4d] disabled:opacity-50" disabled={request.isPending}>Enviar meu link</button></form>}{message&&<p className="mt-5 rounded-2xl bg-[#edbfb3] p-4 text-sm" role="status">{message}</p>}</section></PageContainer></main>;
}
