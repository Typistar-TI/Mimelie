import { apiRequest, type ApiResponse } from "../../client";

export type AdminStatistics = {
  activeOffers: number;
  rawClicks24h: number;
  clicks24h: number;
  visibleComments: number;
  clicksBySource: Array<{ source: string; clicks: number }>;
};
export const getStatistics = () =>
  apiRequest<ApiResponse<AdminStatistics>>("/admin/statistics");
