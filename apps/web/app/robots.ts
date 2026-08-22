import type { MetadataRoute } from 'next';
import { siteConfig } from '../lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin', '/checkout', '/carrinho', '/pedido', '/entrar', '/offline'],
    },
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
    host: siteConfig.siteUrl,
  };
}
