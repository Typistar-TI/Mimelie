import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { id, timestamps } from "./core.js";

export const integrations = sqliteTable("integrations", {
  id: id(),
  provider: text("provider").notNull().unique(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(false),
  credentialsEncrypted: text("credentials_encrypted"),
  settings: text("settings", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  lastHealthAt: integer("last_health_at", { mode: "timestamp_ms" }),
  ...timestamps(),
});

export const routines = sqliteTable("routines", {
  id: id(),
  name: text("name").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(false),
  scheduleCron: text("schedule_cron").notNull().default("0 * * * *"),
  filters: text("filters", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  destinations: text("destinations", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default([]),
  dailyLimit: integer("daily_limit").notNull().default(100),
  ...timestamps(),
});

export const routineExecutions = sqliteTable(
  "routine_executions",
  {
    id: id(),
    routineId: text("routine_id")
      .notNull()
      .references(() => routines.id, { onDelete: "cascade" }),
    status: text("status", {
      enum: ["QUEUED", "RUNNING", "SUCCEEDED", "FAILED", "PAUSED"],
    })
      .notNull()
      .default("QUEUED"),
    startedAt: integer("started_at", { mode: "timestamp_ms" }),
    finishedAt: integer("finished_at", { mode: "timestamp_ms" }),
    foundCount: integer("found_count").notNull().default(0),
    acceptedCount: integer("accepted_count").notNull().default(0),
    duplicateCount: integer("duplicate_count").notNull().default(0),
    rejectedCount: integer("rejected_count").notNull().default(0),
    error: text("error"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("routine_executions_routine_created_idx").on(
      table.routineId,
      table.createdAt,
    ),
  ],
);

export const outboxEvents = sqliteTable(
  "outbox_events",
  {
    id: id(),
    topic: text("topic").notNull(),
    aggregateId: text("aggregate_id"),
    payload: text("payload", { mode: "json" })
      .$type<Record<string, unknown>>()
      .notNull(),
    status: text("status", {
      enum: ["PENDING", "PROCESSING", "SENT", "FAILED"],
    })
      .notNull()
      .default("PENDING"),
    attempts: integer("attempts").notNull().default(0),
    availableAt: integer("available_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    processedAt: integer("processed_at", { mode: "timestamp_ms" }),
    lastError: text("last_error"),
    ...timestamps(),
  },
  (table) => [index("outbox_events_pending_idx").on(table.status, table.availableAt)],
);

export const webhookEvents = sqliteTable(
  "webhook_events",
  {
    id: id(),
    provider: text("provider").notNull(),
    externalId: text("external_id").notNull(),
    type: text("type").notNull(),
    status: text("status", {
      enum: ["RECEIVED", "PROCESSING", "PROCESSED", "FAILED", "IGNORED"],
    })
      .notNull()
      .default("RECEIVED"),
    signatureOk: integer("signature_ok", { mode: "boolean" })
      .notNull()
      .default(false),
    payload: text("payload", { mode: "json" })
      .$type<Record<string, unknown>>()
      .notNull(),
    attempts: integer("attempts").notNull().default(0),
    error: text("error"),
    occurredAt: integer("occurred_at", { mode: "timestamp_ms" }),
    processedAt: integer("processed_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("webhook_events_provider_external_type_idx").on(
      table.provider,
      table.externalId,
      table.type,
    ),
    index("webhook_events_status_created_idx").on(table.status, table.createdAt),
  ],
);

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: id(),
    actorId: text("actor_id"),
    action: text("action").notNull(),
    resource: text("resource").notNull(),
    resourceId: text("resource_id"),
    metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>(),
    ipHash: text("ip_hash"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [index("audit_logs_resource_created_idx").on(table.resource, table.resourceId, table.createdAt)],
);

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }).$type<unknown>().notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type OutboxEvent = typeof outboxEvents.$inferSelect;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
