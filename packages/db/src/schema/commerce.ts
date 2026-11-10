import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./core.js";
import { users } from "./identity.js";

export const products = sqliteTable(
  "products",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    shortDescription: text("short_description").notNull(),
    description: text("description", { mode: "json" }).$type<unknown>(),
    status: text("status", { enum: ["DRAFT", "ACTIVE", "ARCHIVED"] })
      .notNull()
      .default("DRAFT"),
    category: text("category").notNull(),
    regulatoryProcess: text("regulatory_process"),
    manufacturer: text("manufacturer"),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    ...timestamps(),
  },
  (table) => [index("products_status_category_idx").on(table.status, table.category)],
);

export const productImages = sqliteTable(
  "product_images",
  {
    id: id(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    alt: text("alt").notNull(),
    position: integer("position").notNull().default(0),
  },
  (table) => [index("product_images_product_position_idx").on(table.productId, table.position)],
);

export const variants = sqliteTable(
  "variants",
  {
    id: id(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sku: text("sku").notNull().unique(),
    ean: text("ean").unique(),
    name: text("name").notNull(),
    attributes: text("attributes", { mode: "json" })
      .$type<Record<string, string>>()
      .notNull()
      .default({}),
    priceCents: integer("price_cents").notNull(),
    compareAtCents: integer("compare_at_cents"),
    costCents: integer("cost_cents"),
    stock: integer("stock").notNull().default(0),
    safetyStock: integer("safety_stock").notNull().default(1),
    weightGrams: integer("weight_grams").notNull().default(0),
    widthCm: integer("width_cm").notNull().default(0),
    heightCm: integer("height_cm").notNull().default(0),
    lengthCm: integer("length_cm").notNull().default(0),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    ...timestamps(),
  },
  (table) => [index("variants_product_active_idx").on(table.productId, table.active)],
);

export const inventoryBatches = sqliteTable(
  "inventory_batches",
  {
    id: id(),
    variantId: text("variant_id")
      .notNull()
      .references(() => variants.id, { onDelete: "cascade" }),
    lot: text("lot").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    receivedAt: integer("received_at", { mode: "timestamp_ms" }).notNull(),
    quantity: integer("quantity").notNull(),
    available: integer("available").notNull(),
    regulatoryRef: text("regulatory_ref"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("inventory_batches_variant_lot_idx").on(table.variantId, table.lot),
    index("inventory_batches_variant_expires_idx").on(table.variantId, table.expiresAt),
  ],
);

export const inventoryMovements = sqliteTable(
  "inventory_movements",
  {
    id: id(),
    variantId: text("variant_id")
      .notNull()
      .references(() => variants.id, { onDelete: "cascade" }),
    kind: text("kind", {
      enum: ["IN", "OUT", "RESERVE", "RELEASE", "ADJUST"],
    }).notNull(),
    quantity: integer("quantity").notNull(),
    reference: text("reference"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [index("inventory_movements_variant_created_idx").on(table.variantId, table.createdAt)],
);

export const orders = sqliteTable(
  "orders",
  {
    id: id(),
    number: text("number").notNull().unique(),
    channel: text("channel", { enum: ["SITE", "MANUAL"] })
      .notNull()
      .default("SITE"),
    externalId: text("external_id"),
    accessTokenHash: text("access_token_hash").notNull(),
    accessTokenCiphertext: text("access_token_ciphertext").notNull(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    customerEmail: text("customer_email").notNull(),
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone"),
    status: text("status", {
      enum: [
        "PENDING_PAYMENT",
        "PAID",
        "INVOICED",
        "READY_TO_SHIP",
        "SHIPPED",
        "DELIVERED",
        "CANCELED",
        "REFUNDED",
      ],
    })
      .notNull()
      .default("PENDING_PAYMENT"),
    currency: text("currency").notNull().default("BRL"),
    subtotalCents: integer("subtotal_cents").notNull(),
    discountCents: integer("discount_cents").notNull().default(0),
    shippingCents: integer("shipping_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull(),
    shippingAddress: text("shipping_address", { mode: "json" })
      .$type<Record<string, unknown>>()
      .notNull(),
    notes: text("notes"),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("orders_channel_external_idx").on(table.channel, table.externalId),
    index("orders_status_created_idx").on(table.status, table.createdAt),
  ],
);

export const orderItems = sqliteTable(
  "order_items",
  {
    id: id(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    variantId: text("variant_id").references(() => variants.id, {
      onDelete: "set null",
    }),
    sku: text("sku").notNull(),
    name: text("name").notNull(),
    quantity: integer("quantity").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    totalCents: integer("total_cents").notNull(),
  },
  (table) => [index("order_items_order_idx").on(table.orderId)],
);

export const payments = sqliteTable(
  "payments",
  {
    id: id(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    method: text("method", { enum: ["PIX", "CASH", "MANUAL"] }).notNull(),
    externalId: text("external_id").unique(),
    idempotencyKey: text("idempotency_key").notNull().unique(),
    status: text("status", {
      enum: ["PENDING", "AUTHORIZED", "PAID", "FAILED", "CANCELED", "REFUNDED"],
    })
      .notNull()
      .default("PENDING"),
    amountCents: integer("amount_cents").notNull(),
    payload: text("payload", { mode: "json" }).$type<Record<string, unknown>>(),
    paidAt: integer("paid_at", { mode: "timestamp_ms" }),
    ...timestamps(),
  },
  (table) => [index("payments_order_status_idx").on(table.orderId, table.status)],
);

export const shipments = sqliteTable("shipments", {
  id: id(),
  orderId: text("order_id")
    .notNull()
    .unique()
    .references(() => orders.id, { onDelete: "cascade" }),
  provider: text("provider").notNull().default("MANUAL"),
  service: text("service").notNull(),
  quoteId: text("quote_id"),
  trackingCode: text("tracking_code"),
  labelUrl: text("label_url"),
  status: text("status").notNull().default("PENDING"),
  shippedAt: integer("shipped_at", { mode: "timestamp_ms" }),
  ...timestamps(),
});

export const coupons = sqliteTable("coupons", {
  id: id(),
  code: text("code").notNull().unique(),
  kind: text("kind", { enum: ["PERCENT", "FIXED"] }).notNull(),
  value: integer("value").notNull(),
  minimumCents: integer("minimum_cents").notNull().default(0),
  usageLimit: integer("usage_limit"),
  usageCount: integer("usage_count").notNull().default(0),
  startsAt: integer("starts_at", { mode: "timestamp_ms" }).notNull(),
  endsAt: integer("ends_at", { mode: "timestamp_ms" }).notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const shippingZones = sqliteTable(
  "shipping_zones",
  {
    id: id(),
    name: text("name").notNull(),
    cepStart: text("cep_start").notNull(),
    cepEnd: text("cep_end").notNull(),
    priceCents: integer("price_cents").notNull(),
    deadlineDays: integer("deadline_days").notNull().default(7),
    freeAboveCents: integer("free_above_cents"),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    ...timestamps(),
  },
  (table) => [index("shipping_zones_cep_idx").on(table.cepStart, table.cepEnd)],
);

export const fiscalDocuments = sqliteTable("fiscal_documents", {
  id: id(),
  orderId: text("order_id")
    .notNull()
    .unique()
    .references(() => orders.id, { onDelete: "cascade" }),
  accessKey: text("access_key").notNull().unique(),
  xmlKey: text("xml_key"),
  status: text("status").notNull(),
  issuedAt: integer("issued_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Product = typeof products.$inferSelect;
export type Variant = typeof variants.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Shipment = typeof shipments.$inferSelect;
