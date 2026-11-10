import 'server-only';

export function backendFetch(path: string, init: RequestInit = {}) {
  const apiUrl = process.env.API_INTERNAL_URL ?? 'http://localhost:8788';
  return fetch(`${apiUrl}/v1${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...init.headers,
    },
  });
}
