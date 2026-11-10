import { apiRequest, type ApiResponse } from "../../client";
import type { Integration } from "./list-integrations";

export type UpdateIntegrationInput = {
  enabled: boolean;
  credentials?: Record<string, string>;
  settings?: Record<string, unknown>;
};
export const updateIntegration = (
  provider: string,
  input: UpdateIntegrationInput,
) =>
  apiRequest<ApiResponse<Integration>>(`/admin/integrations/${provider}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
