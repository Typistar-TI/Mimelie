import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { request } from './client';

export type AccountUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

export type AccountOffer = {
  id: string;
  slug: string;
  title: string;
  currentPrice: number;
  originalPrice: number | null;
  couponCode: string | null;
  store: { name: string };
  category: { name: string } | null;
};

export const accountQueryKey = ['account', 'me'] as const;
export const favoritesQueryKey = ['account', 'favorites'] as const;

export function getMe() {
  return request<{ data: AccountUser }>('/api/me');
}

export function getFavorites() {
  return request<{ data: AccountOffer[] }>('/api/me/favorites');
}

export function logout() {
  return request<{ signedOut: true }>('/api/auth/logout', { method: 'POST' });
}

export function useMe() {
  return useQuery({
    queryKey: accountQueryKey,
    queryFn: getMe,
    retry: false,
  });
}

export function useFavorites(enabled: boolean) {
  return useQuery({
    queryKey: favoritesQueryKey,
    queryFn: getFavorites,
    enabled,
  });
}

export function useLogout() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      client.removeQueries({ queryKey: accountQueryKey });
      client.removeQueries({ queryKey: favoritesQueryKey });
    },
  });
}
