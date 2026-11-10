import { and, eq, gt, isNull } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { magicLinks, users } from "@mimelie/db";
import type { AppEnv } from "../types.js";
import {
  createSession,
  issueCsrfToken,
  requireUser,
  revokeSession,
} from "../lib/auth.js";
import {
  decryptSecret,
  encryptSecret,
  generateTotpSecret,
  hashPassword,
  randomToken,
  sha256,
  totpUri,
  verifyPassword,
  verifyTotp,
} from "../lib/crypto.js";
import { getDb } from "../lib/db.js";
import { badRequest, conflict, parseBody, unauthorized } from "../lib/http.js";

export const authRoutes = new Hono<AppEnv>();

const emailSchema = z
  .string()
  .email()
  .transform((value) => value.trim().toLowerCase());

authRoutes.get("/auth/csrf", (c) => {
  return c.json({ csrfToken: issueCsrfToken(c) });
});

authRoutes.post("/auth/magic-link", async (c) => {
  const { email } = await parseBody(c, z.object({ email: emailSchema }));
  const db = getDb(c.env);
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  const token = randomToken();
  await db.insert(magicLinks).values({
    email,
    userId: existing[0]?.id ?? null,
    tokenHash: await sha256(token),
    expiresAt: new Date(Date.now() + 15 * 60_000),
  });
  const url = `${c.env.WEB_ORIGIN}/entrar?token=${encodeURIComponent(token)}`;
  if (c.env.JOBS) {
    c.executionCtx.waitUntil(
      c.env.JOBS.send({ type: "magic-link", email, url }),
    );
  } else {
    console.log("[magic-link]", url);
  }
  return c.json({
    accepted: true,
    ...(c.env.ENVIRONMENT !== "production" ? { developmentUrl: url } : {}),
  });
});

authRoutes.post("/auth/consume", async (c) => {
  const input = await parseBody(
    c,
    z.object({
      token: z.string().min(20),
      totp: z.string().regex(/^\d{6}$/).optional(),
    }),
  );
  const db = getDb(c.env);
  const tokenHash = await sha256(input.token);
  const links = await db
    .select()
    .from(magicLinks)
    .where(
      and(
        eq(magicLinks.tokenHash, tokenHash),
        isNull(magicLinks.usedAt),
        gt(magicLinks.expiresAt, new Date()),
      ),
    )
    .limit(1);
  const link = links[0];
  if (!link) unauthorized("Link inválido ou expirado.");

  const found = await db
    .select()
    .from(users)
    .where(eq(users.email, link.email))
    .limit(1);
  let user = found[0];
  if (!user) {
    const inserted = await db.insert(users).values({ email: link.email }).returning();
    user = inserted[0]!;
  }

  if (user.role === "ADMIN" && user.totpEnabled) {
    if (!input.totp || !user.totpSecret) {
      unauthorized("Informe o código do autenticador.");
    }
    const secret = await decryptSecret(user.totpSecret, c.env.SESSION_SECRET);
    if (!(await verifyTotp(secret, input.totp))) {
      unauthorized("Código de segundo fator inválido.");
    }
  }

  const claimed = await db
    .update(magicLinks)
    .set({ usedAt: new Date(), userId: user.id })
    .where(and(eq(magicLinks.id, link.id), isNull(magicLinks.usedAt)))
    .returning({ id: magicLinks.id });
  if (!claimed.length) unauthorized("Link já utilizado.");

  await createSession(
    c,
    user.id,
    c.req.header("cf-connecting-ip"),
    c.req.header("user-agent"),
  );
  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    requiresTotpEnrollment: user.role === "ADMIN" && !user.totpEnabled,
  });
});

authRoutes.post("/auth/login", async (c) => {
  const input = await parseBody(
    c,
    z.object({
      email: emailSchema,
      password: z.string().min(1),
      totpCode: z.string().regex(/^\d{6}$/).optional(),
    }),
  );
  const db = getDb(c.env);
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);
  const user = rows[0];
  if (!user || user.deletedAt || !user.passwordHash) {
    unauthorized("E-mail ou senha incorretos.");
  }
  if (!(await verifyPassword(input.password, user.passwordHash))) {
    unauthorized("E-mail ou senha incorretos.");
  }
  if (user.role === "ADMIN" && user.totpEnabled) {
    if (!input.totpCode || !user.totpSecret) {
      return c.json(
        { error: "TOTP_REQUIRED", message: "Informe o código do autenticador." },
        401,
      );
    }
    const secret = await decryptSecret(user.totpSecret, c.env.SESSION_SECRET);
    if (!(await verifyTotp(secret, input.totpCode))) {
      unauthorized("Código de segundo fator inválido.");
    }
  }
  await createSession(
    c,
    user.id,
    c.req.header("cf-connecting-ip"),
    c.req.header("user-agent"),
  );
  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

authRoutes.post("/auth/logout", async (c) => {
  await revokeSession(c);
  return c.json({ signedOut: true });
});

authRoutes.get("/me", async (c) => {
  const user = requireUser(c);
  const rows = await getDb(c.env)
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  const record = rows[0];
  if (!record) unauthorized("Conta não encontrada.");
  return c.json({
    data: {
      id: record.id,
      email: record.email,
      name: record.name,
      role: record.role === "CUSTOMER" ? "VISITOR" : record.role,
      emailVerifiedAt: record.emailVerifiedAt,
      totpEnabled: record.totpEnabled,
    },
  });
});

authRoutes.post("/auth/totp/start", async (c) => {
  const user = requireUser(c);
  if (user.role !== "ADMIN" && user.role !== "EDITOR") {
    unauthorized("Apenas a equipe configura o segundo fator.");
  }
  const secret = generateTotpSecret();
  await getDb(c.env)
    .update(users)
    .set({
      totpSecret: await encryptSecret(secret, c.env.SESSION_SECRET),
      totpEnabled: false,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));
  return c.json({ secret, otpauthUrl: totpUri(user.email, secret) });
});

authRoutes.post("/auth/totp/confirm", async (c) => {
  const user = requireUser(c);
  const { code } = await parseBody(c, z.object({ code: z.string().regex(/^\d{6}$/) }));
  const rows = await getDb(c.env)
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  const record = rows[0];
  if (!record?.totpSecret) badRequest("Inicie a configuração do segundo fator.");
  const secret = await decryptSecret(record.totpSecret, c.env.SESSION_SECRET);
  if (!(await verifyTotp(secret, code))) badRequest("Código inválido.");
  await getDb(c.env)
    .update(users)
    .set({ totpEnabled: true, updatedAt: new Date() })
    .where(eq(users.id, user.id));
  return c.json({ enabled: true });
});

authRoutes.post("/auth/bootstrap", async (c) => {
  const input = await parseBody(
    c,
    z.object({
      email: emailSchema,
      password: z.string().min(10),
      token: z.string().min(1),
      name: z.string().min(2).max(120).optional(),
    }),
  );
  if (input.token !== c.env.ADMIN_BOOTSTRAP_TOKEN) {
    unauthorized("Token de inicialização inválido.");
  }
  const db = getDb(c.env);
  const admins = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "ADMIN"))
    .limit(1);
  if (admins.length) conflict("Já existe um administrador cadastrado.");
  const inserted = await db
    .insert(users)
    .values({
      email: input.email,
      name: input.name,
      role: "ADMIN",
      passwordHash: await hashPassword(input.password),
      emailVerifiedAt: new Date(),
    })
    .returning();
  const created = inserted[0]!;
  return c.json(
    {
      data: {
        id: created.id,
        email: created.email,
        name: created.name,
        role: created.role,
      },
    },
    201,
  );
});
