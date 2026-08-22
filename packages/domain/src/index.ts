export type StockPosition = { onHand: number; reserved: number; safetyStock?: number };

export function availableStock(position: StockPosition): number {
  return Math.max(0, position.onHand - position.reserved);
}

export function publishableStock(position: StockPosition): number {
  return Math.max(0, availableStock(position) - (position.safetyStock ?? 1));
}

export function reserveStock(position: StockPosition, quantity: number): StockPosition {
  if (!Number.isInteger(quantity) || quantity <= 0) throw new Error('INVALID_QUANTITY');
  if (availableStock(position) < quantity) throw new Error('INSUFFICIENT_STOCK');
  return { ...position, reserved: position.reserved + quantity };
}

export type OrderState = 'PENDING_PAYMENT' | 'PAID' | 'INVOICED' | 'READY_TO_SHIP' | 'SHIPPED' | 'DELIVERED' | 'CANCELED' | 'REFUNDED';
const transitions: Record<OrderState, readonly OrderState[]> = {
  PENDING_PAYMENT: ['PAID', 'CANCELED'],
  PAID: ['INVOICED', 'CANCELED', 'REFUNDED'],
  INVOICED: ['READY_TO_SHIP', 'CANCELED', 'REFUNDED'],
  READY_TO_SHIP: ['SHIPPED', 'CANCELED'],
  SHIPPED: ['DELIVERED', 'REFUNDED'],
  DELIVERED: ['REFUNDED'],
  CANCELED: [],
  REFUNDED: [],
};

export function canTransitionOrder(from: OrderState, to: OrderState): boolean {
  return transitions[from].includes(to);
}

export function calculateDiscount(subtotal: number, kind: 'PERCENT' | 'FIXED', value: number): number {
  if (subtotal < 0 || value < 0) throw new Error('INVALID_MONEY');
  const discount = kind === 'PERCENT' ? Math.round(subtotal * Math.min(value, 100) / 100) : value;
  return Math.min(subtotal, discount);
}
