import { z } from 'zod';

export const moneySchema = z.object({ amount: z.number().int().nonnegative(), currency: z.literal('BRL') });
export type Money = z.infer<typeof moneySchema>;

export const addressSchema = z.object({
  recipient: z.string().min(2).max(120),
  postalCode: z.string().regex(/^\d{5}-?\d{3}$/),
  street: z.string().min(2).max(160),
  number: z.string().min(1).max(20),
  complement: z.string().max(80).optional(),
  district: z.string().min(2).max(80),
  city: z.string().min(2).max(80),
  state: z.string().length(2),
  country: z.literal('BR').default('BR'),
});

export const cartItemSchema = z.object({ variantId: z.string().cuid(), quantity: z.number().int().min(1).max(20) });
export const checkoutSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(120),
  phone: z.string().min(10).max(20),
  items: z.array(cartItemSchema).min(1).max(50),
  shippingAddress: addressSchema,
  shippingQuoteId: z.string().min(1),
  couponCode: z.string().max(40).optional(),
  consentVersion: z.string().min(1),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const magicLinkRequestSchema = z.object({ email: z.string().email().transform((value) => value.toLowerCase()) });
export const orderStatusSchema = z.enum(['PENDING_PAYMENT', 'PAID', 'INVOICED', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'CANCELED', 'REFUNDED']);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const webhookEnvelopeSchema = z.object({
  provider: z.enum(['MERCADO_PAGO', 'MELHOR_ENVIO', 'MERCADO_LIVRE', 'SHOPEE']),
  externalId: z.string().min(1),
  occurredAt: z.coerce.date(),
  payload: z.record(z.unknown()),
});

export type Channel = 'SITE' | 'MERCADO_LIVRE' | 'SHOPEE';
export type Resource = 'catalog' | 'inventory' | 'orders' | 'customers' | 'content' | 'campaigns' | 'finance' | 'integrations' | 'users' | 'audit';
export type Action = 'read' | 'create' | 'update' | 'delete' | 'publish' | 'refund' | 'manage';

export interface ChannelConnector {
  publishProduct(productId: string): Promise<{ externalId: string }>;
  updateStock(variantId: string, quantity: number): Promise<void>;
  updatePrice(variantId: string, amount: number): Promise<void>;
  importOrder(externalOrderId: string): Promise<{ orderId: string }>;
  reconcile(): Promise<{ checked: number; repaired: number }>;
}
