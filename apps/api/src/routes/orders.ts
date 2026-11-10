import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { checkoutSchema } from "@mimelie/contracts";
import {
  coupons,
  fiscalDocuments,
  orderItems,
  orders,
  outboxEvents,
  payments,
  products,
  shipments,
  variants,
} from "@mimelie/db";
import type { AppEnv } from "../types";
import { requireStaff } from "../lib/auth";
import {
  decryptSecret,
  encryptSecret,
  randomToken,
  sha256,
} from "../lib/crypto";
import { getDb } from "../lib/db";
import {
  badRequest,
  conflict,
  notFound,
  parseBody,
} from "../lib/http";
import { buildPixPayload } from "../lib/pix";
import { serializeOrder } from "../lib/serializers";
import { quoteShipping } from "../lib/shipping";

export const orderRoutes = new Hono<AppEnv>();

function orderNumber(): string {
  return `WEB-${Date.now().toString(36).toUpperCase()}`;
}

orderRoutes.post("/orders/checkout", async (c) => {
  const input = await parseBody(c, checkoutSchema);
  const idempotencyKey = c.req.header("idempotency-key");
  if (!idempotencyKey || idempotencyKey.length < 12) {
    badRequest("Idempotency-Key inválida.");
  }
  const db = getDb(c.env);
  const previous = await db
    .select({ payment: payments, order: orders })
    .from(payments)
    .innerJoin(orders, eq(payments.orderId, orders.id))
    .where(eq(payments.idempotencyKey, idempotencyKey))
    .limit(1);
  if (previous[0]) {
    const accessToken = await decryptSecret(
      previous[0].order.accessTokenCiphertext,
      c.env.SESSION_SECRET,
    );
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, previous[0].order.id));
    return c.json({
      order: serializeOrder(previous[0].order, items, previous[0].payment, null),
      accessToken,
      pix: (previous[0].payment.payload as { pix?: unknown } | null)?.pix ?? null,
    });
  }

  const variantIds = [...new Set(input.items.map((item) => item.variantId))];
  const rows = await db
    .select({ variant: variants, product: products })
    .from(variants)
    .innerJoin(products, eq(variants.productId, products.id))
    .where(and(inArray(variants.id, variantIds), eq(variants.active, true)));
  if (rows.length !== variantIds.length) {
    conflict("Um produto não está mais disponível.");
  }

  const lines = input.items.map((requested) => {
    const row = rows.find((item) => item.variant.id === requested.variantId);
    if (!row) conflict("Um produto não está mais disponível.");
    if (row.variant.stock < requested.quantity) {
      conflict(`Estoque insuficiente para ${row.product.name}.`);
    }
    return {
      variant: row.variant,
      product: row.product,
      quantity: requested.quantity,
      totalCents: row.variant.priceCents * requested.quantity,
    };
  });
  const subtotalCents = lines.reduce((sum, line) => sum + line.totalCents, 0);

  const couponRows = input.couponCode
    ? await db
        .select()
        .from(coupons)
        .where(
          and(
            eq(coupons.code, input.couponCode.toUpperCase()),
            eq(coupons.active, true),
            sql`${coupons.startsAt} <= ${Date.now()}`,
            sql`${coupons.endsAt} >= ${Date.now()}`,
            sql`${coupons.minimumCents} <= ${subtotalCents}`,
          ),
        )
        .limit(1)
    : [];
  const coupon = couponRows[0];
  const discountCents = coupon
    ? Math.min(
        subtotalCents,
        coupon.kind === "PERCENT"
          ? Math.round((subtotalCents * Math.min(coupon.value, 100)) / 100)
          : coupon.value,
      )
    : 0;

  const shipping = await quoteShipping(
    c.env,
    input.shippingAddress.postalCode,
    subtotalCents,
  );
  const totalCents = subtotalCents - discountCents + shipping.priceCents;
  const id = crypto.randomUUID();
  const number = orderNumber();
  const accessToken = randomToken();
  const pix = buildPixPayload({
    key: c.env.PIX_KEY,
    merchantName: c.env.PIX_MERCHANT_NAME,
    merchantCity: c.env.PIX_MERCHANT_CITY,
    amountCents: totalCents,
    txid: number,
  });

  const orderValues = {
    id,
    number,
    channel: "SITE" as const,
    accessTokenHash: await sha256(accessToken),
    accessTokenCiphertext: await encryptSecret(
      accessToken,
      c.env.SESSION_SECRET,
    ),
    customerEmail: input.email.toLowerCase(),
    customerName: input.name,
    customerPhone: input.phone,
    status: "PENDING_PAYMENT" as const,
    subtotalCents,
    discountCents,
    shippingCents: shipping.priceCents,
    totalCents,
    shippingAddress: input.shippingAddress as unknown as Record<string, unknown>,
  };
  const itemValues = lines.map((line) => ({
    orderId: id,
    variantId: line.variant.id,
    sku: line.variant.sku,
    name: `${line.product.name} — ${line.variant.name}`,
    quantity: line.quantity,
    unitPriceCents: line.variant.priceCents,
    totalCents: line.totalCents,
  }));
  const paymentValues = {
    orderId: id,
    provider: "PIX",
    method: "PIX" as const,
    idempotencyKey,
    status: "PENDING" as const,
    amountCents: totalCents,
    payload: { pix } as unknown as Record<string, unknown>,
  };

  try {
    const results = await db.batch([
      db.insert(orders).values(orderValues).returning(),
      ...itemValues.map((item) => db.insert(orderItems).values(item)),
      db.insert(payments).values(paymentValues).returning(),
      db.insert(shipments).values({
        orderId: id,
        provider: "MANUAL",
        service: shipping.zone,
        quoteId: input.shippingQuoteId,
      }),
      db.insert(outboxEvents).values({
        topic: "order.created",
        aggregateId: id,
        payload: { orderId: id },
      }),
    ] as [any, ...any[]]);
    const created = results[0] as (typeof orders.$inferSelect)[];
    const payment = results[1 + itemValues.length] as (typeof payments.$inferSelect)[];
    const insertedItems = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));
    if (coupon) {
      await db
        .update(coupons)
        .set({ usageCount: sql`${coupons.usageCount} + 1` })
        .where(eq(coupons.id, coupon.id));
    }
    if (c.env.JOBS) {
      c.executionCtx.waitUntil(
        c.env.JOBS.send({ type: "order.created", orderId: id }),
      );
    }
    return c.json(
      {
        order: serializeOrder(created[0]!, insertedItems, payment[0] ?? null, null),
        accessToken,
        pix,
      },
      201,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("INSUFFICIENT_STOCK")) {
      conflict("O estoque mudou durante a compra. Tente novamente.");
    }
    throw error;
  }
});

