export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type ApiErrorBody = {
  message?: string | string[];
  error?: string;
};

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as ApiErrorBody | null;
    const message = Array.isArray(body?.message)
      ? body.message.join(' ')
      : body?.message ?? body?.error ?? 'Não foi possível concluir a solicitação.';
    throw new ApiError(message, response.status, body);
  }

  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}

let csrfToken: string | null = null;

export async function getCsrfToken() {
  if (csrfToken) return csrfToken;
  const result = await request<{ csrfToken: string }>('/api/auth/csrf');
  csrfToken = result.csrfToken;
  return csrfToken;
}

export async function protectedRequest<T>(path: string, init: RequestInit = {}) {
  return request<T>(path, {
    ...init,
    headers: {
      ...init.headers,
      'x-csrf-token': await getCsrfToken(),
    },
  });
}
