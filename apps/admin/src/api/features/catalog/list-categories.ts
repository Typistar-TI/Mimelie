import { apiRequest, type ApiResponse } from "../../client";

export type CategoryOption = { id: string; name: string };
export const listCategories = () =>
  apiRequest<ApiResponse<CategoryOption[]>>("/categories");
