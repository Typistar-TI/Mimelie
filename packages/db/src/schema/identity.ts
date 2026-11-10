import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./core.js";

export const users = sqliteTable(
  "users",
  {
    id: id(),
    email: text("email").notNull().unique(),
    name: text("name"),
    phone: text("phone"),
    role: text("role", { enum: ["CUSTOMER", "EDITOR", "ADMIN"] })
      .notNull()
      .default("CUSTOMER"),
    passwordHash: text("password_hash"),
    emailVerifiedAt: integer("email_verified_at", { mode: "timestamp_ms" }),
    totpSecret: text("totp_secret"),
    totpEnabled: integer("totp_enabled", { mode: "boolean" })
      .notNull()
      .default(false),
    deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
    ...timestamps(),
  },
  (table) => [index("users_role_idx").on(table.role)],
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: id(),
    tokenHash: text("token_hash").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("sessions_user_expires_idx").on(table.userId, table.expiresAt),
  ],
);

export const magicLinks = sqliteTable(
  "magic_links",
  {
    id: id(),
    tokenHash: text("token_hash").notNull().unique(),
    email: text("email").notNull(),
    userId: text("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    usedAt: integer("used_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [index("magic_links_email_expires_idx").on(table.email, table.expiresAt)],
);

export const authTokens = sqliteTable(
  "auth_tokens",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    purpose: text("purpose", {
      enum: ["EMAIL_VERIFICATION", "PASSWORD_RESET"],
    }).notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    usedAt: integer("used_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [index("auth_tokens_user_purpose_idx").on(table.userId, table.purpose)],
);

export const consents = sqliteTable(
  "consents",
  {
    id: id(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    email: text("email"),
    type: text("type").notNull(),
    version: text("version").notNull(),
    granted: integer("granted", { mode: "boolean" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [index("consents_user_type_idx").on(table.userId, table.type)],
);

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
