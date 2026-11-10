import type { OfferStatus } from "../../types";
import { apiRequest, type ApiResponse } from "../../client";
import type { AdminOffer } from "./list-offers";

export type CreateOfferInput = {
  title: string;
  storeId: string;
  categoryId: string | null;
  currentPrice: number;
  originalPrice: number | null;
  affiliateUrl: string;
  couponCode: string | null;
  status: Extract<OfferStatus, "DRAFT" | "PUBLISHED">;
};
export const createOffer = (input: CreateOfferInput) =>
  apiRequest<ApiResponse<AdminOffer>>("/admin/offers", {
    method: "POST",
    body: JSON.stringify(input),
  });
