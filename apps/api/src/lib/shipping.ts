import { and, eq, gte, lte } from "drizzle-orm";
import { shippingZones } from "@mimelie/db";
import type { Env } from "../env.js";
import { getDb } from "./db.js";

export type ShippingQuote = {
  priceCents: number;
  deadlineDays: number;
  zone: string;
  free: boolean;
};

export async function quoteShipping(
  env: Env,
  postalCode: string,
  subtotalCents: number,
): Promise<ShippingQuote> {
  const digits = postalCode.replace(/\D/g, "");
  if (digits.length === 8) {
    const rows = await getDb(env)
      .select()
      .from(shippingZones)
      .where(
        and(
          eq(shippingZones.active, true),
          lte(shippingZones.cepStart, digits),
          gte(shippingZones.cepEnd, digits),
        ),
      )
      .limit(1);
    const zone = rows[0];
    if (zone) {
      const free =
        zone.freeAboveCents != null && subtotalCents >= zone.freeAboveCents;
      return {
        priceCents: free ? 0 : zone.priceCents,
        deadlineDays: zone.deadlineDays,
        zone: zone.name,
        free,
      };
    }
  }
  return { priceCents: 1990, deadlineDays: 7, zone: "Padrão", free: false };
}
