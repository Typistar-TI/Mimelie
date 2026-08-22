import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { CheckoutInput } from '@mimelie/contracts';
import { Prisma, type OrderChannel } from '@mimelie/database';
import { PrismaService } from '../common/prisma.service.js';
import { decryptSecret, encryptSecret, randomToken, tokenHash } from '../common/security.js';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async checkout(input: CheckoutInput, idempotencyKey: string, userId?: string) {
    const previous = await this.prisma.payment.findUnique({ where: { idempotencyKey }, include: { order: true } });
    if (previous) return { order: previous.order, accessToken: decryptSecret(previous.order.accessTokenCiphertext) };
    return this.prisma.$transaction(async (tx) => {
      const variantIds = input.items.map((item) => item.variantId);
      const variants = await tx.variant.findMany({ where: { id: { in: variantIds }, active: true }, include: { product: true, batches: { where: { available: { gt: 0 }, expiresAt: { gt: new Date() } }, orderBy: { expiresAt: 'asc' } } } });
      if (variants.length !== new Set(variantIds).size) throw new ConflictException('Um produto não está mais disponível.');
      let subtotal = 0;
      const lines: Array<{ variant: (typeof variants)[number]; quantity: number; total: number }> = [];
      for (const requested of input.items) {
        const variant = variants.find((item) => item.id === requested.variantId)!;
        const available = variant.batches.reduce((sum, batch) => sum + batch.available, 0);
        if (available < requested.quantity) throw new ConflictException(`Estoque insuficiente para ${variant.product.name}.`);
        const total = variant.price * requested.quantity; subtotal += total; lines.push({ variant, quantity: requested.quantity, total });
      }
      const coupon = input.couponCode ? await tx.coupon.findFirst({ where: { code: input.couponCode.toUpperCase(), active: true, startsAt: { lte: new Date() }, endsAt: { gte: new Date() }, minimum: { lte: subtotal } } }) : null;
      const discount = coupon ? Math.min(subtotal, coupon.kind === 'PERCENT' ? Math.round(subtotal * Math.min(coupon.value, 100) / 100) : coupon.value) : 0;
      const shipping = 1590;
      const number = `WEB-${Date.now().toString(36).toUpperCase()}`;
      const accessToken = randomToken();
      const order = await tx.order.create({ data: {
        number, userId, accessTokenHash: tokenHash(accessToken), accessTokenCiphertext: encryptSecret(accessToken), customerEmail: input.email.toLowerCase(), customerName: input.name, customerPhone: input.phone,
        subtotal, discount, shipping, total: subtotal - discount + shipping, shippingAddress: input.shippingAddress,
        items: { create: lines.map(({ variant, quantity, total }) => ({ variantId: variant.id, sku: variant.sku, name: `${variant.product.name} — ${variant.name}`, quantity, unitPrice: variant.price, total })) },
        payments: { create: { provider: 'MERCADO_PAGO', idempotencyKey, amount: subtotal - discount + shipping } },
        shipment: { create: { provider: 'MELHOR_ENVIO', service: 'PENDING_SELECTION', quoteId: input.shippingQuoteId } },
      } });
      for (const line of lines) {
        let remaining = line.quantity;
        for (const batch of line.variant.batches) {
          if (!remaining) break;
          const take = Math.min(remaining, batch.available);
          const updated = await tx.inventoryBatch.updateMany({ where: { id: batch.id, available: { gte: take } }, data: { available: { decrement: take } } });
          if (!updated.count) throw new ConflictException('O estoque mudou durante a compra. Tente novamente.');
          remaining -= take;
        }
        await tx.inventoryReservation.create({ data: { variantId: line.variant.id, orderId: order.id, quantity: line.quantity, expiresAt: new Date(Date.now() + 20 * 60_000) } });
      }
      if (coupon) await tx.coupon.update({ where: { id: coupon.id }, data: { usageCount: { increment: 1 } } });
      await tx.consent.create({ data: { userId, email: input.email.toLowerCase(), type: 'privacy', version: input.consentVersion, granted: true } });
      await tx.outboxEvent.create({ data: { topic: 'payment.create', aggregateId: order.id, payload: { orderId: order.id } } });
      return { order, accessToken };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  async get(id: string, accessToken: string) {
    const order = await this.prisma.order.findFirst({ where: { id, accessTokenHash: tokenHash(accessToken) }, include: { items: true, payments: true, shipment: true, fiscalDocument: true } });
    if (!order) throw new NotFoundException('Pedido não encontrado.'); return order;
  }

  async importChannelOrder(channel: Exclude<OrderChannel, 'SITE'>, externalId: string, data: { email: string; name: string; total: number; items: Array<{ sku: string; name: string; quantity: number; unitPrice: number }> }) {
    const accessToken = randomToken();
    return this.prisma.order.upsert({ where: { channel_externalId: { channel, externalId } }, update: {}, create: {
      number: `${channel === 'MERCADO_LIVRE' ? 'ML' : 'SHP'}-${externalId}`, channel, externalId, accessTokenHash: tokenHash(accessToken), accessTokenCiphertext: encryptSecret(accessToken), customerEmail: data.email, customerName: data.name,
      status: 'PAID', subtotal: data.total, total: data.total, shippingAddress: {}, items: { create: data.items.map((item) => ({ ...item, total: item.quantity * item.unitPrice })) },
    } });
  }

  async attachInvoice(orderId: string, input: { accessKey: string; xmlKey?: string; issuedAt: Date }) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUniqueOrThrow({ where: { id: orderId } });
      if (order.status !== 'PAID') throw new ConflictException('A nota só pode ser anexada após o pagamento.');
      await tx.fiscalDocument.create({ data: { orderId, accessKey: input.accessKey, xmlKey: input.xmlKey, issuedAt: input.issuedAt, status: 'AUTHORIZED' } });
      await tx.order.update({ where: { id: orderId }, data: { status: 'INVOICED' } });
      await tx.outboxEvent.create({ data: { topic: 'shipment.buy-label', aggregateId: orderId, payload: { orderId } } });
      return { invoiced: true };
    });
  }
}
