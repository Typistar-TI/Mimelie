import type { MetadataRoute } from 'next';
import { siteConfig } from '../lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: `${siteConfig.name} — beleza e maquiagem`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#FEFBF3',
    theme_color: '#FEFBF3',
    orientation: 'any',
    lang: 'pt-BR',
    categories: ['beauty', 'shopping', 'lifestyle'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Ver produtos', short_name: 'Produtos', url: '/#produtos', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Minha sacola', short_name: 'Sacola', url: '/carrinho', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Guias de beleza', short_name: 'Guias', url: '/guias/como-escolher-cilios', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    ],
  };
}
