# Mimelie

Loja de maquiagem e curadoria de ofertas em um único produto, com **toda a infraestrutura própria dentro da Cloudflare**.

A fusão reúne a vitrine e o checkout da Mimelie com o catálogo de ofertas, cupons e moderação do Promimi. Não há VPS, Docker, PostgreSQL externo, Redis, Railway ou Vercel.

## Arquitetura

```text
Cloudflare
├─ Worker  mimelie-web    Next.js 15 + OpenNext (loja, ofertas, conteúdo, conta)
├─ Worker  mimelie-api    Hono (API, admin SPA, webhooks, filas e cron)
│  ├─ D1                 commerce + deals + identity + content + ops
│  ├─ R2                 mídia, PDFs e backups
│  ├─ KV                 sessão, cache e flags
│  ├─ Queues             e-mail, publicação, expiração
│  ├─ Cron Triggers      expiração de ofertas
│  ├─ Email Service      envio transacional
│  └─ Static Assets      painel admin (Vite) em /
└─ Images / Access / Turnstile / WAF / Analytics
```

| Aplicação | Stack | Responsabilidade |
| --- | --- | --- |
| `apps/web` | Next 15 + OpenNext | loja, produtos, ofertas, conteúdo, checkout, conta |
| `apps/admin` | React + Vite | painel de ofertas, produtos, pedidos, moderação e rotinas |
| `apps/api` | Hono + Drizzle + D1 | API REST, autenticação, admin, filas e cron |
| `packages/db` | Drizzle + D1 | schema, migrations e seed |
| `packages/domain` | TypeScript puro | regras de estoque, pedido e desconto |
| `packages/contracts` | Zod | contratos compartilhados |
| `packages/ui` | TypeScript | tokens e formatação da loja |
| `packages/design-system` | React + Tailwind | componentes do painel |
| `packages/query` | React Query | política de cache do painel |

## Ambiente publicado

- Loja: https://mimelie-web.vira-ia-br.workers.dev
- API + painel: https://mimelie-api.vira-ia-br.workers.dev
- Jobs: https://mimelie-jobs.vira-ia-br.workers.dev
- D1: `mimelie-db`
- R2: `mimelie-media` e `mimelie-next-cache`
- KV: `SESSIONS`
- Filas: `mimelie-jobs` e `mimelie-jobs-dlq`

O painel é servido pelo Worker da API em `/`, na mesma origem da sessão. Entre com o e-mail e a senha criados no bootstrap e ative o TOTP no primeiro acesso.

**E-mail:** o binding `send_email` já está publicado, mas o domínio de envio precisa ser habilitado no painel da Cloudflare (Email Service) para os magic links e avisos de pedido saírem. O login do painel por senha funciona sem essa etapa.

Esses endereços `workers.dev` são o preview publicado. Ao configurar os domínios definitivos, atualize `WEB_ORIGIN`, `ADMIN_ORIGIN` e `API_PUBLIC_URL` em `apps/api/wrangler.jsonc` e `API_INTERNAL_URL`, `NEXT_PUBLIC_SITE_URL` e `NEXT_PUBLIC_ADMIN_URL` em `apps/web/wrangler.jsonc`.

## Decisões de produto para caber em 100% Cloudflare

- **Pagamento:** PIX copia e cola gerado no Worker. O pedido fica `PENDING_PAYMENT` e a equipe confirma no painel. Cartão não faz parte do escopo inicial.
- **Frete:** tabela de CEP/peso no D1, cálculo no Worker. Etiqueta e rastreio são lançados manualmente.
- **Fiscal:** recibo interno em PDF; NF-e oficial fica fora até nova decisão.
- **Marketplaces:** integração removida; venda apenas na loja própria.
- **WhatsApp:** a automação antiga não roda em Worker. O caminho é Cloudflare Containers ou a API oficial da Meta.
- **E-mail:** Cloudflare Email Service (transacional). Newsletter usa a mesma lista, em volume baixo.

