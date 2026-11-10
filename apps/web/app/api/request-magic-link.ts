import { useMutation } from '@tanstack/react-query';
import { protectedRequest } from './client';

export type RequestMagicLinkInput = { email: string };
export type RequestMagicLinkResult = {
  accepted: true;
  developmentUrl?: string;
};

export function requestMagicLink(input: RequestMagicLinkInput) {
  return protectedRequest<RequestMagicLinkResult>('/api/auth/magic-link', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function useRequestMagicLink() {
  return useMutation({ mutationFn: requestMagicLink });
}
