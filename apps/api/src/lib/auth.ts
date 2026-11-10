import { and, eq, gt, isNull } from "drizzle-orm";
import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { sessions, users } from "@mimelie/db";
import type { AppEnv, SessionUser } from "../types";
import { hashIp, randomToken, sha256 } from "./crypto";
import { getDb } from "./db";

export const SESSION_COOKIE = "mimelie_session";
export const CSRF_COOKIE = "csrf_token";
const SESSION_SECONDS = 30 * 24 * 60 * 60;

export async function createSession(
  c: Context<AppEnv>,
  userId: string,
  ip?: string,
  userAgent?: string,
): Promise<string> {
  const token = randomToken();
  const tokenHash = await sha256(token);
  await getDb(c.env).insert(sessions).values({
    tokenHash,
    userId,
    ipHash: ip ? await hashIp(ip, c.env.SESSION_SECRET) : null,
    userAgent: userAgent?.slice(0, 300) ?? null,
    expiresAt: new Date(Date.now() + SESSION_SECONDS * 1000),
  });
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: c.env.ENVIRONMENT === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return token;
}

export async function loadSession(
  c: Context<AppEnv>,
): Promise<SessionUser | null> {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = await sha256(token);
  const rows = await getDb(c.env)
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, tokenHash),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, new Date()),
      ),
    )
    .limit(1);
  const row = rows[0];
  if (!row || row.user.deletedAt) return null;
  return {
    id: row.user.id,
    email: row.user.email,
    name: row.user.name,
    role: row.user.role,
    totpEnabled: row.user.totpEnabled,
  };
}

export async function revokeSession(c: Context<AppEnv>): Promise<void> {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) {
    await getDb(c.env)
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.tokenHash, await sha256(token)));
  }
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
}

export function requireUser(c: Context<AppEnv>): SessionUser {
  const user = c.get("user");
  if (!user) throw new HTTPException(401, { message: "Entre para continuar." });
  return user;
}

export function requireStaff(c: Context<AppEnv>): SessionUser {
  const user = requireUser(c);
  if (user.role !== "ADMIN" && user.role !== "EDITOR") {
    throw new HTTPException(403, {
      message: "Apenas a equipe pode executar esta ação.",
    });
  }
  return user;
}

export function requireAdmin(c: Context<AppEnv>): SessionUser {
  const user = requireUser(c);
  if (user.role !== "ADMIN") {
    throw new HTTPException(403, {
      message: "Apenas administradores podem executar esta ação.",
    });
  }
  return user;
}

export function issueCsrfToken(c: Context<AppEnv>): string {
  const token = randomToken(24);
  setCookie(c, CSRF_COOKIE, token, {
    httpOnly: false,
    secure: c.env.ENVIRONMENT === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: 24 * 60 * 60,
  });
  return token;
}

export function verifyOrigin(c: Context<AppEnv>): void {
  const method = c.req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return;
  const origin = c.req.header("origin");
  if (origin) {
    const allowed = [
      c.env.WEB_ORIGIN,
      c.env.ADMIN_ORIGIN,
      c.env.API_PUBLIC_URL,
    ].filter(Boolean);
    if (!allowed.includes(origin)) {
      throw new HTTPException(403, {
        message: "Origem da solicitação não permitida.",
      });
    }
  }
  const header = c.req.header("x-csrf-token");
  const cookie = getCookie(c, CSRF_COOKIE);
  if (header && cookie && header !== cookie) {
    throw new HTTPException(403, { message: "Token CSRF inválido." });
  }
}
