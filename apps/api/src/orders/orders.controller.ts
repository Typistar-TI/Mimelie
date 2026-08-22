import { BadRequestException, Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { checkoutSchema } from '@mimelie/contracts';
import { CurrentUser, Public, type AuthUser } from '../common/current-user.js';
import { RequirePermission } from '../common/permissions.guard.js';
import { SensitiveRateLimit } from '../common/rate-limit.guard.js';
import { OrdersService } from './orders.service.js';

@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}
  @Post('checkout') @Public() @SensitiveRateLimit(10, 300) checkout(@Body() body: unknown, @Headers('idempotency-key') key?: string, @CurrentUser() user?: AuthUser) {
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    if (!key || key.length < 12 || key.length > 128) throw new BadRequestException('Idempotency-Key inválida.');
    return this.orders.checkout(parsed.data, key, user?.id);
  }
  @Get(':id') @Public() get(@Param('id') id: string, @Headers('x-order-access-token') accessToken?: string) {
    if (!accessToken) throw new BadRequestException('Token de acesso ao pedido obrigatório.');
    return this.orders.get(id, accessToken);
  }
  @Post(':id/invoice') @RequirePermission('orders', 'manage') invoice(@Param('id') id: string, @Body() body: { accessKey?: string; xmlKey?: string; issuedAt?: string }) {
    if (!body.accessKey || !/^\d{44}$/.test(body.accessKey) || !body.issuedAt) throw new BadRequestException('Chave e data de emissão válidas são obrigatórias.');
    return this.orders.attachInvoice(id, { accessKey: body.accessKey, xmlKey: body.xmlKey, issuedAt: new Date(body.issuedAt) });
  }
}
