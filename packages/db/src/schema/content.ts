import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./core";

export const contentPosts = sqliteTable(
  "content_posts",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    content: text("content", { mode: "json" }).$type<unknown>(),
    coverKey: text("cover_key"),
    status: text("status", {
      enum: ["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"],
    })
      .notNull()
      .default("DRAFT"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    ...timestamps(),
  },
  (table) => [index("content_posts_status_published_idx").on(table.status, table.publishedAt)],
);

export const newsletterSubscribers = sqliteTable(
  "newsletter_subscribers",
  {
    id: id(),
    email: text("email").notNull().unique(),
    name: text("name"),
    status: text("status", { enum: ["PENDING", "CONFIRMED", "UNSUBSCRIBED"] })
      .notNull()
      .default("PENDING"),
    confirmedAt: integer("confirmed_at", { mode: "timestamp_ms" }),
    unsubscribedAt: integer("unsubscribed_at", { mode: "timestamp_ms" }),
    ...timestamps(),
  },
  (table) => [index("newsletter_status_idx").on(table.status)],
);

export type ContentPost = typeof contentPosts.$inferSelect;
