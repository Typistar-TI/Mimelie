import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FavoriteButton } from '../../../components/favorite-button';
import { PageContainer } from '../../../components/page-container';
import { brand } from '../../../lib/brand';
import { formatOfferPrice, getOffer } from '../../../lib/offers';
import { pageMetadata } from '../../../lib/seo';

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const offer = await getOffer((await params).slug);
  return offer
    ? pageMetadata({
        title: offer.title,
        description: offer.description ?? `Oferta selecionada na ${brand.name}.`,
        path: `/oferta/${offer.slug}`,
        imageAlt: offer.title,
      })
    : { robots: { index: false, follow: false } };
}

export default async function OfferPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const offer = await getOffer((await params).slug);
  if (!offer) notFound();
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: offer.title,
    description: offer.description ?? undefined,
    image: offer.imageUrl ?? undefined,
    brand: { '@type': 'Brand', name: offer.store.name },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: offer.currentPrice.toFixed(2),
      availability: 'https://schema.org/InStock',
      url: `${brand.siteUrl}/oferta/${offer.slug}`,
    },
  };
  return (
    <main className="bg-[#fefbf3] py-10 md:py-16">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        type="application/ld+json"
      />
      <PageContainer className="grid gap-8 lg:grid-cols-[1fr_.9fr]">
        <div className="grid min-h-[420px] place-items-center overflow-hidden rounded-[2rem] bg-[#fbebdc]">
          {offer.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={offer.title}
              className="h-full max-h-[620px] w-full object-cover"
              src={offer.imageUrl}
            />
          ) : (
            <span className="font-[family-name:var(--font-display)] text-6xl text-[#9f4d4d]/35">
              {brand.name}
            </span>
          )}
        </div>
        <section className="flex flex-col justify-center rounded-[2rem] bg-white p-7 md:p-12">
          <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#9f4d4d]">
            {offer.store.name}
            {offer.category ? ` · ${offer.category.name}` : ''}
          </p>
          <h1 className="my-5 font-[family-name:var(--font-display)] text-5xl font-medium leading-[.9] tracking-[-.03em] md:text-7xl">
            {offer.title}
          </h1>
          <div className="flex items-end gap-4">
            <strong className="font-[family-name:var(--font-display)] text-4xl">
              {formatOfferPrice(offer.currentPrice)}
            </strong>
            {offer.originalPrice ? (
              <span className="pb-1 text-sm text-[#765052] line-through">
                {formatOfferPrice(offer.originalPrice)}
              </span>
            ) : null}
          </div>
          {offer.couponCode ? (
            <p className="mt-5 w-max rounded-full bg-[#f3d0bd] px-4 py-2 text-xs font-extrabold uppercase tracking-wider">
              Use o cupom {offer.couponCode}
            </p>
          ) : null}
          {offer.description ? (
            <p className="mt-6 whitespace-pre-line text-sm leading-7 text-[#765052]">
              {offer.description}
            </p>
          ) : null}
          <a
            className="mt-8 block rounded-full bg-[#542a30] px-7 py-4 text-center text-xs font-extrabold text-white transition hover:bg-[#9f4d4d]"
            href={`/api/offers/${offer.id}/go?source=site`}
            rel="nofollow sponsored noopener"
            target="_blank"
          >
            Ver oferta na loja ↗
          </a>
          <FavoriteButton offerId={offer.id} />
          <p className="mt-4 text-[10px] leading-5 text-[#765052]">
            Preço e disponibilidade conferidos na publicação. A compra acontece no site da
            loja parceira. Podemos receber comissão por este link.
          </p>
          <Link
            className="mt-6 w-max border-b border-[#542a30] pb-1 text-xs font-bold"
            href="/ofertas"
          >
            ← Voltar para as ofertas
          </Link>
        </section>
      </PageContainer>
    </main>
  );
}
