import { apiRequest, type ApiResponse } from "../../client";

export type ReconciliationEntry = {
  externalId: string;
  amountCents: number;
  date: string | null;
  description: string;
  orderId: string | null;
  orderNumber: string | null;
  confidence: "high" | "medium" | "ambiguous" | "none";
};

export type ReconciliationPreview = {
  format: "ofx" | "csv";
  entries: ReconciliationEntry[];
  summary: { total: number; matched: number; unmatched: number };
};

export const previewReconciliation = (content: string) =>
  apiRequest<ApiResponse<ReconciliationPreview>>(
    "/admin/reconciliation/preview",
    { method: "POST", body: JSON.stringify({ content }) },
  );
