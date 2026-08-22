import { CanActivate, ExecutionContext, Injectable, SetMetadata, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PrismaService } from './prisma.service.js';
import { IS_PUBLIC, type AuthUser } from './current-user.js';
import { tokenHash } from './security.js';

const REQUIRED_PERMISSION = 'required-permission';
export const RequirePermission = (resource: string, action: string) => SetMetadata(REQUIRED_PERMISSION, `${resource}:${action}`);

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}
  async canActivate(context: ExecutionContext) {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [context.getHandler(), context.getClass()])) return true;
    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const token = request.cookies?.mimelie_session as string | undefined;
    if (!token) throw new UnauthorizedException('Sessão necessária.');
    const session = await this.prisma.session.findFirst({
      where: { tokenHash: tokenHash(token), revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: { include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } } } },
    });
    if (!session) throw new UnauthorizedException('Sessão expirada.');
    const permissions = session.user.roles.flatMap(({ role }) => role.permissions.map(({ permission }) => `${permission.resource}:${permission.action}`));
    request.user = { id: session.user.id, email: session.user.email, kind: session.user.kind, permissions };
    return true;
  }
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const required = this.reflector.getAllAndOverride<string>(REQUIRED_PERMISSION, [context.getHandler(), context.getClass()]);
    if (!required) return true;
    const user = context.switchToHttp().getRequest<{ user?: AuthUser }>().user;
    if (!user?.permissions.includes(required)) throw new ForbiddenException('Você não tem permissão para esta ação.');
    return true;
  }
}
