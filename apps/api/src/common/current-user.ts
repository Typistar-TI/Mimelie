import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
export const IS_PUBLIC = 'is-public';
export const Public = () => SetMetadata(IS_PUBLIC, true);
export type AuthUser = { id: string; email: string; kind: 'CUSTOMER' | 'ADMIN'; permissions: string[] };
export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => context.switchToHttp().getRequest<{ user?: AuthUser }>().user);
