import { Controller, Get, Module } from '@nestjs/common';
import { Public } from '../common/current-user.js';
import { PrismaService } from '../common/prisma.service.js';

@Controller('health')
class HealthController {
  constructor(private prisma: PrismaService) {}
  @Get() @Public() async get() { await this.prisma.$queryRaw`SELECT 1`; return { status: 'ok', time: new Date().toISOString() }; }
}
@Module({ controllers: [HealthController] })
export class HealthModule {}
