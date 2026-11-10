import { Hono } from "hono";
import { z } from "zod";
import type { AppEnv } from "../types";
import { requireStaff } from "../lib/auth";
import { parseBody } from "../lib/http";
import {
  applyMatches,
  matchEntries,
  parseBankStatement,
} from "../lib/reconciliation";

export const reconciliationRoutes = new Hono<AppEnv>();

reconciliationRoutes.post("/admin/reconciliation/preview", async (c) => {
  requireStaff(c);
  const { content } = await parseBody(
    c,
    z.object({ content: z.string().min(10).max(2_000_000) }),
  );
  const parsed = parseBankStatement(content);
  const entries = await matchEntries(c.env, parsed.entries);
  return c.json({
    data: {
      format: parsed.format,
      entries,
      summary: {
        total: entries.length,
        matched: entries.filter((entry) => entry.orderId).length,
        unmatched: entries.filter((entry) => !entry.orderId).length,
      },
    },
  });
});

reconciliationRoutes.post("/admin/reconciliation/apply", async (c) => {
  requireStaff(c);
  const { matches } = await parseBody(
    c,
    z.object({
      matches: z
        .array(
          z.object({
            orderId: z.string().min(1),
            externalId: z.string().min(1),
          }),
        )
        .min(1)
        .max(500),
    }),
  );
  const result = await applyMatches(c.env, matches);
  return c.json({ data: result });
});
