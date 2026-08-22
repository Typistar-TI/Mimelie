import type { MetadataRoute } from 'next';
import { siteConfig } from '../lib/seo';
import { getProducts } from './api/catalog.server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  return [
    { url: siteConfig.siteUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteConfig.siteUrl}/guias/como-escolher-cilios`, changeFrequency: 'monthly', priority: 0.7 },
    ...products.map((product) => ({ url: `${siteConfig.siteUrl}/produto/${product.slug}`, changeFrequency: 'weekly' as const, priority: 0.8 })),
  ];
}
