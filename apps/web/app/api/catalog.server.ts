import 'server-only';

import { backendFetch } from './server';
import { demoProducts, type Product } from './products';

export async function getProducts(): Promise<Product[]> {
  if (!process.env.API_INTERNAL_URL) return demoProducts;

  try {
    const response = await backendFetch('/catalog/products', { next: { revalidate: 300 } });
    return response.ok ? response.json() as Promise<Product[]> : demoProducts;
  } catch {
    return demoProducts;
  }
}

export async function getProduct(slug: string) {
  return (await getProducts()).find((product) => product.slug === slug);
}
