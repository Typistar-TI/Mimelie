import {
  and,
  desc,
  eq,
  gte,
  inArray,
  like,
  lte,
  or,
} from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import {
  comments,
  contentPosts,
  offerCategories,
  offerClicks,
  offers,
  productImages,
  products,
  stores,
  users,
  variants,
} from "@mimelie/db";
import type { AppEnv } from "../types.js";
import { getDb } from "../lib/db.js";
import { notFound, parseQuery } from "../lib/http.js";
import { serializeOffer, serializeProduct } from "../lib/serializers.js";

export const catalogRoutes = new Hono<AppEnv>();

const productSearch = z.object({ q: z.string().max(80).optional() });
const offerSearch = z.object({
  q: z.string().max(120).optional(),
  store: z.string().max(120).optional(),
  category: z.string().max(120).optional(),
  min: z.coerce.number().nonnegative().optional(),
  max: z.coerce.number().nonnegative().optional(),
});

catalogRoutes.get("/catalog/products", async (c) => {
  const { q } = parseQuery(c, productSearch);
  const db = getDb(c.env);
  const filters = [eq(products.status, "ACTIVE")];
  if (q) {
    filters.push(
      or(
        like(products.name, `%${q}%`),
        like(products.category, `%${q}%`),
      )!,
    );
  }
  const rows = await db
    .select()
    .from(products)
    .where(and(...filters))
    .orderBy(desc(products.publishedAt));
  const ids = rows.map((row) => row.id);
  const variantRows = ids.length
    ? await db
        .select()
        .from(variants)
        .where(and(inArray(variants.productId, ids), eq(variants.active, true)))
    : [];
  const imageRows = ids.length
    ? await db
        .select()
        .from(productImages)
        .where(inArray(productImages.productId, ids))
        .orderBy(productImages.position)
    : [];
  return c.json(
    rows.map((product) =>
      serializeProduct(
        product,
        variantRows.filter((variant) => variant.productId === product.id),
        imageRows
          .filter((image) => image.productId === product.id)
          .map((image) => ({ key: image.key, alt: image.alt })),
      ),
    ),
  );
});

catalogRoutes.get("/catalog/products/:slug", async (c) => {
  const db = getDb(c.env);
  const rows = await db
    .select()
    .from(products)
    .where(
      and(eq(products.slug, c.req.param("slug")), eq(products.status, "ACTIVE")),
    )
    .limit(1);
  const product = rows[0];
  if (!product) notFound("Produto não encontrado.");
  const variantRows = await db
    .select()
    .from(variants)
    .where(and(eq(variants.productId, product.id), eq(variants.active, true)));
  const imageRows = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, product.id))
    .orderBy(productImages.position);
  return c.json(
    serializeProduct(
      product,
      variantRows,
      imageRows.map((image) => ({ key: image.key, alt: image.alt })),
    ),
  );
});

catalogRoutes.get("/content/posts", async (c) => {
  const rows = await getDb(c.env)
    .select()
    .from(contentPosts)
    .where(
      and(
        eq(contentPosts.status, "PUBLISHED"),
        lte(contentPosts.publishedAt, new Date()),
      ),
    )
    .orderBy(desc(contentPosts.publishedAt));
  return c.json(rows);
});

catalogRoutes.get("/content/posts/:slug", async (c) => {
  const rows = await getDb(c.env)
    .select()
    .from(contentPosts)
    .where(
      and(
        eq(contentPosts.slug, c.req.param("slug")),
        eq(contentPosts.status, "PUBLISHED"),
        lte(contentPosts.publishedAt, new Date()),
      ),
    )
    .limit(1);
  if (!rows[0]) notFound("Conteúdo não encontrado.");
  return c.json(rows[0]);
});

catalogRoutes.get("/categories", async (c) => {
  const rows = await getDb(c.env)
    .select()
    .from(offerCategories)
    .where(eq(offerCategories.isActive, true))
    .orderBy(offerCategories.name);
  return c.json({ data: rows });
});

