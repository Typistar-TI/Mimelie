import { Hono } from "hono";
import type { AppEnv } from "../types.js";

export const healthRoutes = new Hono<AppEnv>();

healthRoutes.get("/health", (c) =>
  c.json({
    status: "ok",
    service: "mimelie-api",
    runtime: "cloudflare-workers",
    time: new Date().toISOString(),
  }),
);
