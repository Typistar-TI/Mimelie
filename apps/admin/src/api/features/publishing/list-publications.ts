import { apiRequest, type ApiResponse } from "../../client";

export type Publication = {
  id: string;
  destination: string;
  status: "PENDING" | "SENT" | "FAILED" | "PAUSED";
  attempts: number;
  error?: string | null;
  offer?: {
    title?: string;
    currentPrice?: string | number;
    couponCode?: string | null;
    store?: { name?: string };
  };
};
export const listPublications = () =>
  apiRequest<ApiResponse<Publication[]>>("/admin/publications");
