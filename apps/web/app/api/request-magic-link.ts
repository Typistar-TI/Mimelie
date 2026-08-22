import { useMutation } from '@tanstack/react-query';
import { protectedRequest } from './client';

export type RequestMagicLinkInput = { email: string };

export function requestMagicLink(input: RequestMagicLinkInput) {
  return protectedRequest<{ accepted: true }>('/api/auth/magic-link', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function useRequestMagicLink() {
  return useMutation({ mutationFn: requestMagicLink });
}
