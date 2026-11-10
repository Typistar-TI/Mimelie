'use client';

import Link from 'next/link';
import { PageContainer } from '../../components/page-container';
import { useFavorites, useLogout, useMe } from '../api/account';

const price = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function AccountPage() {
  const me = useMe();
  const logout = useLogout();
  const favorites = useFavorites(Boolean(me.data));
  const user = me.data?.data;

  if (me.isPending) {
    return (
      <main className="min-h-[60vh] bg-[#fefbf3] py-20">
        <PageContainer>Carregando sua conta…</PageContainer>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-[60vh] bg-[#fefbf3] py-20">
        <PageContainer className="grid place-items-center">
          <section className="w-full max-w-2xl rounded-[2rem] bg-[#fbebdc] p-7 md:p-12">
            <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#9f4d4d]">Sua conta</p>
            <h1 className="my-6 font-[family-name:var(--font-display)] text-6xl font-medium leading-[.88] md:text-7xl">
              Entre para ver seus favoritos.
            </h1>
            <p className="max-w-lg text-sm leading-6 text-[#765052]">
              A conta é sem senha: enviamos um link de uso único para o seu e-mail.
            </p>
            <Link className="mt-8 inline-block rounded-full bg-[#542a30] px-7 py-4 text-xs font-extrabold text-white hover:bg-[#9f4d4d]" href="/entrar">
              Entrar na Mimelie
            </Link>
          </section>
        </PageContainer>
      </main>
    );
  }

  return (
    <main className="min-h-[60vh] bg-[#fefbf3] py-16 md:py-24">
      <PageContainer>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#9f4d4d]">Sua conta</p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-6xl font-medium leading-[.9] md:text-7xl">
              Olá, {user.name ?? user.email.split('@')[0]}.
            </h1>
            <p className="mt-3 text-sm text-[#765052]">{user.email}</p>
          </div>
          <button
            className="w-max rounded-full border border-[#542a30] px-5 py-3 text-xs font-bold transition hover:bg-[#542a30] hover:text-white"
            type="button"
            onClick={() => logout.mutate()}
          >
            Sair da conta
          </button>
        </div>

        <section className="mt-14">
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold">Ofertas favoritas</h2>
          {favorites.data?.data.length ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.data.data.map((offer) => (
                <Link
                  className="rounded-[1.5rem] border border-[#eec0a2] bg-white p-5 transition hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(84,42,48,.1)]"
                  href={`/oferta/${offer.slug}`}
                  key={offer.id}
                >
                  <p className="text-[9px] font-extrabold uppercase tracking-[.18em] text-[#9f4d4d]">
                    {offer.store.name}
                    {offer.category ? ` · ${offer.category.name}` : ''}
                  </p>
                  <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight">{offer.title}</h3>
                  <p className="mt-4 text-sm font-bold">{price(offer.currentPrice)}</p>
                  {offer.couponCode ? <p className="mt-2 text-[10px] font-extrabold uppercase tracking-wider text-[#9f4d4d]">Cupom {offer.couponCode}</p> : null}
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[2rem] bg-[#fbebdc] px-6 py-14 text-center">
              <p className="font-[family-name:var(--font-display)] text-3xl">Nenhum favorito ainda.</p>
              <p className="mt-2 text-sm text-[#765052]">Salve as ofertas que te interessam para encontrar depois.</p>
              <Link className="mt-6 inline-block rounded-full bg-[#542a30] px-6 py-3 text-xs font-bold text-white" href="/ofertas">
                Ver ofertas
              </Link>
            </div>
          )}
        </section>
      </PageContainer>
    </main>
  );
}
