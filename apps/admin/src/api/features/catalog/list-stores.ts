import { apiRequest, type ApiResponse } from "../../client";

export type StoreOption = { id: string; name: string };
export const listStores = () =>
  apiRequest<ApiResponse<StoreOption[]>>("/stores");
