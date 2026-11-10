import { apiRequest, type ApiResponse } from "../../client";
import type { AdminProduct } from "./list-products";

export type UpdateProductInput = Partial<
  Pick<AdminProduct, "name" | "shortDescription" | "category" | "status">
> & { images?: Array<{ key: string; alt: string }> };

export const updateProduct = (id: string, input: UpdateProductInput) =>
  apiRequest<ApiResponse<AdminProduct>>(`/admin/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
