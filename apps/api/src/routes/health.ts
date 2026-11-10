import { Hono } from "hono";
import type { AppEnv } from "../types";

export const healthRoutes = new Hono<AppEnv>();

healthRoutes.get("/health", (c) =>
  c.json({
    status: "ok",
    service: "mimelie",
    runtime: "cloudflare-workers",
    time: new Date().toISOString(),
  }),
);
