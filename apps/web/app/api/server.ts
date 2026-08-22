import 'server-only';

const apiUrl = process.env.API_INTERNAL_URL ?? 'http://localhost:3001';

export function backendFetch(path: string, init: RequestInit = {}) {
  return fetch(`${apiUrl}/v1${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...init.headers,
    },
  });
}
