import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import type { AppEnv } from "./types";
import { loadSession, verifyOrigin } from "./lib/auth";
import { adminRoutes } from "./routes/admin";
import { authRoutes } from "./routes/auth";
import { catalogRoutes } from "./routes/catalog";
import { communityRoutes } from "./routes/community";
import { healthRoutes } from "./routes/health";
import { mediaRoutes } from "./routes/media";
import { newsletterRoutes } from "./routes/newsletter";
import { orderRoutes } from "./routes/orders";
import { reconciliationRoutes } from "./routes/reconciliation";
import { shippingRoutes } from "./routes/shipping";
import { webhookRoutes } from "./routes/webhooks";

export const app = new Hono<AppEnv>();

app.use("*", logger());
app.use("*", secureHeaders());
app.use("*", async (c, next) => {
  const origin = c.req.header("origin");
  const allowed = [
    c.env.WEB_ORIGIN,
    c.env.ADMIN_ORIGIN,
    c.env.API_PUBLIC_URL,
  ].filter(Boolean);
  if (origin && allowed.includes(origin)) {
    c.header("access-control-allow-origin", origin);
    c.header("access-control-allow-credentials", "true");
    c.header("vary", "origin");
  }
  if (c.req.method === "OPTIONS") {
    return c.body(null, 204, {
      "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "access-control-allow-headers":
        "content-type,x-csrf-token,idempotency-key,x-order-access-token",
      "access-control-max-age": "86400",
    });
  }
  await next();
});
app.use("*", async (c, next) => {
  c.set("user", await loadSession(c));
  await next();
});
app.use("/v1/*", async (c, next) => {
  verifyOrigin(c);
  await next();
});

app.route("/v1", healthRoutes);
app.route("/v1", mediaRoutes);
app.route("/v1", authRoutes);
app.route("/v1", catalogRoutes);
app.route("/v1", orderRoutes);
app.route("/v1", reconciliationRoutes);
app.route("/v1", communityRoutes);
app.route("/v1", newsletterRoutes);
app.route("/v1", shippingRoutes);
app.route("/v1", webhookRoutes);
app.route("/v1", adminRoutes);

app.get("/", (c) =>
  c.json({ service: "mimelie-api", docs: "/v1/health", version: "1.0.0" }),
);

app.notFound((c) =>
  c.json({ error: "NOT_FOUND", message: "Rota não encontrada." }, 404),
);

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return c.json(
      {
        error: error.status === 401 ? "UNAUTHORIZED" : "REQUEST_ERROR",
        message: error.message,
      },
      error.status,
    );
  }
  console.error(error);
  return c.json(
    {
      error: "INTERNAL_ERROR",
      message: "Não foi possível concluir esta ação.",
    },
    500,
  );
});
