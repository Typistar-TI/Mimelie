import type { SessionUser } from "../../types";
import { apiRequest, type ApiResponse } from "../../client";

export type CurrentAdminUser = Pick<
  SessionUser,
  "id" | "email" | "name" | "role"
> & { emailVerifiedAt: string | null };
export const getCurrentUser = () =>
  apiRequest<ApiResponse<CurrentAdminUser>>("/me");
