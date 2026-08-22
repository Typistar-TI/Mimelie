import { useQuery } from '@tanstack/react-query';
import { request } from './client';

export type AdminOverview = {
  products: number;
  pendingOrders: number;
  customers: number;
  integrationFailures: number;
};

export const adminOverviewQueryKey = ['admin', 'overview'] as const;

export function getAdminOverview() {
  return request<AdminOverview>('/api/admin/overview');
}

export function useAdminOverview() {
  return useQuery({
    queryKey: adminOverviewQueryKey,
    queryFn: getAdminOverview,
  });
}