## Rodando localmente

Pré-requisitos: Node 22+, pnpm 10+ e uma conta Cloudflare (apenas para deploy).

```bash
pnpm install
cp .env.example .env
```

Crie `apps/api/.dev.vars`:

```dotenv
ENVIRONMENT=development
WEB_ORIGIN=http://localhost:3000
ADMIN_ORIGIN=http://localhost:5174
API_PUBLIC_URL=http://localhost:8788
SESSION_SECRET=dev-session-secret-with-at-least-32-characters
ADMIN_BOOTSTRAP_TOKEN=dev-bootstrap-token
```

Aplique o schema e o seed no D1 local:

```bash
pnpm db:migrate:local
pnpm db:seed:local
```

Suba tudo:

```bash
pnpm dev
```

- Loja: `http://localhost:3000`
- API: `http://localhost:8788/v1/health`
- Painel: `http://localhost:5174` (proxy `/v1` para a API)

### Primeiro administrador

```bash
curl -X POST http://localhost:8788/v1/auth/bootstrap \
  -H 'content-type: application/json' \
  -d '{"email":"admin@mimelie.com","password":"uma-senha-forte","name":"Admin","token":"dev-bootstrap-token"}'
```

Depois entre em `http://localhost:5174` com esse e-mail e senha. Ative o TOTP no painel antes de produção.

## Deploy na Cloudflare

1. Crie os recursos:

```bash
wrangler d1 create mimelie-db
wrangler r2 bucket create mimelie-media
wrangler kv namespace create SESSIONS
wrangler queues create mimelie-jobs
wrangler queues create mimelie-jobs-dlq
```

2. Preencha `database_id` e o `id` do KV em `apps/api/wrangler.jsonc`.

3. Aplique as migrations e o seed remotos:

```bash
pnpm db:migrate:remote
pnpm db:seed:remote
```

4. Configure os segredos:

```bash
cd apps/api
wrangler secret put SESSION_SECRET
wrangler secret put ADMIN_BOOTSTRAP_TOKEN
```

5. Ajuste os domínios em `apps/api/wrangler.jsonc` (`WEB_ORIGIN`, `ADMIN_ORIGIN`, `API_PUBLIC_URL`) e em `apps/web/wrangler.jsonc` (`API_INTERNAL_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ADMIN_URL`).

6. Publique:

```bash
pnpm deploy:api   # build do admin + Worker da API
pnpm deploy:jobs  # Worker de filas e cron
pnpm deploy:web   # OpenNext + Worker da loja
```

O painel é servido pelo próprio Worker da API em `/`, o que mantém o cookie de sessão na mesma origem. Coloque o domínio do painel atrás do **Cloudflare Access**.

## O que já está implementado

- Catálogo de produtos com variantes, imagens, estoque e busca.
- Checkout com idempotência, cupom, frete por CEP, PIX e baixa atômica de estoque via trigger no D1.
- Acompanhamento de pedido por token.
- Catálogo de ofertas com lojas, categorias, busca, cupons, favoritos, comentários, denúncias e clique rastreado.
- Autenticação por magic link para clientes e senha + TOTP para a equipe.
- Painel admin com ofertas, categorias, comentários, usuários, rotinas, integrações, publicações e estatísticas.
- E-mail transacional, fila de jobs, cron de expiração e outbox.
- SEO com metadados, JSON-LD, sitemap e PWA.

## Próximos passos

- Editor de produtos e upload de imagens no painel.
- QR code do PIX no checkout.
- Conciliação de extrato OFX/CSV.
- Cloudflare Access no domínio do painel.
- Containers para o bridge de WhatsApp, se ainda for necessário.
- Testes de integração com `wrangler dev` e D1 local.

## Backups

`scripts/backup-d1.sh` exporta o D1 e envia o dump para o R2. Agende via Cron Trigger ou GitHub Actions e faça restore drills periódicos.
