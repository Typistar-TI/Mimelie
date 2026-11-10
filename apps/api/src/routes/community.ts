import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import {
  comments,
  favorites,
  offerCategories,
  offers,
  reports,
  stores,
  users,
} from "@mimelie/db";
import type { AppEnv } from "../types";
import { requireStaff, requireUser } from "../lib/auth";
import { getDb } from "../lib/db";
import { parseBody } from "../lib/http";
import { serializeOffer } from "../lib/serializers";

export const communityRoutes = new Hono<AppEnv>();

communityRoutes.post("/offers/:id/favorite", async (c) => {
  const user = requireUser(c);
  await getDb(c.env)
    .insert(favorites)
    .values({ userId: user.id, offerId: c.req.param("id") })
    .onConflictDoNothing();
  return c.json({ ok: true });
});

communityRoutes.delete("/offers/:id/favorite", async (c) => {
  const user = requireUser(c);
  await getDb(c.env)
    .delete(favorites)
    .where(
      and(
        eq(favorites.userId, user.id),
        eq(favorites.offerId, c.req.param("id")),
      ),
    );
  return c.json({ ok: true });
});

communityRoutes.get("/me/favorites", async (c) => {
  const user = requireUser(c);
  const rows = await getDb(c.env)
    .select({ offer: offers, store: stores, category: offerCategories })
    .from(favorites)
    .innerJoin(offers, eq(favorites.offerId, offers.id))
    .innerJoin(stores, eq(offers.storeId, stores.id))
    .leftJoin(offerCategories, eq(offers.categoryId, offerCategories.id))
    .where(eq(favorites.userId, user.id))
    .orderBy(desc(favorites.createdAt));
  return c.json({
    data: rows.map((row) => serializeOffer(row.offer, row.store, row.category)),
  });
});

communityRoutes.post("/offers/:id/comments", async (c) => {
  const user = requireUser(c);
  const { body } = await parseBody(
    c,
    z.object({ body: z.string().trim().min(2).max(1500) }),
  );
  const inserted = await getDb(c.env)
    .insert(comments)
    .values({
      offerId: c.req.param("id"),
      userId: user.id,
      body,
    })
    .returning();
  return c.json({ data: inserted[0] }, 201);
});

communityRoutes.post("/comments/:id/report", async (c) => {
  const user = requireUser(c);
  const { reason } = await parseBody(
    c,
    z.object({ reason: z.string().trim().min(3).max(300) }),
  );
  await getDb(c.env).insert(reports).values({
    commentId: c.req.param("id"),
    reporterId: user.id,
    reason,
  });
  return c.json({ ok: true });
});

communityRoutes.get("/admin/comments", async (c) => {
  requireStaff(c);
  const rows = await getDb(c.env)
    .select({ comment: comments, user: users, offer: offers })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .innerJoin(offers, eq(comments.offerId, offers.id))
    .orderBy(desc(comments.createdAt))
    .limit(200);
  return c.json({
    data: rows.map((row) => ({
      id: row.comment.id,
      body: row.comment.body,
      isHidden: row.comment.isHidden,
      createdAt: row.comment.createdAt,
      user: { email: row.user.email, name: row.user.name },
      offer: { title: row.offer.title, slug: row.offer.slug },
    })),
  });
});

communityRoutes.patch("/admin/comments/:id", async (c) => {
  requireStaff(c);
  const { isHidden } = await parseBody(c, z.object({ isHidden: z.boolean() }));
  const updated = await getDb(c.env)
    .update(comments)
    .set({ isHidden, updatedAt: new Date() })
    .where(eq(comments.id, c.req.param("id")))
    .returning();
  return c.json({ data: updated[0] });
});
