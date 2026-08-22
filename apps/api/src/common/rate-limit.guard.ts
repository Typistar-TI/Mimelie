import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable, SetMetadata, ServiceUnavailableException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { Redis } from 'ioredis';
import { REDIS } from './common.module.js';
import { hashIp } from './security.js';

const RATE_LIMIT = 'sensitive-rate-limit';
export const SensitiveRateLimit = (limit: number, seconds: number) => SetMetadata(RATE_LIMIT, { limit, seconds });

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private reflector: Reflector, @Inject(REDIS) private redis: Redis) {}
  async canActivate(context: ExecutionContext) {
    const rule = this.reflector.getAllAndOverride<{ limit: number; seconds: number }>(RATE_LIMIT, [context.getHandler(), context.getClass()]);
    if (!rule) return true;
    const request = context.switchToHttp().getRequest<Request>();
    const key = `rate:${request.route?.path ?? request.path}:${hashIp(request.ip) ?? 'unknown'}`;
    try {
      if (this.redis.status === 'wait') await this.redis.connect();
      const count = await this.redis.incr(key);
      if (count === 1) await this.redis.expire(key, rule.seconds);
      if (count > rule.limit) throw new HttpException('Muitas tentativas. Aguarde antes de tentar novamente.', HttpStatus.TOO_MANY_REQUESTS);
      return true;
    } catch (error) {
      if (error instanceof HttpException && error.getStatus() === HttpStatus.TOO_MANY_REQUESTS) throw error;
      throw new ServiceUnavailableException('Proteção temporariamente indisponível.');
    }
  }
}
