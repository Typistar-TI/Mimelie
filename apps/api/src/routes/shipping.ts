import { Hono } from "hono";
import { z } from "zod";
import type { AppEnv } from "../types";
import { parseQuery } from "../lib/http";
import { quoteShipping } from "../lib/shipping";

export const shippingRoutes = new Hono<AppEnv>();

shippingRoutes.get("/shipping/quote", async (c) => {
  const query = parseQuery(
    c,
    z.object({
      postalCode: z.string().min(8).max(9),
      subtotal: z.coerce.number().int().nonnegative().default(0),
    }),
  );
  const quote = await quoteShipping(c.env, query.postalCode, query.subtotal ?? 0);
  return c.json({
    price: quote.priceCents,
    deadlineDays: quote.deadlineDays,
    zone: quote.zone,
    free: quote.free,
  });
});
