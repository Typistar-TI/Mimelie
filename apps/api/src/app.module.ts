import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module.js';
import { CatalogModule } from './catalog/catalog.module.js';
import { CommonModule } from './common/common.module.js';
import { CsrfGuard } from './common/csrf.guard.js';
import { RateLimitGuard } from './common/rate-limit.guard.js';
import { PermissionsGuard, SessionGuard } from './common/permissions.guard.js';
import { HealthModule } from './health/health.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { WebhooksModule } from './webhooks/webhooks.module.js';

@Module({
  imports: [CommonModule, HealthModule, AuthModule, CatalogModule, OrdersModule, WebhooksModule],
  providers: [
    { provide: APP_GUARD, useClass: CsrfGuard },
    { provide: APP_GUARD, useClass: RateLimitGuard },
    { provide: APP_GUARD, useClass: SessionGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
