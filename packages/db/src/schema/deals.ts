import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./core.js";
import { users } from "./identity.js";

export const stores = sqliteTable(
  "stores",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    domain: text("domain"),
    logoUrl: text("logo_url"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    ...timestamps(),
  },
  (table) => [index("stores_active_idx").on(table.isActive)],
);

export const offerCategories = sqliteTable(
  "offer_categories",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    ...timestamps(),
  },
  (table) => [index("offer_categories_active_idx").on(table.isActive)],
);

export const offers = sqliteTable(
  "offers",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "restrict" }),
    categoryId: text("category_id").references(() => offerCategories.id, {
      onDelete: "set null",
    }),
    currentPriceCents: integer("current_price_cents").notNull(),
    originalPriceCents: integer("original_price_cents"),
    discountPercent: integer("discount_percent"),
    couponCode: text("coupon_code"),
    affiliateUrl: text("affiliate_url").notNull(),
    sourceUrl: text("source_url"),
    status: text("status", {
      enum: ["DRAFT", "PUBLISHED", "EXPIRED", "PAUSED"],
    })
      .notNull()
      .default("DRAFT"),
    verifiedAt: integer("verified_at", { mode: "timestamp_ms" }),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    createdById: text("created_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps(),
  },
  (table) => [
    index("offers_status_published_idx").on(table.status, table.publishedAt),
    index("offers_store_idx").on(table.storeId),
    index("offers_category_idx").on(table.categoryId),
  ],
);

export const favorites = sqliteTable(
  "favorites",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    offerId: text("offer_id")
      .notNull()
      .references(() => offers.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("favorites_user_offer_idx").on(table.userId, table.offerId),
  ],
);

export const comments = sqliteTable(
  "comments",
  {
    id: id(),
    offerId: text("offer_id")
      .notNull()
      .references(() => offers.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    isHidden: integer("is_hidden", { mode: "boolean" }).notNull().default(false),
    ...timestamps(),
  },
  (table) => [index("comments_offer_created_idx").on(table.offerId, table.createdAt)],
);

export const reports = sqliteTable(
  "reports",
  {
    id: id(),
    commentId: text("comment_id")
      .notNull()
      .references(() => comments.id, { onDelete: "cascade" }),
    reporterId: text("reporter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [index("reports_comment_idx").on(table.commentId)],
);

export const offerClicks = sqliteTable(
  "offer_clicks",
  {
    id: id(),
    offerId: text("offer_id")
      .notNull()
      .references(() => offers.id, { onDelete: "cascade" }),
    source: text("source").notNull().default("direct"),
    fingerprint: text("fingerprint"),
    isFiltered: integer("is_filtered", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [index("offer_clicks_offer_created_idx").on(table.offerId, table.createdAt)],
);

export const publications = sqliteTable(
  "publications",
  {
    id: id(),
    offerId: text("offer_id")
      .notNull()
      .references(() => offers.id, { onDelete: "cascade" }),
    destination: text("destination").notNull(),
    status: text("status", {
      enum: ["PENDING", "SENT", "FAILED", "PAUSED"],
    })
      .notNull()
      .default("PENDING"),
    attempts: integer("attempts").notNull().default(0),
    externalId: text("external_id"),
    error: text("error"),
    sentAt: integer("sent_at", { mode: "timestamp_ms" }),
    ...timestamps(),
  },
  (table) => [index("publications_offer_idx").on(table.offerId)],
);

export type Offer = typeof offers.$inferSelect;
export type Store = typeof stores.$inferSelect;
export type OfferCategory = typeof offerCategories.$inferSelect;
