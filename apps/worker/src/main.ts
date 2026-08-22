import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { prisma } from '@mimelie/database';
import { MercadoLivreConnector, ShopeeConnector } from './connectors/marketplaces.js';
import { buyMelhorEnvioLabel, createMercadoPagoPayment } from './connectors/providers.js';

const connection = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', { maxRetriesPerRequest: null });
const queue = new Queue('commerce', { connection });
const mercadoLivre = new MercadoLivreConnector(process.env.ENABLE_MERCADO_LIVRE === 'true');
const shopee = new ShopeeConnector(process.env.ENABLE_SHOPEE === 'true');

async function dispatchOutbox() {
  const events = await prisma.outboxEvent.findMany({ where: { processedAt: null, availableAt: { lte: new Date() } }, take: 50, orderBy: { createdAt: 'asc' } });
  for (const event of events) {
    await queue.add(event.topic, event.payload as Record<string, unknown>, { jobId: event.id, attempts: 8, backoff: { type: 'exponential', delay: 2_000 }, removeOnComplete: 500, removeOnFail: 1_000 });
    await prisma.outboxEvent.update({ where: { id: event.id }, data: { processedAt: new Date() } });
  }
}

new Worker('commerce', async (job) => {
  const data = job.data as { orderId?: string; externalOrderId?: string; webhookEventId?: string };
  if (job.name === 'payment.create' && data.orderId) return createMercadoPagoPayment(data.orderId);
  if (job.name === 'shipment.buy-label' && data.orderId) return buyMelhorEnvioLabel(data.orderId);
  if (job.name === 'marketplace.reconcile.ml') return mercadoLivre.reconcile();
  if (job.name === 'marketplace.reconcile.shopee') return shopee.reconcile();
  if (job.name === 'marketplace.import.ml' && data.externalOrderId) return mercadoLivre.importOrder(data.externalOrderId);
  if (job.name === 'marketplace.import.shopee' && data.externalOrderId) return shopee.importOrder(data.externalOrderId);
  if (data.webhookEventId) await prisma.webhookEvent.update({ where: { id: data.webhookEventId }, data: { status: 'PROCESSED', processedAt: new Date() } });
}, { connection, concurrency: 10 });

await queue.upsertJobScheduler('reconcile-ml', { every: 10 * 60_000 }, { name: 'marketplace.reconcile.ml' });
await queue.upsertJobScheduler('reconcile-shopee', { every: 10 * 60_000 }, { name: 'marketplace.reconcile.shopee' });
setInterval(() => void dispatchOutbox(), 2_000).unref();
await dispatchOutbox();
console.log(JSON.stringify({ level: 'info', service: 'worker', message: 'Worker started' }));
