import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { availableStock, calculateDiscount, canTransitionOrder, publishableStock, reserveStock } from './index.js';

describe('inventory', () => {
  it('preserves safety stock on every channel', () => assert.equal(publishableStock({ onHand: 10, reserved: 2, safetyStock: 1 }), 7));
  it('never publishes a negative quantity', () => assert.equal(publishableStock({ onHand: 1, reserved: 1 }), 0));
  it('rejects reservations above available stock', () => assert.throws(() => reserveStock({ onHand: 2, reserved: 1 }, 2), /INSUFFICIENT_STOCK/));
  it('reserves atomically represented units', () => assert.equal(availableStock(reserveStock({ onHand: 3, reserved: 0 }, 2)), 1));
});

describe('orders and discounts', () => {
  it('allows invoicing only after payment', () => { assert.equal(canTransitionOrder('PAID', 'INVOICED'), true); assert.equal(canTransitionOrder('PENDING_PAYMENT', 'INVOICED'), false); });
  it('caps discounts at the subtotal', () => assert.equal(calculateDiscount(1000, 'FIXED', 1200), 1000));
});
