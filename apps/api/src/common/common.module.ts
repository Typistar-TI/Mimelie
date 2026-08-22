import { Global, Module } from '@nestjs/common';
import { Redis } from 'ioredis';
import { PrismaService } from './prisma.service.js';

export const REDIS = Symbol('REDIS');

@Global()
@Module({
  providers: [PrismaService, { provide: REDIS, useFactory: () => new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', { maxRetriesPerRequest: 1, lazyConnect: true }) }],
  exports: [PrismaService, REDIS],
})
export class CommonModule {}
