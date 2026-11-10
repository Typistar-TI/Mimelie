export type ProductMedia = {
  image: string;
  tone: string;
  alt: string;
  unoptimized?: boolean;
};

export const productMedia: Record<string, { image: string; tone: string; alt: string }> = {
  'curva-de-caramelo': {
    image: '/media/hero/curva-caramelo.webp',
    tone: 'bg-[#f3d0bd]',
    alt: 'Embalagem dos cílios Curva de Caramelo',
  },
  'nuvem-de-cacau': {
    image: '/media/hero/nuvem-cacau.webp',
    tone: 'bg-[#dca39b]',
    alt: 'Embalagem dos cílios Nuvem de Cacau',
  },
  'laco-de-rosas': {
    image: '/media/hero/laco-rosas.webp',
    tone: 'bg-[#edbfb3]',
    alt: 'Embalagem dos cílios Laço de Rosas',
  },
};

export function getProductMedia(slug: string) {
  return productMedia[slug] ?? productMedia['curva-de-caramelo']!;
}

export function getProductMediaFor(product: {
  slug: string;
  name: string;
  images?: Array<{ key: string; alt: string }>;
}): ProductMedia {
  const uploaded = product.images?.[0];
  if (uploaded?.key) {
    return {
      image: uploaded.key.startsWith('http')
        ? uploaded.key
        : `/api/media/${uploaded.key}`,
      tone: 'bg-[#f2dfd0]',
      alt: uploaded.alt || product.name,
      unoptimized: true,
    };
  }
  return { ...getProductMedia(product.slug), unoptimized: false };
}
