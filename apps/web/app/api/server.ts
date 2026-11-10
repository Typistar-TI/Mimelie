import 'server-only';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { app as apiApp } from '@mimelie/api';

function apiBase(): string {
  return process.env.API_INTERNAL_URL ?? 'http://localhost:8788';
}

async function apiEnv(): Promise<unknown | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env;
  } catch {
    return null;
  }
}

function canUseApi(env: unknown): boolean {
  const db = (env as { DB?: { prepare?: unknown } } | null)?.DB;
  return Boolean(env && typeof db?.prepare === "function");
}

export async function backendFetch(path: string, init: RequestInit = {}) {
  const env = await apiEnv();
  const headers = {
    'content-type': 'application/json',
    ...init.headers,
  };
  if (canUseApi(env)) {
    return apiApp.fetch(
      new Request(`https://api.internal/v1${path}`, { ...init, headers }),
      env as never,
    );
  }
  return fetch(`${apiBase()}/v1${path}`, { ...init, headers });
}

export async function backendProxy(path: string, init: RequestInit) {
  const env = await apiEnv();
  if (canUseApi(env)) {
    return apiApp.fetch(
      new Request(`https://api.internal/v1${path}`, init),
      env as never,
    );
  }
  return fetch(`${apiBase()}/v1${path}`, init);
}
