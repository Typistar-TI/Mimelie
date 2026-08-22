import { prisma } from '@mimelie/database';

export async function createMercadoPagoPayment(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { payments: true } });
  const payment = order.payments[0]; if (!payment) throw new Error('PAYMENT_NOT_FOUND');
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) throw new Error('MERCADO_PAGO_DISABLED');
  const response = await fetch('https://api.mercadopago.com/v1/orders', { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', 'x-idempotency-key': payment.idempotencyKey }, body: JSON.stringify({ type: 'online', external_reference: order.id, total_amount: (order.total / 100).toFixed(2), currency: 'BRL' }), signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`MERCADO_PAGO_${response.status}`);
  const result = await response.json() as { id: string };
  await prisma.payment.update({ where: { id: payment.id }, data: { externalId: result.id, payload: result } });
}

export async function buyMelhorEnvioLabel(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { fiscalDocument: true, shipment: true } });
  if (!order.fiscalDocument || order.fiscalDocument.status !== 'AUTHORIZED') throw new Error('INVOICE_REQUIRED');
  if (!process.env.MELHOR_ENVIO_ACCESS_TOKEN) throw new Error('MELHOR_ENVIO_DISABLED');
  // Compra de etiqueta exige dados cadastrais reais; o adapter bloqueia antes de qualquer chamada sem eles.
  await prisma.shipment.update({ where: { orderId }, data: { status: 'READY_TO_BUY' } });
}
