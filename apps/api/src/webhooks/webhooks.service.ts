import { Injectable } from '@nestjs/common';
import { Prisma } from '@mimelie/database';
import { PrismaService } from '../common/prisma.service.js';

@Injectable()
export class WebhooksService {
  constructor(private prisma: PrismaService) {}
  async receive(provider: string, externalId: string, type: string, signatureOk: boolean, payload: Record<string, unknown>) {
    return this.prisma.$transaction(async (tx) => {
      const event = await tx.webhookEvent.upsert({
        where: { provider_externalId_type: { provider, externalId, type } }, update: {},
        create: { provider, externalId, type, signatureOk, payload: payload as Prisma.InputJsonValue, status: signatureOk ? 'RECEIVED' : 'IGNORED' },
      });
      if (signatureOk && event.status === 'RECEIVED') await tx.outboxEvent.create({ data: { topic: `webhook.${provider.toLowerCase()}`, aggregateId: event.id, payload: { webhookEventId: event.id } } });
      return { accepted: true };
    });
  }
}
