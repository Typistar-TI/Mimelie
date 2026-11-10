import 'server-only';
import { getCloudflareContext } from '@opennextjs/cloudflare';

type ApiFetcher = {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
};

async function apiBinding(): Promise<ApiFetcher | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as { API?: ApiFetcher }).API ?? null;
  } catch {
    return null;
  }
}

function apiBase(): string {
  return process.env.API_INTERNAL_URL ?? 'http://localhost:8788';
}

export async function backendFetch(path: string, init: RequestInit = {}) {
  const binding = await apiBinding();
  const url = `https://api.internal/v1${path}`;
  if (binding) {
    return binding.fetch(url, {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...init.headers,
      },
    });
  }
  return fetch(`${apiBase()}/v1${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...init.headers,
    },
  });
}

export async function backendProxy(path: string, init: RequestInit) {
  const binding = await apiBinding();
  const url = `https://api.internal/v1${path}`;
  return binding ? binding.fetch(url, init) : fetch(`${apiBase()}/v1${path}`, init);
}
