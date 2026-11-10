import { useMutation } from '@tanstack/react-query';
import type { CheckoutInput } from '@mimelie/contracts';
import { protectedRequest } from './client';

export type PixPayload = {
  copyPaste: string;
  txid: string;
  amountCents: number;
};

export type CheckoutResult = {
  order: { id: string; number: string; total: number };
  accessToken: string;
  pix: PixPayload | null;
};

export function createCheckout(input: CheckoutInput) {
  return protectedRequest<CheckoutResult>('/api/orders/checkout', {
    method: 'POST',
    headers: { 'idempotency-key': crypto.randomUUID() },
    body: JSON.stringify(input),
  });
}

export function useCreateCheckout() {
  return useMutation({ mutationFn: createCheckout });
}
