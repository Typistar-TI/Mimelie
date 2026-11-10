import { apiRequest } from "../../client";

export const logout = () =>
  apiRequest<{ ok: true }>("/auth/logout", { method: "POST" });
