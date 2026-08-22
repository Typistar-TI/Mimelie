'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useConsumeMagicLink } from '../api/consume-magic-link';
import { useRequestMagicLink } from '../api/request-magic-link';

export default function SignInPage() {
  return <Suspense fallback={<main className="mx-auto min-h-[70vh] max-w-3xl px-6 py-20">Carregando acesso…</main>}><Content/></Suspense>;
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

  return <main className="mx-auto min-h-[70vh] max-w-3xl px-6 py-20"><p className="text-[10px] font-bold uppercase tracking-[.18em]">Conta sem senha</p><h1 className="my-6 font-[family-name:var(--font-display)] text-7xl font-medium">{token?'Abrindo sua conta…':'Entre por e-mail.'}</h1>{!token&&<form className="flex flex-col gap-3 bg-[#fbebdc] p-8 sm:flex-row" action={submit}><label className="sr-only" htmlFor="email">Seu e-mail</label><input className="min-w-0 flex-1 border border-[#eec0a2] bg-white p-4" id="email" name="email" type="email" required/><button className="bg-[#542a30] px-6 py-4 text-xs font-bold text-white hover:bg-[#9f4d4d] disabled:opacity-50" disabled={request.isPending}>Enviar link</button></form>}{message&&<p className="mt-5 bg-[#edbfb3] p-4" role="status">{message}</p>}</main>;
}
