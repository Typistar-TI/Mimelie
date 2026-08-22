import type { ChannelConnector } from '@mimelie/contracts';

export abstract class HttpChannelConnector implements ChannelConnector {
  constructor(protected readonly enabled: boolean) {}
  protected assertEnabled() { if (!this.enabled) throw new Error('CHANNEL_DISABLED'); }
  abstract publishProduct(productId: string): Promise<{ externalId: string }>;
  abstract updateStock(variantId: string, quantity: number): Promise<void>;
  abstract updatePrice(variantId: string, amount: number): Promise<void>;
  abstract importOrder(externalOrderId: string): Promise<{ orderId: string }>;
  abstract reconcile(): Promise<{ checked: number; repaired: number }>;
  protected async request<T>(url: string, init: RequestInit): Promise<T> {
    this.assertEnabled();
    const response = await fetch(url, { ...init, signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error(`PROVIDER_${response.status}`);
    return response.json() as Promise<T>;
  }
}
