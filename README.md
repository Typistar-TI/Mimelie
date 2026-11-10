# Mimelie

Loja de maquiagem e curadoria de ofertas em um único produto, com **toda a infraestrutura própria dentro da Cloudflare**.

A fusão reúne a vitrine e o checkout da Mimelie com o catálogo de ofertas, cupons e moderação do Promimi. Não há VPS, Docker, PostgreSQL externo, Redis, Railway ou Vercel.

## Arquitetura

```text
Cloudflare
├─ Worker  mimelie
│  ├─ mimelie.vira.ia.br         Next.js 16 + OpenNext (loja, ofertas, conteúdo, conta)
│  ├─ painel-mimelie.vira.ia.br  Vite SPA + /v1 para a API
│  ├─ api-mimelie.vira.ia.br     Hono (API e webhooks)
│  ├─ D1                 commerce + deals + identity + content + ops
│  ├─ R2                 mídia, PDFs, cache ISR e backups
│  ├─ KV                 sessão, cache e flags
│  ├─ Queues             e-mail, publicação, expiração
│  ├─ Cron Triggers      expiração de ofertas
│  └─ Email Service      envio transacional
└─ Images / Turnstile / WAF / Analytics
```

| Aplicação | Stack | Responsabilidade |
| --- | --- | --- |
| `apps/web` | Next 16 + OpenNext | loja, produtos, ofertas, conteúdo, checkout, conta |
| `apps/admin` | React + Vite | painel de ofertas, produtos, pedidos, moderação e rotinas |
| `apps/api` | Hono + Drizzle + D1 | API REST, autenticação, painel, filas e cron |
| `packages/db` | Drizzle + D1 | schema, migrations e seed |
| `packages/domain` | TypeScript puro | regras de estoque, pedido e desconto |
| `packages/contracts` | Zod | contratos compartilhados |
| `packages/ui` | TypeScript | tokens e formatação da loja |
| `packages/design-system` | React + Tailwind | componentes do painel |
| `packages/query` | React Query | política de cache do painel |

## Ambiente publicado

- Loja: https://mimelie.vira.ia.br
- Painel: https://painel-mimelie.vira.ia.br
- API: https://api-mimelie.vira.ia.br
- Jobs: dentro do Worker `mimelie`
- D1: `mimelie-db`
- R2: `mimelie-media` e `mimelie-next-cache`
- KV: `SESSIONS`
- Filas: `mimelie-jobs` e `mimelie-jobs-dlq`

O painel é servido pelo mesmo Worker da API no host `painel-mimelie.vira.ia.br`: o Worker entrega os arquivos do Vite e encaminha `/v1/*` para o Hono. Assim o cookie de sessão fica na mesma origem do painel e a API continua pública em `api-mimelie.vira.ia.br` para a loja. Entre com o e-mail e a senha criados no bootstrap e ative o TOTP no primeiro acesso.

**E-mail:** o binding `send_email` já está publicado, mas o domínio de envio precisa ser habilitado no painel da Cloudflare (Email Service) para os magic links e avisos de pedido saírem. O login do painel por senha funciona sem essa etapa.

A zona `vira.ia.br` tem uma rota curinga `*.vira.ia.br/*` apontando para o Worker `vira`. Por isso a Mimelie usa rotas explícitas `mimelie.vira.ia.br/*`, `painel-mimelie.vira.ia.br/*` e `api-mimelie.vira.ia.br/*` no único Worker `mimelie`, que têm precedência. Se recriar o Worker, mantenha essas rotas em `apps/api/wrangler.jsonc`.

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
pnpm deploy:api    # build do painel + OpenNext + Worker único
```

O painel e a loja são servidos pelo mesmo Worker, em hosts diferentes, o que mantém o cookie de sessão do painel na mesma origem.

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
