import { prisma } from '@mimelie/database';
import { publishableStock } from '@mimelie/domain';
import { createHash, randomBytes, createCipheriv } from 'node:crypto';
import { HttpChannelConnector } from './base.js';

abstract class MarketplaceConnector extends HttpChannelConnector {
  abstract readonly channel: 'MERCADO_LIVRE' | 'SHOPEE';
  abstract readonly apiBase: string;
  protected abstract headers(): Record<string, string>;
  async publishProduct(productId: string) {
    this.assertEnabled();
    const product = await prisma.product.findUniqueOrThrow({ where: { id: productId }, include: { variants: true } });
    // O payload definitivo será validado nas contas sandbox de cada parceiro.
    const result = await this.request<{ id: string }>(`${this.apiBase}/products`, { method: 'POST', headers: { 'content-type': 'application/json', ...this.headers() }, body: JSON.stringify(product) });
    await prisma.channelListing.upsert({ where: { productId_channel: { productId, channel: this.channel } }, update: { externalId: result.id, status: 'ACTIVE', lastSyncAt: new Date() }, create: { productId, channel: this.channel, externalId: result.id, status: 'ACTIVE', lastSyncAt: new Date() } });
    return { externalId: result.id };
  }
  async updateStock(variantId: string, _quantity: number) {
    this.assertEnabled();
    const variant = await prisma.variant.findUniqueOrThrow({ where: { id: variantId }, include: { batches: true, channelVariants: { where: { listing: { channel: this.channel } } } } });
    const quantity = publishableStock({ onHand: variant.batches.reduce((sum, item) => sum + item.available, 0), reserved: 0, safetyStock: variant.safetyStock });
    for (const mapping of variant.channelVariants) await this.request(`${this.apiBase}/variants/${mapping.externalId}/stock`, { method: 'PUT', headers: { 'content-type': 'application/json', ...this.headers() }, body: JSON.stringify({ quantity }) });
  }
  async updatePrice(variantId: string, amount: number) {
    this.assertEnabled();
    const mappings = await prisma.channelVariant.findMany({ where: { variantId, listing: { channel: this.channel } } });
    for (const mapping of mappings) await this.request(`${this.apiBase}/variants/${mapping.externalId}/price`, { method: 'PUT', headers: { 'content-type': 'application/json', ...this.headers() }, body: JSON.stringify({ amount: amount / 100, currency: 'BRL' }) });
  }
  async importOrder(externalOrderId: string) {
    this.assertEnabled();
    const exists = await prisma.order.findUnique({ where: { channel_externalId: { channel: this.channel, externalId: externalOrderId } } });
    if (exists) return { orderId: exists.id };
    const external = await this.request<{ buyer: { email?: string; nickname?: string }; total_amount: number; items: Array<{ sku: string; title: string; quantity: number; unit_price: number }> }>(`${this.apiBase}/orders/${externalOrderId}`, { headers: this.headers() });
    const accessToken = randomBytes(32).toString('base64url');
    const order = await prisma.order.create({ data: { number: `${this.channel === 'MERCADO_LIVRE' ? 'ML' : 'SHP'}-${externalOrderId}`, channel: this.channel, externalId: externalOrderId, accessTokenHash: createHash('sha256').update(accessToken).digest('hex'), accessTokenCiphertext: encrypt(accessToken), customerEmail: external.buyer.email ?? 'marketplace@privacy.invalid', customerName: external.buyer.nickname ?? 'Cliente do marketplace', status: 'PAID', subtotal: Math.round(external.total_amount * 100), total: Math.round(external.total_amount * 100), shippingAddress: {}, items: { create: external.items.map((item) => ({ sku: item.sku, name: item.title, quantity: item.quantity, unitPrice: Math.round(item.unit_price * 100), total: Math.round(item.unit_price * 100) * item.quantity })) } } });
    return { orderId: order.id };
  }
  async reconcile() {
    this.assertEnabled();
    const mappings = await prisma.channelVariant.findMany({ where: { listing: { channel: this.channel } }, include: { variant: { include: { batches: true } } } });
    let repaired = 0;
    for (const mapping of mappings) {
      const expected = publishableStock({ onHand: mapping.variant.batches.reduce((sum, item) => sum + item.available, 0), reserved: 0, safetyStock: mapping.variant.safetyStock });
      if (mapping.lastStock !== expected) { await this.updateStock(mapping.variantId, expected); await prisma.channelVariant.update({ where: { id: mapping.id }, data: { lastStock: expected } }); repaired++; }
    }
    return { checked: mappings.length, repaired };
  }
}

function encrypt(value: string) {
  const key = createHash('sha256').update(process.env.TOKEN_ENCRYPTION_KEY ?? process.env.SESSION_SECRET ?? 'development-only').digest();
  const iv = randomBytes(12); const cipher = createCipheriv('aes-256-gcm', key, iv); const encrypted = Buffer.concat([cipher.update(value), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64url')).join('.');
}

export class MercadoLivreConnector extends MarketplaceConnector {
  readonly channel = 'MERCADO_LIVRE' as const; readonly apiBase = 'https://api.mercadolibre.com';
  protected headers() { return { authorization: `Bearer ${process.env.MERCADO_LIVRE_ACCESS_TOKEN ?? ''}` }; }
}
export class ShopeeConnector extends MarketplaceConnector {
  readonly channel = 'SHOPEE' as const; readonly apiBase = 'https://partner.shopeemobile.com/api/v2';
  protected headers() { return { authorization: process.env.SHOPEE_PARTNER_KEY ?? '' }; }
}
