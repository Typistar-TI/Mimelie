import { useMutation } from '@tanstack/react-query';
import { protectedRequest } from './client';

export function consumeMagicLink(token: string) {
  return protectedRequest<{ id: string; email: string }>('/api/auth/consume', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export function useConsumeMagicLink() {
  return useMutation({ mutationFn: consumeMagicLink });
}
