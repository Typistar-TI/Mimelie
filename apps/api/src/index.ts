import type { ExecutionContext } from "@cloudflare/workers-types";
import { app } from "./app.js";
import type { Env } from "./env.js";
import { handleQueue, handleScheduled } from "./jobs.js";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    if (url.hostname === "painel-mimelie.vira.ia.br") {
      if (url.pathname.startsWith("/v1/")) {
        return app.fetch(request, env, ctx);
      }
      return env.ASSETS.fetch(request);
    }
    return app.fetch(request, env, ctx);
  },
  queue: handleQueue,
  scheduled: handleScheduled,
};
