import 'server-only';

import { backendFetch } from '../app/api/server';

export type Offer = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  currentPrice: number;
  originalPrice: number | null;
  discountPercent: number | null;
  couponCode: string | null;
  affiliateUrl: string;
  status: string;
  expiresAt: string | null;
  publishedAt: string | null;
  store: { id: string; name: string; slug: string; logoUrl: string | null };
  category: { name: string; slug: string } | null;
};

export const formatOfferPrice = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export async function getOffers(query: {
  q?: string;
  store?: string;
  category?: string;
  min?: string;
  max?: string;
} = {}): Promise<Offer[]> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  try {
    const response = await backendFetch(`/offers?${params.toString()}`, {
      next: { revalidate: 120 },
    });
    if (!response.ok) return [];
    const body = (await response.json()) as { data: Offer[] };
    return body.data;
  } catch {
    return [];
  }
}

export async function getOffer(slug: string): Promise<Offer | null> {
  try {
    const response = await backendFetch(`/offers/${encodeURIComponent(slug)}`, {
      next: { revalidate: 120 },
    });
    return response.ok ? ((await response.json()) as Offer) : null;
  } catch {
    return null;
  }
}
