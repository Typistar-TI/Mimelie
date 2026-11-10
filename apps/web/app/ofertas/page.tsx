import type { Metadata } from 'next';
import Link from 'next/link';
import { PageContainer } from '../../components/page-container';
import { brand } from '../../lib/brand';
import { formatOfferPrice, getOffers } from '../../lib/offers';
import { pageMetadata } from '../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Ofertas selecionadas',
  description: 'Cupons, achados e ofertas de beleza escolhidos pela curadoria da Mimelie.',
  path: '/ofertas',
});

export const revalidate = 120;

export default async function OffersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const offers = await getOffers({ q });

  return (
    <main className="min-h-[70vh] bg-[#fefbf3] py-14 md:py-24">
      <PageContainer>
        <div className="grid gap-8 md:grid-cols-[1fr_.6fr] md:items-end">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#9f4d4d]">
              Curadoria Mimelie
            </p>
            <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-6xl font-medium leading-[.9] tracking-[-.04em] md:text-8xl">
              Achados para o seu ritual.
            </h1>
          </div>
          <p className="max-w-md leading-7 text-[#765052]">
            Uma seleção de ofertas de beleza com preço conferido. Quando você compra por um
            destes links, a Mimelie pode receber uma comissão — sem custo extra para você.
          </p>
        </div>

        <form className="mt-10 flex max-w-xl gap-2" action="/ofertas">
          <label className="sr-only" htmlFor="q">
            Buscar ofertas
          </label>
          <input
            className="min-w-0 flex-1 rounded-full border border-[#eec0a2] bg-white px-5 py-4 outline-none focus:ring-2 focus:ring-[#9f4d4d]/25"
            defaultValue={q}
            id="q"
            name="q"
            placeholder="Buscar por produto, marca ou categoria"
            type="search"
          />
          <button className="rounded-full bg-[#542a30] px-6 py-4 text-xs font-extrabold text-white hover:bg-[#9f4d4d]">
            Buscar
          </button>
        </form>

        {offers.length ? (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => (
              <Link
                className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-[#eec0a2] bg-white transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(84,42,48,.12)]"
                href={`/oferta/${offer.slug}`}
                key={offer.id}
              >
                <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-[#fbebdc]">
                  {offer.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={offer.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                      src={offer.imageUrl}
                    />
                  ) : (
                    <span className="font-[family-name:var(--font-display)] text-4xl text-[#9f4d4d]/40">
                      {brand.name}
                    </span>
                  )}
                  {offer.discountPercent ? (
                    <span className="absolute left-4 top-4 rounded-full bg-[#542a30] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                      -{offer.discountPercent}%
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[9px] font-extrabold uppercase tracking-[.18em] text-[#9f4d4d]">
                    {offer.store.name}
                    {offer.category ? ` · ${offer.category.name}` : ''}
                  </p>
                  <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight">
                    {offer.title}
                  </h2>
                  <div className="mt-auto flex items-end gap-3 pt-5">
                    <strong className="text-lg">{formatOfferPrice(offer.currentPrice)}</strong>
                    {offer.originalPrice ? (
                      <span className="text-xs text-[#765052] line-through">
                        {formatOfferPrice(offer.originalPrice)}
                      </span>
                    ) : null}
                  </div>
                  {offer.couponCode ? (
                    <span className="mt-3 w-max rounded-full bg-[#f3d0bd] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider">
                      Cupom {offer.couponCode}
                    </span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-16 rounded-[2rem] bg-[#fbebdc] px-6 py-16 text-center">
            <h2 className="font-[family-name:var(--font-display)] text-4xl">Nada por aqui ainda.</h2>
            <p className="mt-3 text-sm text-[#765052]">
              A curadoria publica novas ofertas ao longo da semana. Volte em breve.
            </p>
          </div>
        )}
      </PageContainer>
    </main>
  );
}
