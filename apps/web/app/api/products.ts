import { useQuery } from '@tanstack/react-query';
import { request } from './client';

export type Product = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  category: string;
  variants: Array<{ id: string; name: string; price: number; sku: string }>;
  images: Array<{ key: string; alt: string }>;
};

export const demoProducts: Product[] = [
  { id: 'demo-1', slug: 'curva-de-caramelo', name: 'Curva de Caramelo', shortDescription: 'Leve, macio e desenhado para acompanhar o seu olhar.', category: 'Cílios', variants: [{ id: 'demo-natural', name: 'Natural', price: 4990, sku: 'CIL-CURVA-01' }], images: [] },
  { id: 'demo-2', slug: 'nuvem-de-cacau', name: 'Nuvem de Cacau', shortDescription: 'Volume delicado com fios que desaparecem na linha dos olhos.', category: 'Cílios', variants: [{ id: 'demo-volume', name: 'Volume leve', price: 5590, sku: 'CIL-NUVEM-01' }], images: [] },
  { id: 'demo-3', slug: 'laco-de-rosas', name: 'Laço de Rosas', shortDescription: 'Uma curva aberta e romântica para ocasiões especiais.', category: 'Cílios', variants: [{ id: 'demo-rose', name: 'Curva aberta', price: 5990, sku: 'CIL-LACO-01' }], images: [] },
];

export const productsQueryKey = ['catalog', 'products'] as const;

export function getProducts() {
  return request<Product[]>('/api/catalog/products');
}

export function useProducts(initialData?: Product[]) {
  return useQuery({
    queryKey: productsQueryKey,
    queryFn: getProducts,
    initialData: initialData ?? demoProducts,
    staleTime: 5 * 60_000,
  });
}
