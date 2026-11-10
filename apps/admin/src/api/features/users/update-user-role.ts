import type { UserRole } from "../../types";
import { apiRequest, type ApiResponse } from "../../client";
import type { ManagedUser } from "./list-users";

export type UpdateUserRoleInput = { role: UserRole };
export const updateUserRole = (id: string, input: UpdateUserRoleInput) =>
  apiRequest<ApiResponse<ManagedUser>>(`/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
