import type { SessionUser } from "../../types";
import { apiRequest } from "../../client";

export type LoginInput = { email: string; password: string; totpCode?: string };
export type LoginResult = { user: SessionUser };
export const login = (input: LoginInput) =>
  apiRequest<LoginResult>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
