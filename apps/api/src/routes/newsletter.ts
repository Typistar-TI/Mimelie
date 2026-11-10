import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { newsletterSubscribers } from "@mimelie/db";
import type { AppEnv } from "../types";
import { getDb } from "../lib/db";
import { parseBody } from "../lib/http";

export const newsletterRoutes = new Hono<AppEnv>();

newsletterRoutes.post("/newsletter", async (c) => {
  const input = await parseBody(
    c,
    z.object({
      email: z
        .string()
        .email()
        .transform((value) => value.trim().toLowerCase()),
      name: z.string().trim().max(120).optional(),
    }),
  );
  const db = getDb(c.env);
  const existing = await db
    .select({ id: newsletterSubscribers.id })
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, input.email))
    .limit(1);
  if (!existing[0]) {
    const inserted = await db
      .insert(newsletterSubscribers)
      .values({ email: input.email, name: input.name })
      .returning({ id: newsletterSubscribers.id });
    if (c.env.JOBS && inserted[0]) {
      c.executionCtx.waitUntil(
        c.env.JOBS.send({
          type: "newsletter.welcome",
          subscriberId: inserted[0].id,
        }),
      );
    }
  }
  return c.json({ subscribed: true });
});
