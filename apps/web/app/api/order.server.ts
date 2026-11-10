import 'server-only';

import { backendFetch } from './server';

export type OrderSummary = {
  number: string;
  status: string;
  total: number;
  payment?: {
    method: string;
    status: string;
    pix?: { copyPaste: string; txid: string; amountCents: number } | null;
  } | null;
};

export async function getOrder(id: string, accessToken: string): Promise<OrderSummary | null> {
  try {
    const response = await backendFetch(`/orders/${encodeURIComponent(id)}`, {
      cache: 'no-store',
      headers: { 'x-order-access-token': accessToken },
    });
    return response.ok ? response.json() as Promise<OrderSummary> : null;
  } catch {
    return null;
  }
}
