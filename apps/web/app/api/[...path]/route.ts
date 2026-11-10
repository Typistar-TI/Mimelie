import type { NextRequest } from 'next/server';
import { backendProxy } from '../server';

export const dynamic = 'force-dynamic';

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const url = new URL(request.url);
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('content-length');
  const init = {
    method: request.method,
    headers,
    body:
      request.method === 'GET' || request.method === 'HEAD'
        ? undefined
        : request.body,
    duplex: 'half',
    redirect: 'manual',
  } as RequestInit;
  const response = await backendProxy(`/${path.join('/')}${url.search}`, init);
  return new Response(response.body, {
    status: response.status,
    headers: new Headers(response.headers),
  });
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
  proxy as OPTIONS,
};
