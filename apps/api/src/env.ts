import type { D1Database, KVNamespace, R2Bucket } from "@cloudflare/workers-types";

export type QueueBinding = {
  send(message: JobMessage): Promise<void>;
};

export type JobMessage =
  | { type: "magic-link"; email: string; url: string }
  | { type: "order.created"; orderId: string }
  | { type: "order.paid"; orderId: string }
  | { type: "offer.expire"; offerId: string }
  | { type: "publication.send"; publicationId: string }
  | { type: "routine.run"; executionId: string }
  | { type: "newsletter.welcome"; subscriberId: string };

export type Env = {
  DB: D1Database;
  MEDIA: R2Bucket;
  SESSIONS: KVNamespace;
  JOBS?: QueueBinding;
  ENVIRONMENT: string;
  WEB_ORIGIN: string;
  ADMIN_ORIGIN: string;
  API_PUBLIC_URL: string;
  SESSION_SECRET: string;
  PIX_KEY: string;
  PIX_MERCHANT_NAME: string;
  PIX_MERCHANT_CITY: string;
  ADMIN_BOOTSTRAP_TOKEN: string;
};
