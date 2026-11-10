import type { MetadataRoute } from 'next';
import { siteConfig } from '../lib/seo';
import { getProducts } from './api/catalog.server';
import { getOffers } from '../lib/offers';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, offers] = await Promise.all([getProducts(), getOffers()]);
  return [
    { url: siteConfig.siteUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteConfig.siteUrl}/ofertas`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteConfig.siteUrl}/guias/como-escolher-cilios`, changeFrequency: 'monthly', priority: 0.7 },
    ...['privacidade', 'cookies', 'termos', 'trocas-e-devolucoes', 'entrega'].map((path) => ({ url: `${siteConfig.siteUrl}/${path}`, changeFrequency: 'yearly' as const, priority: 0.3 })),
    ...products.map((product) => ({ url: `${siteConfig.siteUrl}/produto/${product.slug}`, changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...offers.map((offer) => ({ url: `${siteConfig.siteUrl}/oferta/${offer.slug}`, changeFrequency: 'daily' as const, priority: 0.7 })),
  ];
}
