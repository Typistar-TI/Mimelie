import { HTTPException } from "hono/http-exception";
import type { Context } from "hono";
import type { ZodType } from "zod";
import type { AppEnv } from "../types";

export function badRequest(message: string): never {
  throw new HTTPException(400, { message });
}

export function unauthorized(message = "Entre para continuar."): never {
  throw new HTTPException(401, { message });
}

export function forbidden(message = "Você não tem permissão para esta ação."): never {
  throw new HTTPException(403, { message });
}

export function notFound(message = "Não encontrado."): never {
  throw new HTTPException(404, { message });
}

export function conflict(message: string): never {
  throw new HTTPException(409, { message });
}

export async function parseBody<T>(
  c: Context<AppEnv>,
  schema: ZodType<T>,
): Promise<T> {
  const body = await c.req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new HTTPException(400, {
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    });
  }
  return parsed.data;
}

export function parseQuery<T>(
  c: Context<AppEnv>,
  schema: ZodType<T>,
): T {
  const parsed = schema.safeParse(c.req.query());
  if (!parsed.success) {
    throw new HTTPException(400, {
      message: parsed.error.issues[0]?.message ?? "Parâmetros inválidos.",
    });
  }
  return parsed.data;
}
