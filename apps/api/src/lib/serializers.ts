import type {
  Offer,
  OfferCategory,
  Order,
  OrderItem,
  Payment,
  Product,
  Shipment,
  Store,
  User,
  Variant,
} from "@mimelie/db";

export const toReais = (cents: number) => Number((cents / 100).toFixed(2));

export function serializeProduct(
  product: Product,
  variants: Variant[],
  images: Array<{ key: string; alt: string }>,
) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    category: product.category,
    status: product.status,
    publishedAt: product.publishedAt,
    variants: variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      price: variant.priceCents,
      compareAt: variant.compareAtCents ?? null,
      sku: variant.sku,
      stock: variant.stock,
    })),
    images,
  };
}

export function serializeOffer(
  offer: Offer,
  store: Store,
  category: OfferCategory | null,
) {
  return {
    id: offer.id,
    slug: offer.slug,
    title: offer.title,
    description: offer.description,
    imageUrl: offer.imageUrl,
    currentPrice: toReais(offer.currentPriceCents),
    originalPrice:
      offer.originalPriceCents == null
        ? null
        : toReais(offer.originalPriceCents),
    discountPercent: offer.discountPercent,
    couponCode: offer.couponCode,
    affiliateUrl: offer.affiliateUrl,
    status: offer.status,
    verifiedAt: offer.verifiedAt,
    expiresAt: offer.expiresAt,
    publishedAt: offer.publishedAt,
    updatedAt: offer.updatedAt,
    store: {
      id: store.id,
      name: store.name,
      slug: store.slug,
      logoUrl: store.logoUrl,
    },
    category: category
      ? { name: category.name, slug: category.slug }
      : null,
  };
}

export function serializeOrder(
  order: Order,
  items: OrderItem[],
  payment: Payment | null,
  shipment: Shipment | null,
) {
  const payload = payment?.payload as
    | { pix?: { copyPaste: string; txid: string; amountCents: number } }
    | null
    | undefined;
  return {
    id: order.id,
    number: order.number,
    status: order.status,
    currency: order.currency,
    subtotal: order.subtotalCents,
    discount: order.discountCents,
    shipping: order.shippingCents,
    total: order.totalCents,
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    shippingAddress: order.shippingAddress,
    createdAt: order.createdAt,
    items: items.map((item) => ({
      id: item.id,
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPriceCents,
      total: item.totalCents,
    })),
    payment: payment
      ? {
          id: payment.id,
          method: payment.method,
          status: payment.status,
          amount: payment.amountCents,
          paidAt: payment.paidAt,
          pix: payload?.pix ?? null,
        }
      : null,
    shipment: shipment
      ? {
          status: shipment.status,
          service: shipment.service,
          trackingCode: shipment.trackingCode,
          shippedAt: shipment.shippedAt,
        }
      : null,
  };
}

export function serializeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role === "CUSTOMER" ? "VISITOR" : user.role,
    emailVerifiedAt: user.emailVerifiedAt,
    createdAt: user.createdAt,
  };
}
