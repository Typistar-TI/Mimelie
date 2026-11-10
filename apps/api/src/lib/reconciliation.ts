import { and, eq } from "drizzle-orm";
import { orders, outboxEvents, payments } from "@mimelie/db";
import type { Env } from "../env.js";
import { getDb } from "./db.js";

export type BankEntry = {
  externalId: string;
  amountCents: number;
  date: string | null;
  description: string;
};

export type MatchedEntry = BankEntry & {
  orderId: string | null;
  orderNumber: string | null;
  confidence: "high" | "medium" | "ambiguous" | "none";
};

function tag(block: string, name: string): string | null {
  const match = block.match(new RegExp(`<${name}>([^<\\r\\n]+)`, "i"));
  return match?.[1]?.trim() ?? null;
}

function parseOfxDate(value: string | null): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length !== 8) return null;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

function parseAmount(value: string): number {
  const cleaned = value.replace(/[^\d,.-]/g, "");
  if (!cleaned) return 0;
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  let normalized = cleaned;
  if (lastComma > lastDot) {
    normalized = cleaned.replaceAll(".", "").replace(",", ".");
  } else if (lastDot > lastComma) {
    normalized = cleaned.replaceAll(",", "");
  }
  const amount = Number(normalized);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

function parseCsvDate(value: string): string | null {
  const br = value.match(/^(\d{2})[/-](\d{2})[/-](\d{2,4})$/);
  if (br) {
    const year = br[3]!.length === 2 ? `20${br[3]}` : br[3]!;
    return `${year}-${br[2]}-${br[1]}`;
  }
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return iso ? `${iso[1]}-${iso[2]}-${iso[3]}` : null;
}

function parseCsv(content: string): BankEntry[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return [];
  const delimiter =
    (lines[0]!.match(/;/g)?.length ?? 0) >=
    (lines[0]!.match(/,/g)?.length ?? 0)
      ? ";"
      : ",";
  const entries: BankEntry[] = [];
  lines.forEach((line, index) => {
    if (index === 0 && /data|date|descri|hist/i.test(line) && !/\d{2}[/-]\d{2}/.test(line)) {
      return;
    }
    const cells = line.split(delimiter).map((cell) => cell.trim());
    const dateCell = cells.find((cell) => parseCsvDate(cell));
    const amountCell = cells.find((cell) =>
      /^-?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})$/.test(cell) ||
      /^-?\d+[.,]\d{2}$/.test(cell),
    );
    if (!dateCell || !amountCell) return;
    const amountCents = parseAmount(amountCell);
    if (amountCents <= 0) return;
    const description =
      cells
        .filter((cell) => cell !== dateCell && cell !== amountCell)
        .join(" ")
        .trim() || "Lançamento bancário";
    entries.push({
      externalId: `csv:${index}:${dateCell}:${amountCell}`,
      amountCents,
      date: parseCsvDate(dateCell),
      description,
    });
  });
  return entries;
}

export function parseBankStatement(content: string): {
  format: "ofx" | "csv";
  entries: BankEntry[];
} {
  if (/<OFX>|<STMTTRN>/i.test(content)) {
    const blocks = content.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/gi) ?? [];
    const entries = blocks
      .map((block, index) => {
        const amountCents = parseAmount(tag(block, "TRNAMT") ?? "0");
        if (amountCents <= 0) return null;
        const description =
          tag(block, "MEMO") ??
          tag(block, "NAME") ??
          tag(block, "PAYEE") ??
          "PIX recebido";
        return {
          externalId: tag(block, "FITID") ?? `ofx:${index}`,
          amountCents,
          date: parseOfxDate(tag(block, "DTPOSTED")),
          description,
        } satisfies BankEntry;
      })
      .filter((entry): entry is BankEntry => entry !== null);
    return { format: "ofx", entries };
  }
  return { format: "csv", entries: parseCsv(content) };
}

export async function matchEntries(
  env: Env,
  entries: BankEntry[],
): Promise<MatchedEntry[]> {
  const db = getDb(env);
  const rows = await db
    .select({ order: orders, payment: payments })
    .from(orders)
    .innerJoin(payments, eq(payments.orderId, orders.id))
    .where(
      and(
        eq(orders.status, "PENDING_PAYMENT"),
        eq(payments.status, "PENDING"),
      ),
    );
  return entries.map((entry) => {
    const description = entry.description.toUpperCase();
    const direct = rows.find((row) =>
      description.includes(row.order.number.toUpperCase()),
    );
    if (direct) {
      return {
        ...entry,
        orderId: direct.order.id,
        orderNumber: direct.order.number,
        confidence: "high" as const,
      };
    }
    const candidates = rows.filter(
      (row) => row.payment.amountCents === entry.amountCents,
    );
    if (candidates.length === 1) {
      return {
        ...entry,
        orderId: candidates[0]!.order.id,
        orderNumber: candidates[0]!.order.number,
        confidence: "medium" as const,
      };
    }
    return {
      ...entry,
      orderId: null,
      orderNumber: null,
      confidence: candidates.length ? ("ambiguous" as const) : ("none" as const),
    };
  });
}

export async function applyMatches(
  env: Env,
  matches: Array<{ orderId: string; externalId: string }>,
): Promise<{ applied: number; skipped: number }> {
  const db = getDb(env);
  let applied = 0;
  let skipped = 0;
  for (const match of matches) {
    const rows = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.id, match.orderId),
          eq(orders.status, "PENDING_PAYMENT"),
        ),
      )
      .limit(1);
    if (!rows[0]) {
      skipped += 1;
      continue;
    }
    try {
      await db.batch([
        db
          .update(payments)
          .set({
            status: "PAID",
            paidAt: new Date(),
            externalId: match.externalId,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(payments.orderId, match.orderId),
              eq(payments.status, "PENDING"),
            ),
          ),
        db
          .update(orders)
          .set({ status: "PAID", updatedAt: new Date() })
          .where(eq(orders.id, match.orderId)),
        db.insert(outboxEvents).values({
          topic: "order.paid",
          aggregateId: match.orderId,
          payload: { orderId: match.orderId, source: "reconciliation" },
        }),
      ] as [any, ...any[]]);
      applied += 1;
    } catch (error) {
      console.error("reconciliation failed", match, error);
      skipped += 1;
    }
  }
  return { applied, skipped };
}