orderRoutes.get("/orders/:id", async (c) => {
  const accessToken = c.req.header("x-order-access-token");
  if (!accessToken) badRequest("Token de acesso ao pedido obrigatório.");
  const db = getDb(c.env);
  const rows = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.id, c.req.param("id")),
        eq(orders.accessTokenHash, await sha256(accessToken)),
      ),
    )
    .limit(1);
  const order = rows[0];
  if (!order) notFound("Pedido não encontrado.");
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));
  const paymentRows = await db
    .select()
    .from(payments)
    .where(eq(payments.orderId, order.id))
    .limit(1);
  const shipmentRows = await db
    .select()
    .from(shipments)
    .where(eq(shipments.orderId, order.id))
    .limit(1);
  return c.json(
    serializeOrder(order, items, paymentRows[0] ?? null, shipmentRows[0] ?? null),
  );
});

orderRoutes.get("/admin/orders", async (c) => {
  requireStaff(c);
  const db = getDb(c.env);
  const rows = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(200);
  const data = await Promise.all(
    rows.map(async (order) => {
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));
      const paymentRows = await db
        .select()
        .from(payments)
        .where(eq(payments.orderId, order.id))
        .limit(1);
      return serializeOrder(order, items, paymentRows[0] ?? null, null);
    }),
  );
  return c.json({ data });
});

