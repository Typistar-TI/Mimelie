import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service.js';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}
  list(search?: string) {
    return this.prisma.product.findMany({
      where: { status: 'ACTIVE', ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { category: { contains: search, mode: 'insensitive' } }] } : {}) },
      include: { variants: { where: { active: true }, include: { batches: { where: { available: { gt: 0 }, expiresAt: { gt: new Date() } } } } }, images: { orderBy: { position: 'asc' } } },
      orderBy: { publishedAt: 'desc' },
    });
  }
  async bySlug(slug: string) {
    const product = await this.prisma.product.findFirst({ where: { slug, status: 'ACTIVE' }, include: { variants: { where: { active: true }, include: { batches: true } }, images: { orderBy: { position: 'asc' } }, manufacturer: true } });
    if (!product) throw new NotFoundException('Produto não encontrado.');
    return product;
  }
  posts() { return this.prisma.contentPost.findMany({ where: { status: 'PUBLISHED', publishedAt: { lte: new Date() } }, orderBy: { publishedAt: 'desc' } }); }
  async post(slug: string) {
    const post = await this.prisma.contentPost.findFirst({ where: { slug, status: 'PUBLISHED', publishedAt: { lte: new Date() } } });
    if (!post) throw new NotFoundException('Conteúdo não encontrado.'); return post;
  }
  adminOverview() {
    return Promise.all([
      this.prisma.product.count(), this.prisma.order.count({ where: { status: { in: ['PAID', 'INVOICED', 'READY_TO_SHIP'] } } }),
      this.prisma.user.count({ where: { kind: 'CUSTOMER' } }), this.prisma.webhookEvent.count({ where: { status: 'FAILED' } }),
    ]).then(([products, pendingOrders, customers, integrationFailures]) => ({ products, pendingOrders, customers, integrationFailures }));
  }
}
