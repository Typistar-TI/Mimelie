import { apiRequest, type ApiResponse } from "../../client";

export type Integration = {
  id: string;
  provider: string;
  enabled: boolean;
  settings?: Record<string, unknown>;
  lastHealthAt?: string | null;
};
export const listIntegrations = () =>
  apiRequest<ApiResponse<Integration[]>>("/admin/integrations");
