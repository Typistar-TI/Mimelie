import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { safeEqual } from './security.js';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method) || request.path.includes('/webhooks/')) return true;
    const cookie = request.cookies?.csrf_token as string | undefined;
    const header = request.headers['x-csrf-token'];
    if (!cookie || typeof header !== 'string' || !safeEqual(cookie, header)) throw new UnauthorizedException('Token CSRF inválido.');
    return true;
  }
}
