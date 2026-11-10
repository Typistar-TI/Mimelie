type Env = {
  ASSETS: { fetch(request: Request): Promise<Response> };
  API: { fetch(request: Request): Promise<Response> };
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/v1/")) {
      const target = new URL(request.url);
      target.hostname = "api.internal";
      return env.API.fetch(new Request(target.toString(), request));
    }
    return env.ASSETS.fetch(request);
  },
};
