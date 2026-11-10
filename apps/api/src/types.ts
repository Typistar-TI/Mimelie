import type { Env } from "./env.js";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: "CUSTOMER" | "EDITOR" | "ADMIN";
  totpEnabled: boolean;
};

export type AppEnv = {
  Bindings: Env;
  Variables: {
    user: SessionUser | null;
  };
};
