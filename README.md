# Mimelie

Monorepo da loja própria, painel operacional, API e processamento assíncrono de uma marca brasileira de maquiagem.

## Aplicações

- `apps/web`: loja, PWA, conteúdo editorial e painel em Next.js.
- `apps/api`: API REST NestJS, autenticação, ABAC e webhooks.
- `apps/worker`: filas BullMQ e conectores externos.
- `packages/database`: schema Prisma e seed demonstrativo.
- `packages/domain`: regras puras de estoque, preço e pedidos.
- `packages/contracts`: contratos compartilhados da API.

## Desenvolvimento

1. Copie `.env.example` para `.env` e ajuste os segredos.
2. Suba PostgreSQL e Redis com `docker compose up -d`.
3. Execute `pnpm install`, `pnpm db:generate`, `pnpm db:migrate` e `pnpm db:seed`.
4. Execute `pnpm dev`.

A vitrine abre em `http://localhost:3000`, a API em `http://localhost:3001/v1` e a documentação em `/docs`.

Integrações externas ficam desativadas por feature flags até que as contas e credenciais de produção sejam aprovadas.

## O que já está implementado

- Vitrine responsiva em Tailwind CSS, PWA, catálogo, produto, sacola persistente, checkout e acompanhamento protegido por token.
- React Query com provider central, query keys por domínio, cache do catálogo e mutations de autenticação/checkout.
- SEO com SSG/ISR-ready, sitemap, robots, canonical e JSON-LD de organização, produto e artigo.
- API NestJS com Swagger, sessões opacas, magic link, TOTP administrativo, CSRF, CORS, Helmet, rate limit fail-closed e ABAC dinâmico.
- Prisma/PostgreSQL para catálogo regulatório, lotes, estoque, reservas, pedidos multicanal, pagamento, frete, NF-e, conteúdo, auditoria, consentimento, webhooks e outbox.
- Worker BullMQ com idempotência, retentativas e adapters isolados para Mercado Pago, Melhor Envio, Mercado Livre e Shopee.
- Deploy do web via OpenNext/Cloudflare e imagens Railway para API/worker.

## Gates antes de produção

- Substituir dados demonstrativos, nome, domínio e endereço de atendimento.
- Homologar os payloads dos quatro provedores nas contas sandbox/aprovadas; nenhuma flag de marketplace deve ser ligada antes disso.
- Configurar o Payment Brick com a chave pública do Mercado Pago e concluir o retorno visual de cada método.
- Configurar Resend, Meta WhatsApp, R2/Cloudflare Images, PostHog e Sentry.
- Validar CNPJ, políticas LGPD, responsável regulatório, cadastros de produtos, NF-e e embalagem com profissionais responsáveis.
- Executar o fluxo completo em staging, teste de carga do Worker e restauração de backup antes da publicação.

## Backups

`scripts/backup-postgres.sh` produz um dump custom do PostgreSQL e o envia para o bucket configurado por `BACKUP_BUCKET`. Agende-o fora do banco principal e faça um restore drill periódico.