catalogRoutes.get("/stores", async (c) => {
  const rows = await getDb(c.env)
    .select()
    .from(stores)
    .where(eq(stores.isActive, true))
    .orderBy(stores.name);
  return c.json({ data: rows });
});

catalogRoutes.get("/offers", async (c) => {
  const query = parseQuery(c, offerSearch);
  const db = getDb(c.env);
  const filters = [
    eq(offers.status, "PUBLISHED"),
    lte(offers.publishedAt, new Date()),
  ];
  if (query.q) filters.push(like(offers.title, `%${query.q}%`));
  if (query.min != null) {
    filters.push(gte(offers.currentPriceCents, Math.round(query.min * 100)));
  }
  if (query.max != null) {
    filters.push(lte(offers.currentPriceCents, Math.round(query.max * 100)));
  }
  if (query.store) filters.push(eq(stores.slug, query.store));
  if (query.category) filters.push(eq(offerCategories.slug, query.category));
  const rows = await db
    .select({ offer: offers, store: stores, category: offerCategories })
    .from(offers)
    .innerJoin(stores, eq(offers.storeId, stores.id))
    .leftJoin(offerCategories, eq(offers.categoryId, offerCategories.id))
    .where(and(...filters))
    .orderBy(desc(offers.publishedAt))
    .limit(120);
  return c.json({
    data: rows.map((row) => serializeOffer(row.offer, row.store, row.category)),
    total: rows.length,
  });
});

catalogRoutes.get("/offers/:slug", async (c) => {
  const rows = await getDb(c.env)
    .select({ offer: offers, store: stores, category: offerCategories })
    .from(offers)
    .innerJoin(stores, eq(offers.storeId, stores.id))
    .leftJoin(offerCategories, eq(offers.categoryId, offerCategories.id))
    .where(
      and(
        eq(offers.slug, c.req.param("slug")),
        eq(offers.status, "PUBLISHED"),
        lte(offers.publishedAt, new Date()),
      ),
    )
    .limit(1);
  const row = rows[0];
  if (!row) notFound("Oferta não encontrada.");
  return c.json(serializeOffer(row.offer, row.store, row.category));
});

catalogRoutes.post("/offers/:id/click", async (c) => {
  const db = getDb(c.env);
  const rows = await db
    .select({ url: offers.affiliateUrl })
    .from(offers)
    .where(
      and(
        eq(offers.id, c.req.param("id")),
        eq(offers.status, "PUBLISHED"),
      ),
    )
    .limit(1);
  const offer = rows[0];
  if (!offer) notFound("Oferta não encontrada.");
  await db.insert(offerClicks).values({
    offerId: c.req.param("id"),
    source: c.req.query("source") ?? "direct",
  });
  return c.json({ url: offer.url });
});

catalogRoutes.get("/offers/:id/go", async (c) => {
  const db = getDb(c.env);
  const rows = await db
    .select({ url: offers.affiliateUrl })
    .from(offers)
    .where(
      and(
        eq(offers.id, c.req.param("id")),
        eq(offers.status, "PUBLISHED"),
      ),
    )
    .limit(1);
  const offer = rows[0];
  if (!offer) notFound("Oferta não encontrada.");
  await db.insert(offerClicks).values({
    offerId: c.req.param("id"),
    source: c.req.query("source") ?? "direct",
  });
  return c.redirect(offer.url, 302);
});

catalogRoutes.get("/offers/:id/comments", async (c) => {
  const rows = await getDb(c.env)
    .select({ comment: comments, author: users })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(
      and(
        eq(comments.offerId, c.req.param("id")),
        eq(comments.isHidden, false),
      ),
    )
    .orderBy(desc(comments.createdAt))
    .limit(100);
  return c.json({
    data: rows.map((row) => ({
      id: row.comment.id,
      body: row.comment.body,
      createdAt: row.comment.createdAt,
      author: row.author.name ?? "Visitante Mimelie",
    })),
  });
});
