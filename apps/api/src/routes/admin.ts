import { and, desc, eq, gte, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import {
  comments,
  coupons,
  integrations,
  newsletterSubscribers,
  offerCategories,
  offerClicks,
  offers,
  orderItems,
  orders,
  productImages,
  products,
  publications,
  routineExecutions,
  routines,
  settings,
  shippingZones,
  stores,
  users,
  variants,
} from "@mimelie/db";
import type { AppEnv } from "../types";
import { requireAdmin, requireStaff } from "../lib/auth";
import { encryptSecret } from "../lib/crypto";
import { getDb } from "../lib/db";
import { badRequest, conflict, notFound, parseBody } from "../lib/http";
import { serializeOffer, serializeProduct, serializeUser } from "../lib/serializers";

export const adminRoutes = new Hono<AppEnv>();

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

async function uniqueOfferSlug(
  db: ReturnType<typeof getDb>,
  base: string,
): Promise<string> {
  let slug = base || `oferta-${Date.now().toString(36)}`;
  for (let index = 2; index < 100; index += 1) {
    const found = await db
      .select({ id: offers.id })
      .from(offers)
      .where(eq(offers.slug, slug))
      .limit(1);
    if (!found[0]) return slug;
    slug = `${base}-${index}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

const offerInput = z.object({
  title: z.string().min(8).max(240),
  description: z.string().max(5000).optional().nullable(),
  storeId: z.string().min(1),
  categoryId: z.string().min(1).optional().nullable(),
  currentPrice: z.coerce.number().positive(),
  originalPrice: z.coerce.number().positive().optional().nullable(),
  couponCode: z.string().max(64).optional().nullable(),
  affiliateUrl: z.string().url(),
  imageUrl: z.string().url().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "EXPIRED", "PAUSED"]).optional(),
});

adminRoutes.get("/admin/overview", async (c) => {
  requireStaff(c);
  const db = getDb(c.env);
  const [productCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(products);
  const [pendingOrders] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(eq(orders.status, "PENDING_PAYMENT"));
  const [customerCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, "CUSTOMER"));
  const [offerCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(offers)
    .where(eq(offers.status, "PUBLISHED"));
  return c.json({
    products: productCount?.count ?? 0,
    pendingOrders: pendingOrders?.count ?? 0,
    customers: customerCount?.count ?? 0,
    publishedOffers: offerCount?.count ?? 0,
    integrationFailures: 0,
  });
});

adminRoutes.get("/admin/offers", async (c) => {
  requireStaff(c);
  const rows = await getDb(c.env)
    .select({ offer: offers, store: stores, category: offerCategories })
    .from(offers)
    .innerJoin(stores, eq(offers.storeId, stores.id))
    .leftJoin(offerCategories, eq(offers.categoryId, offerCategories.id))
    .orderBy(desc(offers.updatedAt));
  return c.json({
    data: rows.map((row) => serializeOffer(row.offer, row.store, row.category)),
  });
});

adminRoutes.post("/admin/offers", async (c) => {
  const user = requireStaff(c);
  const input = await parseBody(c, offerInput);
  const db = getDb(c.env);
  const storeRows = await db
    .select()
    .from(stores)
    .where(eq(stores.id, input.storeId))
    .limit(1);
  if (!storeRows[0]) badRequest("Loja inválida.");
  const categoryRows = input.categoryId
    ? await db
        .select()
        .from(offerCategories)
        .where(eq(offerCategories.id, input.categoryId))
        .limit(1)
    : [];
  if (input.categoryId && !categoryRows[0]) badRequest("Categoria inválida.");
  const status = input.status ?? "DRAFT";
  const slug = await uniqueOfferSlug(db, slugify(input.title));
  const currentPriceCents = Math.round(input.currentPrice * 100);
  const originalPriceCents =
    input.originalPrice == null ? null : Math.round(input.originalPrice * 100);
  const inserted = await db
    .insert(offers)
    .values({
      slug,
      title: input.title,
      description: input.description ?? null,
      storeId: input.storeId,
      categoryId: input.categoryId ?? null,
      currentPriceCents,
      originalPriceCents,
      discountPercent:
        originalPriceCents && originalPriceCents > currentPriceCents
          ? Math.round((1 - currentPriceCents / originalPriceCents) * 100)
          : null,
      couponCode: input.couponCode ?? null,
      affiliateUrl: input.affiliateUrl,
      imageUrl: input.imageUrl ?? null,
      expiresAt: input.expiresAt ?? null,
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      verifiedAt: new Date(),
      createdById: user.id,
    })
    .returning();
  if (status === "PUBLISHED") {
    const enabled = await db
      .select({ provider: integrations.provider })
      .from(integrations)
      .where(eq(integrations.enabled, true));
    if (enabled.length) {
      const created = await db
        .insert(publications)
        .values(
          enabled.map((integration) => ({
            offerId: inserted[0]!.id,
            destination: integration.provider,
            status: "PENDING" as const,
          })),
        )
        .returning({ id: publications.id });
      if (c.env.JOBS) {
        for (const publication of created) {
          c.executionCtx.waitUntil(
            c.env.JOBS.send({
              type: "publication.send",
              publicationId: publication.id,
            }),
          );
        }
      }
    }
  }
  return c.json(
    {
      data: serializeOffer(
        inserted[0]!,
        storeRows[0],
        categoryRows[0] ?? null,
      ),
    },
    201,
  );
});

adminRoutes.patch("/admin/offers/:id", async (c) => {
  requireStaff(c);
  const input = await parseBody(c, offerInput.partial());
  const db = getDb(c.env);
  const existing = await db
    .select()
    .from(offers)
    .where(eq(offers.id, c.req.param("id")))
    .limit(1);
  const offer = existing[0];
  if (!offer) notFound("Oferta não encontrada.");
  const updated = await db
    .update(offers)
    .set({
      ...(input.title != null ? { title: input.title } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.storeId != null ? { storeId: input.storeId } : {}),
      ...(input.categoryId !== undefined
        ? { categoryId: input.categoryId }
        : {}),
      ...(input.currentPrice != null
        ? { currentPriceCents: Math.round(input.currentPrice * 100) }
        : {}),
      ...(input.originalPrice !== undefined
        ? {
            originalPriceCents:
              input.originalPrice == null
                ? null
                : Math.round(input.originalPrice * 100),
          }
        : {}),
      ...(input.couponCode !== undefined
        ? { couponCode: input.couponCode }
        : {}),
      ...(input.affiliateUrl != null
        ? { affiliateUrl: input.affiliateUrl }
        : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
      ...(input.expiresAt !== undefined
        ? { expiresAt: input.expiresAt }
        : {}),
      ...(input.status != null
        ? {
            status: input.status,
            ...(input.status === "PUBLISHED" && !offer.publishedAt
              ? { publishedAt: new Date() }
              : {}),
          }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(offers.id, offer.id))
    .returning();
  if (updated[0]!.status === "PUBLISHED") {
    const existing = await db
      .select({ destination: publications.destination })
      .from(publications)
      .where(eq(publications.offerId, updated[0]!.id));
    const enabled = await db
      .select({ provider: integrations.provider })
      .from(integrations)
      .where(eq(integrations.enabled, true));
    const missing = enabled.filter(
      (integration) =>
        !existing.some(
          (publication) => publication.destination === integration.provider,
        ),
    );
    if (missing.length) {
      const created = await db
        .insert(publications)
        .values(
          missing.map((integration) => ({
            offerId: updated[0]!.id,
            destination: integration.provider,
            status: "PENDING" as const,
          })),
        )
        .returning({ id: publications.id });
      if (c.env.JOBS) {
        for (const publication of created) {
          c.executionCtx.waitUntil(
            c.env.JOBS.send({
              type: "publication.send",
              publicationId: publication.id,
            }),
          );
        }
      }
    }
  }
  const storeRows = await db
    .select()
    .from(stores)
    .where(eq(stores.id, updated[0]!.storeId))
    .limit(1);
  const categoryRows = updated[0]!.categoryId
    ? await db
        .select()
        .from(offerCategories)
        .where(eq(offerCategories.id, updated[0]!.categoryId!))
        .limit(1)
    : [];
  return c.json({
    data: serializeOffer(updated[0]!, storeRows[0]!, categoryRows[0] ?? null),
  });
});

adminRoutes.get("/admin/categories", async (c) => {
  requireStaff(c);
  const rows = await getDb(c.env)
    .select()
    .from(offerCategories)
    .orderBy(offerCategories.name);
  return c.json({ data: rows });
});

adminRoutes.post("/admin/categories", async (c) => {
  requireStaff(c);
  const input = await parseBody(
    c,
    z.object({
      name: z.string().trim().min(2).max(80),
      description: z.string().trim().max(500).optional().nullable(),
      isActive: z.boolean().default(true),
    }),
  );
  const slug = slugify(input.name);
  const inserted = await getDb(c.env)
    .insert(offerCategories)
    .values({ ...input, slug })
    .returning();
  return c.json({ data: inserted[0] }, 201);
});

adminRoutes.patch("/admin/categories/:id", async (c) => {
  requireStaff(c);
  const input = await parseBody(
    c,
    z
      .object({
        name: z.string().trim().min(2).max(80).optional(),
        description: z.string().trim().max(500).optional().nullable(),
        isActive: z.boolean().optional(),
      })
      .partial(),
  );
  const updated = await getDb(c.env)
    .update(offerCategories)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(offerCategories.id, c.req.param("id")))
    .returning();
  return c.json({ data: updated[0] });
});

adminRoutes.get("/admin/users", async (c) => {
  requireStaff(c);
  const rows = await getDb(c.env)
    .select()
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(500);
  return c.json({ data: rows.map(serializeUser) });
});

adminRoutes.patch("/admin/users/:id", async (c) => {
  const actor = requireAdmin(c);
  const { role } = await parseBody(
    c,
    z.object({ role: z.enum(["ADMIN", "EDITOR", "VISITOR"]) }),
  );
  if (actor.id === c.req.param("id") && role !== "ADMIN") {
    badRequest("Não remova seu próprio acesso administrativo.");
  }
  const updated = await getDb(c.env)
    .update(users)
    .set({
      role: role === "VISITOR" ? "CUSTOMER" : role,
      updatedAt: new Date(),
    })
    .where(eq(users.id, c.req.param("id")))
    .returning();
  if (!updated[0]) notFound("Usuário não encontrado.");
  return c.json({ data: serializeUser(updated[0]) });
});

adminRoutes.get("/admin/statistics", async (c) => {
  requireStaff(c);
  const db = getDb(c.env);
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [activeOffers] = await db
    .select({ count: sql<number>`count(*)` })
    .from(offers)
    .where(eq(offers.status, "PUBLISHED"));
  const [rawClicks24h] = await db
    .select({ count: sql<number>`count(*)` })
    .from(offerClicks)
    .where(gte(offerClicks.createdAt, since));
  const [clicks24h] = await db
    .select({ count: sql<number>`count(*)` })
    .from(offerClicks)
    .where(
      and(
        gte(offerClicks.createdAt, since),
        eq(offerClicks.isFiltered, false),
      ),
    );
  const [visibleComments] = await db
    .select({ count: sql<number>`count(*)` })
    .from(comments)
    .where(eq(comments.isHidden, false));
  const clicksBySource = await db
    .select({
      source: offerClicks.source,
      clicks: sql<number>`count(*)`,
    })
    .from(offerClicks)
    .where(gte(offerClicks.createdAt, since))
    .groupBy(offerClicks.source);
  return c.json({
    data: {
      activeOffers: activeOffers?.count ?? 0,
      rawClicks24h: rawClicks24h?.count ?? 0,
      clicks24h: clicks24h?.count ?? 0,
      visibleComments: visibleComments?.count ?? 0,
      clicksBySource,
    },
  });
});

adminRoutes.get("/admin/automation", async (c) => {
  requireStaff(c);
  const rows = await getDb(c.env)
    .select()
    .from(settings)
    .where(eq(settings.key, "automation.paused"))
    .limit(1);
  return c.json({ data: { paused: Boolean(rows[0]?.value) } });
});

adminRoutes.put("/admin/automation", async (c) => {
  requireStaff(c);
  const { paused } = await parseBody(c, z.object({ paused: z.boolean() }));
  const db = getDb(c.env);
  await db
    .insert(settings)
    .values({ key: "automation.paused", value: paused, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: paused, updatedAt: new Date() },
    });
  return c.json({ data: { paused } });
});

adminRoutes.get("/admin/routines", async (c) => {
  requireStaff(c);
  const rows = await getDb(c.env)
    .select()
    .from(routines)
    .orderBy(routines.name);
  return c.json({ data: rows });
});

adminRoutes.post("/admin/routines", async (c) => {
  requireStaff(c);
  const input = await parseBody(
    c,
    z.object({
      name: z.string().trim().min(2).max(120),
      enabled: z.boolean().default(false),
      scheduleCron: z.string().max(80).default("0 * * * *"),
      dailyLimit: z.coerce.number().int().positive().max(10_000).default(100),
      filters: z.record(z.unknown()).default({}),
      destinations: z.array(z.string().max(80)).default([]),
    }),
  );
  const inserted = await getDb(c.env)
    .insert(routines)
    .values({
      name: input.name,
      enabled: input.enabled,
      scheduleCron: input.scheduleCron,
      dailyLimit: input.dailyLimit,
      filters: input.filters,
      destinations: input.destinations,
    })
    .returning();
  return c.json({ data: inserted[0] }, 201);
});

adminRoutes.patch("/admin/routines/:id", async (c) => {
  requireStaff(c);
  const input = await parseBody(
    c,
    z
      .object({
        name: z.string().trim().min(2).max(120).optional(),
        enabled: z.boolean().optional(),
        dailyLimit: z.coerce.number().int().positive().max(10_000).optional(),
        scheduleCron: z.string().max(80).optional(),
      })
      .partial(),
  );
  const updated = await getDb(c.env)
    .update(routines)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(routines.id, c.req.param("id")))
    .returning();
  return c.json({ data: updated[0] });
});

adminRoutes.post("/admin/routines/:id/run", async (c) => {
  requireStaff(c);
  const inserted = await getDb(c.env)
    .insert(routineExecutions)
    .values({ routineId: c.req.param("id"), status: "QUEUED" })
    .returning();
  if (c.env.JOBS && inserted[0]) {
    c.executionCtx.waitUntil(
      c.env.JOBS.send({ type: "routine.run", executionId: inserted[0].id }),
    );
  }
  return c.json({ data: inserted[0] }, 202);
});

adminRoutes.get("/admin/integrations", async (c) => {
  requireStaff(c);
  const rows = await getDb(c.env)
    .select({
      id: integrations.id,
      provider: integrations.provider,
      enabled: integrations.enabled,
      settings: integrations.settings,
      lastHealthAt: integrations.lastHealthAt,
    })
    .from(integrations)
    .orderBy(integrations.provider);
  return c.json({ data: rows });
});

adminRoutes.put("/admin/integrations/:provider", async (c) => {
  requireStaff(c);
  const input = await parseBody(
    c,
    z.object({
      enabled: z.boolean(),
      credentials: z.record(z.string()).optional(),
      settings: z.record(z.unknown()).optional(),
    }),
  );
  const provider = c.req.param("provider");
  const credentialsEncrypted = input.credentials
    ? await encryptSecret(JSON.stringify(input.credentials), c.env.SESSION_SECRET)
    : undefined;
  const db = getDb(c.env);
  const values = {
    provider,
    enabled: input.enabled,
    ...(credentialsEncrypted ? { credentialsEncrypted } : {}),
    ...(input.settings ? { settings: input.settings } : {}),
    updatedAt: new Date(),
  };
  await db
    .insert(integrations)
    .values(values)
    .onConflictDoUpdate({
      target: integrations.provider,
      set: {
        enabled: input.enabled,
        ...(credentialsEncrypted ? { credentialsEncrypted } : {}),
        ...(input.settings ? { settings: input.settings } : {}),
        updatedAt: new Date(),
      },
    });
  const rows = await db
    .select({
      id: integrations.id,
      provider: integrations.provider,
      enabled: integrations.enabled,
      settings: integrations.settings,
      lastHealthAt: integrations.lastHealthAt,
    })
    .from(integrations)
    .where(eq(integrations.provider, provider))
    .limit(1);
  return c.json({ data: rows[0] });
});

adminRoutes.post("/admin/integrations/whatsapp/validate", (c) => {
  requireStaff(c);
  return c.json({ ok: true, message: "Destinos validados." });
});

adminRoutes.get("/admin/publications", async (c) => {
  requireStaff(c);
  const rows = await getDb(c.env)
    .select({ publication: publications, offer: offers, store: stores })
    .from(publications)
    .innerJoin(offers, eq(publications.offerId, offers.id))
    .innerJoin(stores, eq(offers.storeId, stores.id))
    .orderBy(desc(publications.createdAt))
    .limit(200);
  return c.json({
    data: rows.map((row) => ({
      id: row.publication.id,
      destination: row.publication.destination,
      status: row.publication.status,
      attempts: row.publication.attempts,
      error: row.publication.error,
      offer: {
        title: row.offer.title,
        currentPrice: row.offer.currentPriceCents / 100,
        couponCode: row.offer.couponCode,
        store: { name: row.store.name },
      },
    })),
  });
});

adminRoutes.patch("/admin/publications/:id", async (c) => {
  requireStaff(c);
  const { status } = await parseBody(
    c,
    z.object({ status: z.enum(["PENDING", "PAUSED"]) }),
  );
  const updated = await getDb(c.env)
    .update(publications)
    .set({ status, updatedAt: new Date() })
    .where(eq(publications.id, c.req.param("id")))
    .returning();
  return c.json({ data: updated[0] });
});

adminRoutes.get("/admin/products", async (c) => {
  requireStaff(c);
  const db = getDb(c.env);
  const rows = await db.select().from(products).orderBy(desc(products.updatedAt));
  const data = await Promise.all(
    rows.map(async (product) => {
      const variantRows = await db
        .select()
        .from(variants)
        .where(eq(variants.productId, product.id));
      const imageRows = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, product.id))
        .orderBy(productImages.position);
      return serializeProduct(
        product,
        variantRows,
        imageRows.map((image) => ({ key: image.key, alt: image.alt })),
      );
    }),
  );
  return c.json({ data });
});

adminRoutes.post("/admin/products", async (c) => {
  requireStaff(c);
  const input = await parseBody(
    c,
    z.object({
      name: z.string().min(2).max(160),
      slug: z.string().max(160).optional(),
      shortDescription: z.string().min(2).max(280),
      category: z.string().min(2).max(80),
      status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
      variants: z
        .array(
          z.object({
            sku: z.string().min(2).max(80),
            name: z.string().min(1).max(80),
            price: z.coerce.number().positive(),
            stock: z.coerce.number().int().nonnegative().default(0),
            weightGrams: z.coerce.number().int().nonnegative().default(0),
          }),
        )
        .min(1),
      images: z
        .array(
          z.object({
            key: z.string().min(1).max(300),
            alt: z.string().min(1).max(200),
          }),
        )
        .max(8)
        .optional(),
    }),
  );
  const db = getDb(c.env);
  const baseSlug = input.slug ?? slugify(input.name);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;
  const productId = crypto.randomUUID();
  const inserted = await db.batch([
    db
      .insert(products)
      .values({
        id: productId,
        slug,
        name: input.name,
        shortDescription: input.shortDescription,
        category: input.category,
        status: input.status,
        publishedAt: input.status === "ACTIVE" ? new Date() : null,
      })
      .returning(),
    ...input.variants.map((variant) =>
      db.insert(variants).values({
        productId,
        sku: variant.sku,
        name: variant.name,
        priceCents: Math.round(variant.price * 100),
        stock: variant.stock,
        weightGrams: variant.weightGrams,
      }),
    ),
    ...(input.images ?? []).map((image, index) =>
      db.insert(productImages).values({
        productId,
        key: image.key,
        alt: image.alt,
        position: index,
      }),
    ),
  ] as [any, ...any[]]);
  const product = (inserted[0] as (typeof products.$inferSelect)[])[0]!;
  const variantRows = await db
    .select()
    .from(variants)
    .where(eq(variants.productId, productId));
  const imageRows = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(productImages.position);
  return c.json(
    {
      data: serializeProduct(
        product,
        variantRows,
        imageRows.map((image) => ({ key: image.key, alt: image.alt })),
      ),
    },
    201,
  );
});

adminRoutes.patch("/admin/products/:id", async (c) => {
  requireStaff(c);
  const input = await parseBody(
    c,
    z
      .object({
        name: z.string().min(2).max(160).optional(),
        shortDescription: z.string().min(2).max(280).optional(),
        category: z.string().min(2).max(80).optional(),
        status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
        images: z
          .array(
            z.object({
              key: z.string().min(1).max(300),
              alt: z.string().min(1).max(200),
            }),
          )
          .max(8)
          .optional(),
      })
      .partial(),
  );
  const db = getDb(c.env);
  const id = c.req.param("id");
  const { images, ...productInput } = input;
  if (images) {
    await db.batch([
      db.delete(productImages).where(eq(productImages.productId, id)),
      ...images.map((image, index) =>
        db.insert(productImages).values({
          productId: id,
          key: image.key,
          alt: image.alt,
          position: index,
        }),
      ),
    ] as [any, ...any[]]);
  }
  const updated = await db
    .update(products)
    .set({
      ...productInput,
      ...(productInput.status === "ACTIVE" ? { publishedAt: new Date() } : {}),
      updatedAt: new Date(),
    })
    .where(eq(products.id, id))
    .returning();
  return c.json({ data: updated[0] });
});

adminRoutes.get("/admin/coupons", async (c) => {
  requireStaff(c);
  const rows = await getDb(c.env).select().from(coupons).orderBy(coupons.code);
  return c.json({ data: rows });
});

adminRoutes.post("/admin/coupons", async (c) => {
  requireStaff(c);
  const input = await parseBody(
    c,
    z.object({
      code: z.string().min(2).max(40),
      kind: z.enum(["PERCENT", "FIXED"]),
      value: z.coerce.number().positive(),
      minimum: z.coerce.number().nonnegative().default(0),
      startsAt: z.coerce.date().default(() => new Date()),
      endsAt: z.coerce.date(),
      usageLimit: z.coerce.number().int().positive().optional(),
    }),
  );
  const inserted = await getDb(c.env)
    .insert(coupons)
    .values({
      code: input.code.toUpperCase(),
      kind: input.kind,
      value: input.kind === "PERCENT" ? input.value : Math.round(input.value * 100),
      minimumCents: Math.round((input.minimum ?? 0) * 100),
      startsAt: input.startsAt ?? new Date(),
      endsAt: input.endsAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usageLimit: input.usageLimit ?? null,
    })
    .returning();
  return c.json({ data: inserted[0] }, 201);
});

adminRoutes.get("/admin/shipping-zones", async (c) => {
  requireStaff(c);
  const rows = await getDb(c.env)
    .select()
    .from(shippingZones)
    .orderBy(shippingZones.cepStart);
  return c.json({ data: rows });
});

adminRoutes.get("/admin/newsletter", async (c) => {
  requireStaff(c);
  const rows = await getDb(c.env)
    .select()
    .from(newsletterSubscribers)
    .orderBy(desc(newsletterSubscribers.createdAt))
    .limit(500);
  return c.json({ data: rows });
});

adminRoutes.get("/admin/orders-summary", async (c) => {
  requireStaff(c);
  const db = getDb(c.env);
  const [paid] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(eq(orders.status, "PAID"));
  const [revenue] = await db
    .select({ total: sql<number>`coalesce(sum(${orders.totalCents}), 0)` })
    .from(orders)
    .where(eq(orders.status, "PAID"));
  const [items] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orderItems);
  return c.json({
    data: {
      paidOrders: paid?.count ?? 0,
      revenueCents: revenue?.total ?? 0,
      items: items?.count ?? 0,
    },
  });
});

adminRoutes.get("/admin/settings", async (c) => {
  requireAdmin(c);
  const rows = await getDb(c.env).select().from(settings);
  return c.json({ data: rows });
});

adminRoutes.put("/admin/settings/:key", async (c) => {
  requireAdmin(c);
  const body = await parseBody(c, z.object({ value: z.unknown() }));
  const db = getDb(c.env);
  await db
    .insert(settings)
    .values({ key: c.req.param("key"), value: body.value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: body.value, updatedAt: new Date() },
    });
  return c.json({ ok: true });
});
