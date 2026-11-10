import { useMutation } from '@tanstack/react-query';
import { protectedRequest } from './client';

type ConsumeResult = {
  user: { id: string; email: string };
  requiresTotpEnrollment?: boolean;
};

export function consumeMagicLink(token: string) {
  return protectedRequest<ConsumeResult>('/api/auth/consume', {
    method: 'POST',
    body: JSON.stringify({ token }),
  }).then((result) => result.user);
}

export function useConsumeMagicLink() {
  return useMutation({ mutationFn: consumeMagicLink });
}
