import type { OfferStatus } from "../../types";
import { apiRequest, type ApiResponse } from "../../client";

export type AdminOffer = {
  id: string;
  title: string;
  currentPrice: number;
  originalPrice: number | null;
  couponCode: string | null;
  status: OfferStatus;
  updatedAt: string;
  store: { name: string };
};
export const listOffers = () =>
  apiRequest<ApiResponse<AdminOffer[]>>("/admin/offers");
