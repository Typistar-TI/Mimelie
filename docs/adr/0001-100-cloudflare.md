# ADR 0001 — Plataforma 100% Cloudflare

- **Status:** aceito
- **Data:** 2026-11-10
- **Contexto:** fusão do Mimelie (loja de maquiagem) com o Promimi (portal de ofertas) em um único produto, com toda a infraestrutura própria dentro da Cloudflare.

## Decisão

Toda a infraestrutura do produto — compute, banco, arquivos, imagens, filas, agendamento, e-mail, cache, busca, autenticação, analytics, logs e CI/CD — roda em serviços Cloudflare. Não há VPS, Docker, Postgres externo, Redis, Railway ou Vercel.

Integrações de rede de terceiros (adquirente, SEFAZ, marketplaces, WhatsApp) são **adaptadas para deixar de existir** ou **executadas por código nosso dentro da Cloudflare**. Onde a rede de terceiro é inevitável (ex.: WhatsApp), o código roda em Cloudflare Containers e apenas a conexão externa sai da Cloudflare.

## Mapa de adaptação

| Dependência atual | Substituto 100% Cloudflare | Adaptação de produto |
| --- | --- | --- |
| PostgreSQL | **D1** (SQLite) + Drizzle | schema reescrito: centavos, sem enum, batch |
| Redis | **KV** + **Cache API** + **Durable Objects** | sessão, rate limit, cache, contadores |
| BullMQ / pg-boss | **Queues** + **Cron Triggers** + **Workflows** | e-mail, expiração, publicação, saga de pedido |
| Prisma | **Drizzle ORM** (dialeto D1) | migrations via `wrangler d1 migrations` |
| Resend / SMTP | **Cloudflare Email Service** (`send_email`) + **Email Routing** | transacional dentro da CF; newsletter em lotes |
| Mercado Pago | **PIX BR Code gerado no Worker** + conciliação no admin | checkout PIX; cartão sai do escopo inicial |
| Melhor Envio / Correios | **tabela de frete por CEP/peso no D1** | cálculo próprio; etiqueta e rastreio manuais |
| Mercado Livre / Shopee | **removido** | venda apenas na loja própria |
| NF-e / SEFAZ | **recibo interno em PDF** (`pdf-lib` no Worker) + R2 | documento não fiscal; NF-e fica fora até nova decisão |
| PostHog | **Cloudflare Web Analytics** + **Analytics Engine** | eventos de funil gravados no D1/Analytics Engine |
| Sentry | **Workers Logs** + **Logpush → R2** + **Tail Workers** | erros e traces nativos |
| WhatsApp (`whatsapp-web.js`) | **Cloudflare Containers** com sessão no R2 | bridge dentro da CF; a rede do WhatsApp é da Meta |
| Scraping / automação | **fetch + HTMLRewriter** + **Browser Rendering** | coleta de ofertas dentro da CF |
| Docker / Caddy / VPS | **Workers + Workers Builds + Access** | fim do compose e do proxy próprio |
| Imagens em disco | **Cloudflare Images** + **R2** | upload direto, variantes e entrega |
| Busca | **D1 FTS5** (+ Vectorize/Workers AI se necessário) | busca de produto e oferta |
| Sessão/auth própria + Argon2 | **Better Auth** (D1 + KV) | magic link, TOTP, passkeys, rate limit |
| Backups | **D1 Time Travel** + `wrangler d1 export` → **R2** | cron diário e restore drill |
| CI/CD Railway/GitHub Actions | **Workers Builds** | deploy por push, ambientes staging/produção |

## Arquitetura alvo

```text
Cloudflare
├─ Workers
│  ├─ web        Next 16 + OpenNext (loja, ofertas, conteúdo, conta)
│  ├─ api        Hono (REST, webhooks, auth e admin SPA)
│  └─ jobs       Queues + Cron Triggers
├─ D1            commerce + deals + identity + content + ops
├─ R2            mídia, PDFs, backups, cache ISR
├─ Images        variantes de produto/oferta
├─ KV            sessão, flags, cache, rate limit
├─ Queues        e-mail, publicação, expiração, webhooks
├─ Durable Objects  carrinho, contadores, tag cache
├─ Email Service envio transacional + Email Routing
├─ Access        admin
├─ Turnstile     login, checkout, formulários
├─ WAF           rate limiting e bot
└─ Analytics     Web Analytics + Analytics Engine
```

O painel Vite é servido como static asset pelo Worker da API em `/`, mantendo a sessão na mesma origem. As filas e o cron rodam no Worker `jobs`, com handlers `queue` e `scheduled`.

## Regras do D1

- Dinheiro sempre em **inteiro de centavos** (`price_cents`), nunca `REAL`.
- Sem `enum`: `text` + `CHECK`.
- Timestamps em **epoch ms** (`integer`), não `timestamptz`.
- IDs em `text` (`crypto.randomUUID()` ou ULID).
- Booleanos em `integer` 0/1.
- JSON em `text` com `{ mode: "json" }`.
- Transações apenas via `db.batch()`; estoque com `UPDATE ... WHERE stock >= ?` e verificação de `meta.changes`.
- Idempotência em webhooks e jobs: tabela de eventos com chave única.
- Limite de **10 GB por database**; eventos e cliques antigos arquivados em R2.
- Busca com **FTS5**; `LIKE` sempre com `lower()`.
- Páginas que leem D1 no Next não podem ser SSG de build: usar **ISR/SSR** com cache de tag.

## Consequências

- **Positivas:** uma conta, um bill, zero servidor, deploy atômico, escala global, custo base de US$ 5/mês.
- **Negativas:** D1 single-writer e 10 GB; sem transação interativa; Email Service em beta; sem adquirente de cartão nativo; WhatsApp exige Container.
- **Produto:** checkout PIX com conciliação manual; frete por tabela; recibo interno; sem marketplaces; newsletter de baixo volume.