orderRoutes.post("/admin/orders/:id/paid", async (c) => {
  requireStaff(c);
  const db = getDb(c.env);
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.id, c.req.param("id")))
    .limit(1);
  const order = rows[0];
  if (!order) notFound("Pedido não encontrado.");
  if (order.status !== "PENDING_PAYMENT") {
    conflict("Este pedido não está aguardando pagamento.");
  }
  await db.batch([
    db
      .update(payments)
      .set({ status: "PAID", paidAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(payments.orderId, order.id),
          eq(payments.status, "PENDING"),
        ),
      ),
    db
      .update(orders)
      .set({ status: "PAID", updatedAt: new Date() })
      .where(eq(orders.id, order.id)),
    db.insert(outboxEvents).values({
      topic: "order.paid",
      aggregateId: order.id,
      payload: { orderId: order.id },
    }),
  ] as [any, ...any[]]);
  if (c.env.JOBS) {
    c.executionCtx.waitUntil(
      c.env.JOBS.send({ type: "order.paid", orderId: order.id }),
    );
  }
  return c.json({ paid: true });
});

orderRoutes.post("/admin/orders/:id/cancel", async (c) => {
  requireStaff(c);
  const db = getDb(c.env);
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.id, c.req.param("id")))
    .limit(1);
  const order = rows[0];
  if (!order) notFound("Pedido não encontrado.");
  if (order.status === "CANCELED" || order.status === "REFUNDED") {
    conflict("Pedido já encerrado.");
  }
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));
  await db.batch([
    db
      .update(orders)
      .set({ status: "CANCELED", updatedAt: new Date() })
      .where(eq(orders.id, order.id)),
    db
      .update(payments)
      .set({ status: "CANCELED", updatedAt: new Date() })
      .where(eq(payments.orderId, order.id)),
    ...items
      .filter((item) => item.variantId)
      .map((item) =>
        db
          .update(variants)
          .set({ stock: sql`${variants.stock} + ${item.quantity}` })
          .where(eq(variants.id, item.variantId!)),
      ),
  ] as [any, ...any[]]);
  return c.json({ canceled: true });
});

orderRoutes.post("/admin/orders/:id/ship", async (c) => {
  requireStaff(c);
  const input = await parseBody(
    c,
    z.object({
      trackingCode: z.string().min(3).max(120),
      service: z.string().min(2).max(120).optional(),
    }),
  );
  const db = getDb(c.env);
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.id, c.req.param("id")))
    .limit(1);
  const order = rows[0];
  if (!order) notFound("Pedido não encontrado.");
  await db.batch([
    db
      .update(shipments)
      .set({
        trackingCode: input.trackingCode,
        service: input.service ?? "MANUAL",
        status: "SHIPPED",
        shippedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(shipments.orderId, order.id)),
    db
      .update(orders)
      .set({ status: "SHIPPED", updatedAt: new Date() })
      .where(eq(orders.id, order.id)),
  ] as [any, ...any[]]);
  return c.json({ shipped: true });
});

orderRoutes.post("/admin/orders/:id/invoice", async (c) => {
  requireStaff(c);
  const input = await parseBody(
    c,
    z.object({
      accessKey: z.string().min(3).max(80).optional(),
      issuedAt: z.coerce.date().optional(),
    }),
  );
  const db = getDb(c.env);
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.id, c.req.param("id")))
    .limit(1);
  const order = rows[0];
  if (!order) notFound("Pedido não encontrado.");
  if (order.status !== "PAID") {
    conflict("O recibo só pode ser emitido após o pagamento.");
  }
  const accessKey = input.accessKey ?? `REC-${order.number}`;
  await db.batch([
    db.insert(fiscalDocuments).values({
      orderId: order.id,
      accessKey,
      status: "AUTHORIZED",
      issuedAt: input.issuedAt ?? new Date(),
    }),
    db
      .update(orders)
      .set({ status: "INVOICED", updatedAt: new Date() })
      .where(eq(orders.id, order.id)),
  ] as [any, ...any[]]);
  return c.json({ invoiced: true, accessKey });
});
