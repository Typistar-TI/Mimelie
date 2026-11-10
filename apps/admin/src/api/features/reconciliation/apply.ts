import { apiRequest, type ApiResponse } from "../../client";

export type ApplyReconciliationInput = {
  matches: Array<{ orderId: string; externalId: string }>;
};

export const applyReconciliation = (input: ApplyReconciliationInput) =>
  apiRequest<ApiResponse<{ applied: number; skipped: number }>>(
    "/admin/reconciliation/apply",
    { method: "POST", body: JSON.stringify(input) },
  );
