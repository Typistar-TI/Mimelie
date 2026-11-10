import { apiRequest, type ApiResponse } from "../../client";
import type { ManagedCategory } from "./list-categories";

export type UpdateCategoryInput = Partial<
  Pick<ManagedCategory, "name" | "description" | "isActive">
>;
export const updateCategory = (id: string, input: UpdateCategoryInput) =>
  apiRequest<ApiResponse<ManagedCategory>>(`/admin/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
