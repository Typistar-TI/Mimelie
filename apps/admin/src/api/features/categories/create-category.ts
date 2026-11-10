import { apiRequest, type ApiResponse } from "../../client";
import type { ManagedCategory } from "./list-categories";

export type CreateCategoryInput = {
  name: string;
  description: string | null;
  isActive: boolean;
};
export const createCategory = (input: CreateCategoryInput) =>
  apiRequest<ApiResponse<ManagedCategory>>("/admin/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
