import 'server-only';

import { backendFetch } from './server';
import { demoProducts, type Product } from './products';

export async function getProducts(): Promise<Product[]> {
  try {
    const response = await backendFetch('/catalog/products', {
      next: { revalidate: 300 },
    });
    return response.ok ? ((await response.json()) as Product[]) : demoProducts;
  } catch {
    return demoProducts;
  }
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  try {
    const response = await backendFetch(
      `/catalog/products/${encodeURIComponent(slug)}`,
      { next: { revalidate: 300 } },
    );
    return response.ok ? ((await response.json()) as Product) : undefined;
  } catch {
    return demoProducts.find((product) => product.slug === slug);
  }
}
