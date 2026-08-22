import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { authenticator } from 'otplib';
import { PrismaService } from '../common/prisma.service.js';
import { decryptSecret, encryptSecret, hashIp, randomToken, tokenHash } from '../common/security.js';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async requestMagicLink(email: string) {
    const normalized = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email: normalized } });
    const token = randomToken();
    await this.prisma.magicLink.create({ data: { email: normalized, userId: user?.id, tokenHash: tokenHash(token), expiresAt: new Date(Date.now() + 15 * 60_000) } });
    const url = `${process.env.WEB_ORIGIN ?? 'http://localhost:3000'}/entrar?token=${encodeURIComponent(token)}`;
    // O adapter Resend substitui este retorno; nunca expor o link em produção.
    return process.env.NODE_ENV === 'production' ? { accepted: true } : { accepted: true, developmentUrl: url };
  }

  async consumeMagicLink(token: string, ip?: string, userAgent?: string, totp?: string, bootstrapToken?: string) {
    const link = await this.prisma.magicLink.findFirst({ where: { tokenHash: tokenHash(token), usedAt: null, expiresAt: { gt: new Date() } } });
    if (!link) throw new UnauthorizedException('Link inválido ou expirado.');
    const user = await this.prisma.user.upsert({ where: { email: link.email }, update: {}, create: { email: link.email } });
    if (user.kind === 'ADMIN') {
      if (!user.totpEnabled && bootstrapToken !== process.env.ADMIN_BOOTSTRAP_TOKEN) throw new ForbiddenException('Configure o segundo fator administrativo.');
      if (user.totpEnabled && (!totp || !user.totpSecret || !authenticator.verify({ token: totp, secret: decryptSecret(user.totpSecret) }))) throw new UnauthorizedException('Código de segundo fator inválido.');
    }
    const sessionToken = randomToken();
    await this.prisma.$transaction([
      this.prisma.magicLink.update({ where: { id: link.id }, data: { usedAt: new Date(), userId: user.id } }),
      this.prisma.session.create({ data: { tokenHash: tokenHash(sessionToken), userId: user.id, ipHash: hashIp(ip), userAgent: userAgent?.slice(0, 300), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60_000) } }),
    ]);
    return { token: sessionToken, user: { id: user.id, email: user.email, kind: user.kind, requiresTotpEnrollment: user.kind === 'ADMIN' && !user.totpEnabled } };
  }

  async startTotp(userId: string, email: string) {
    const secret = authenticator.generateSecret();
    await this.prisma.user.update({ where: { id: userId }, data: { totpSecret: encryptSecret(secret), totpEnabled: false } });
    return { secret, uri: authenticator.keyuri(email, 'Mimelie', secret) };
  }

  async confirmTotp(userId: string, token: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!user.totpSecret || !authenticator.verify({ token, secret: decryptSecret(user.totpSecret) })) throw new UnauthorizedException('Código inválido.');
    await this.prisma.user.update({ where: { id: userId }, data: { totpEnabled: true } });
    return { enabled: true };
  }

  async revoke(sessionToken?: string) {
    if (sessionToken) await this.prisma.session.updateMany({ where: { tokenHash: tokenHash(sessionToken), revokedAt: null }, data: { revokedAt: new Date() } });
  }
}
