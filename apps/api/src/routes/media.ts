import { Hono } from "hono";
import type { AppEnv } from "../types.js";
import { requireStaff } from "../lib/auth.js";
import { badRequest, notFound } from "../lib/http.js";

export const mediaRoutes = new Hono<AppEnv>();

mediaRoutes.post("/admin/uploads", async (c) => {
  requireStaff(c);
  const body = await c.req.parseBody();
  const file = body["file"];
  if (!(file instanceof File)) badRequest("Envie um arquivo de imagem.");
  if (!file.type.startsWith("image/")) badRequest("O arquivo precisa ser uma imagem.");
  if (file.size > 5 * 1024 * 1024) badRequest("A imagem deve ter no máximo 5 MB.");
  const extension =
    file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
    "png";
  const key = `products/${crypto.randomUUID()}.${extension}`;
  await c.env.MEDIA.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });
  return c.json({
    key,
    url: `${c.env.API_PUBLIC_URL}/v1/media/${key}`,
  });
});

mediaRoutes.get("/media/*", async (c) => {
  const key = c.req.path.replace(/^\/v1\/media\//, "");
  if (!key) notFound("Imagem não encontrada.");
  const object = await c.env.MEDIA.get(key);
  if (!object) notFound("Imagem não encontrada.");
  return new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
});
