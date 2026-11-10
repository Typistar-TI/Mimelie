import type { OfferStatus } from "../../types";
import { apiRequest, type ApiResponse } from "../../client";
import type { AdminOffer } from "./list-offers";

export type UpdateOfferInput = Partial<
  Pick<
    AdminOffer,
    "title" | "currentPrice" | "originalPrice" | "couponCode" | "status"
  >
> & { status?: OfferStatus };
export const updateOffer = (id: string, input: UpdateOfferInput) =>
  apiRequest<ApiResponse<AdminOffer>>(`/admin/offers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
