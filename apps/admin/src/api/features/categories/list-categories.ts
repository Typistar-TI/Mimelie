import { apiRequest, type ApiResponse } from "../../client";

export type ManagedCategory = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
};
export const listManagedCategories = () =>
  apiRequest<ApiResponse<ManagedCategory[]>>("/admin/categories");
