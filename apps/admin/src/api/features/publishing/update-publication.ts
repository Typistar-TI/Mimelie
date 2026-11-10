import { apiRequest, type ApiResponse } from "../../client";
import type { Publication } from "./list-publications";

export type UpdatePublicationInput = { status: "PENDING" | "PAUSED" };
export const updatePublication = (id: string, input: UpdatePublicationInput) =>
  apiRequest<ApiResponse<Publication>>(`/admin/publications/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
