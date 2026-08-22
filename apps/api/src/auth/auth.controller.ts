import { BadRequestException, Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { Request, Response } from 'express';
import { magicLinkRequestSchema } from '@mimelie/contracts';
import { CurrentUser, Public, type AuthUser } from '../common/current-user.js';
import { SensitiveRateLimit } from '../common/rate-limit.guard.js';
import { AuthService } from './auth.service.js';

const cookieBase = { secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/' };
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Get('csrf') @Public() csrf(@Res({ passthrough: true }) response: Response) {
    const token = randomBytes(24).toString('base64url');
    response.cookie('csrf_token', token, { ...cookieBase, httpOnly: false, maxAge: 24 * 60 * 60_000 });
    return { csrfToken: token };
  }

  @Post('magic-link') @Public() @SensitiveRateLimit(5, 900) request(@Body() body: unknown) {
    const parsed = magicLinkRequestSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    return this.auth.requestMagicLink(parsed.data.email);
  }

  @Post('consume') @Public() @SensitiveRateLimit(10, 900) async consume(@Body() body: { token?: string; totp?: string; bootstrapToken?: string }, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    if (!body.token) throw new BadRequestException('Token obrigatório.');
    const result = await this.auth.consumeMagicLink(body.token, request.ip, request.headers['user-agent'], body.totp, body.bootstrapToken);
    response.cookie('mimelie_session', result.token, { ...cookieBase, httpOnly: true, maxAge: 30 * 24 * 60 * 60_000 });
    return result.user;
  }

  @Post('totp/start') startTotp(@CurrentUser() user: AuthUser) { return this.auth.startTotp(user.id, user.email); }
  @Post('totp/confirm') confirmTotp(@CurrentUser() user: AuthUser, @Body() body: { token?: string }) {
    if (!body.token) throw new BadRequestException('Código obrigatório.');
    return this.auth.confirmTotp(user.id, body.token);
  }
  @Post('logout') async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    await this.auth.revoke(request.cookies?.mimelie_session as string | undefined);
    response.clearCookie('mimelie_session', cookieBase); return { signedOut: true };
  }
}
