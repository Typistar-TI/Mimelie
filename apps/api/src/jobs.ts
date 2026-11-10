import { and, eq, lte } from "drizzle-orm";
import type {
  ExecutionContext,
  MessageBatch,
  ScheduledController,
} from "@cloudflare/workers-types";
import {
  newsletterSubscribers,
  offers,
  orders,
  publications,
  routineExecutions,
} from "@mimelie/db";
import type { Env, JobMessage } from "./env";
import { getDb } from "./lib/db";

function brl(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

async function sendEmail(
  env: Env,
  input: { to: string; subject: string; html: string; text?: string },
): Promise<void> {
  if (!env.EMAIL) {
    console.log(`[email:dev] to=${input.to} subject=${input.subject}`);
    return;
  }
  await env.EMAIL.send({
    to: input.to,
    from: env.EMAIL_FROM,
    subject: input.subject,
    html: input.html,
    text: input.text ?? input.html.replace(/<[^>]+>/g, " "),
  });
}

async function processJob(job: JobMessage, env: Env): Promise<void> {
  const db = getDb(env);
  switch (job.type) {
    case "magic-link": {
      await sendEmail(env, {
        to: job.email,
        subject: "Seu acesso à Mimelie",
        html: `<p>Olá!</p><p>Use o link abaixo para entrar na sua conta. Ele expira em 15 minutos.</p><p><a href="${job.url}">Entrar na Mimelie</a></p><p>Se você não pediu este acesso, ignore esta mensagem.</p>`,
        text: `Use este link para entrar na Mimelie (expira em 15 minutos): ${job.url}`,
      });
      break;
    }
    case "order.created": {
      const rows = await db
        .select()
        .from(orders)
        .where(eq(orders.id, job.orderId))
        .limit(1);
      const order = rows[0];
      if (order) {
        await sendEmail(env, {
          to: order.customerEmail,
          subject: `Pedido ${order.number} recebido`,
          html: `<p>Recebemos seu pedido <strong>${order.number}</strong> no valor de ${brl(order.totalCents)}.</p><p>Assim que o PIX for confirmado, avisamos você.</p>`,
        });
      }
      break;
    }
    case "order.paid": {
      const rows = await db
        .select()
        .from(orders)
        .where(eq(orders.id, job.orderId))
        .limit(1);
      const order = rows[0];
      if (order) {
        await sendEmail(env, {
          to: order.customerEmail,
          subject: `Pagamento confirmado — ${order.number}`,
          html: `<p>O pagamento do pedido <strong>${order.number}</strong> foi confirmado. Já estamos preparando tudo.</p>`,
        });
      }
      break;
    }
    case "newsletter.welcome": {
      const rows = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.id, job.subscriberId))
        .limit(1);
      const subscriber = rows[0];
      if (subscriber) {
        await sendEmail(env, {
          to: subscriber.email,
          subject: "Bem-vinda às cartas da Mimelie",
          html: "<p>Que bom ter você por aqui. Em breve chegam novidades, guias e a próxima fornada.</p>",
        });
        await db
          .update(newsletterSubscribers)
          .set({
            status: "CONFIRMED",
            confirmedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(newsletterSubscribers.id, subscriber.id));
      }
      break;
    }
    case "offer.expire": {
      await db
        .update(offers)
        .set({ status: "EXPIRED", updatedAt: new Date() })
        .where(eq(offers.id, job.offerId));
      break;
    }
    case "routine.run": {
      await db
        .update(routineExecutions)
        .set({
          status: "SUCCEEDED",
          startedAt: new Date(),
          finishedAt: new Date(),
        })
        .where(eq(routineExecutions.id, job.executionId));
      break;
    }
    case "publication.send": {
      const rows = await db
        .select()
        .from(publications)
        .where(eq(publications.id, job.publicationId))
        .limit(1);
      const publication = rows[0];
      if (publication) {
        await db
          .update(publications)
          .set({
            status: "SENT",
            sentAt: new Date(),
            attempts: publication.attempts + 1,
            updatedAt: new Date(),
          })
          .where(eq(publications.id, publication.id));
      }
      break;
    }
    default:
      console.log("unknown job", job);
  }
}

export async function handleQueue(
  batch: MessageBatch<unknown>,
  env: Env,
): Promise<void> {
  for (const message of batch.messages) {
    try {
      await processJob(message.body as JobMessage, env);
      message.ack();
    } catch (error) {
      console.error("job failed", message.body, error);
      message.retry();
    }
  }
}

export async function handleScheduled(
  _event: ScheduledController,
  env: Env,
  ctx: ExecutionContext,
): Promise<void> {
  ctx.waitUntil(
    (async () => {
      const db = getDb(env);
      await db
        .update(offers)
        .set({ status: "EXPIRED", updatedAt: new Date() })
        .where(
          and(
            eq(offers.status, "PUBLISHED"),
            lte(offers.expiresAt, new Date()),
          ),
        );
    })(),
  );
}

export default {
  fetch: () =>
    new Response(JSON.stringify({ status: "ok", service: "mimelie-jobs" }), {
      headers: { "content-type": "application/json" },
    }),
  queue: handleQueue,
  scheduled: handleScheduled,
} satisfies ExportedHandler<Env>;
