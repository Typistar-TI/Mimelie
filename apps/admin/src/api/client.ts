export const apiBase = "/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export type ApiResponse<T> = { data: T };

export async function uploadFile(file: File): Promise<{ key: string; url: string }> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(`${apiBase}/admin/uploads`, {
    method: "POST",
    body: form,
    credentials: "include",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      payload.message ?? "Não foi possível enviar a imagem.",
      response.status,
    );
  }
  return payload as { key: string; url: string };
}

/** Every request sends only the HttpOnly session cookie; no browser token exists. */
export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("content-type"))
    headers.set("content-type", "application/json");

  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new ApiError(
      payload.message ?? "Não foi possível acessar o painel.",
      response.status,
    );
  return payload as T;
}
