import type { UserRole } from "../../types";
import { apiRequest, type ApiResponse } from "../../client";

export type ManagedUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  emailVerifiedAt: string | null;
  createdAt: string;
};
export const listUsers = () =>
  apiRequest<ApiResponse<ManagedUser[]>>("/admin/users");
