import { Hono } from "hono";
import { webhookEvents } from "@mimelie/db";
import type { AppEnv } from "../types";
import { getDb } from "../lib/db";

export const webhookRoutes = new Hono<AppEnv>();

webhookRoutes.post("/webhooks/:provider", async (c) => {
  const provider = c.req.param("provider").toUpperCase().replaceAll("-", "_");
  const payload = (await c.req.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  const externalId = String(
    payload.id ?? payload.resource ?? payload.order_id ?? "",
  );
  if (!externalId) return c.json({ accepted: false }, 400);
  const type = String(payload.type ?? payload.topic ?? "unknown");
  await getDb(c.env)
    .insert(webhookEvents)
    .values({
      provider,
      externalId,
      type,
      signatureOk: false,
      payload,
      status: "IGNORED",
    })
    .onConflictDoNothing();
  return c.json({ accepted: true });
});
