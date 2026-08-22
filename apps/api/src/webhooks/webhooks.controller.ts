import { BadRequestException, Body, Controller, Headers, Param, Post } from '@nestjs/common';
import { createHmac } from 'node:crypto';
import { Public } from '../common/current-user.js';
import { safeEqual } from '../common/security.js';
import { WebhooksService } from './webhooks.service.js';

@Controller('webhooks') @Public()
export class WebhooksController {
  constructor(private webhooks: WebhooksService) {}
  @Post(':provider') receive(@Param('provider') provider: string, @Headers('x-signature') signature: string | undefined, @Body() payload: Record<string, unknown>) {
    const normalized = provider.toUpperCase().replaceAll('-', '_');
    if (!['MERCADO_PAGO', 'MELHOR_ENVIO', 'MERCADO_LIVRE', 'SHOPEE'].includes(normalized)) throw new BadRequestException('Provedor desconhecido.');
    const externalId = String(payload.id ?? payload.resource ?? payload.order_id ?? '');
    if (!externalId) throw new BadRequestException('Identificador ausente.');
    const secret = process.env[`${normalized}_WEBHOOK_SECRET`];
    const expected = secret ? createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex') : '';
    const signatureOk = process.env.NODE_ENV !== 'production' && !secret ? true : Boolean(signature && expected && safeEqual(signature, expected));
    return this.webhooks.receive(normalized, externalId, String(payload.type ?? payload.topic ?? 'unknown'), signatureOk, payload);
  }
}
