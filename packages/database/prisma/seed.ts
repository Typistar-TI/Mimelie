import { PrismaClient, ProductStatus, UserKind } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const permissions = [
    ['catalog', 'manage'], ['inventory', 'manage'], ['orders', 'manage'], ['customers', 'read'],
    ['content', 'manage'], ['campaigns', 'manage'], ['finance', 'read'], ['integrations', 'manage'],
    ['users', 'manage'], ['audit', 'read'],
  ] as const;
  const role = await prisma.role.upsert({ where: { name: 'Administrador' }, update: {}, create: { name: 'Administrador', description: 'Acesso operacional completo' } });
  for (const [resource, action] of permissions) {
    const permission = await prisma.permission.upsert({ where: { resource_action_scope: { resource, action, scope: 'all' } }, update: {}, create: { resource, action } });
    await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } }, update: {}, create: { roleId: role.id, permissionId: permission.id } });
  }
  const admin = await prisma.user.upsert({ where: { email: 'admin@example.com' }, update: {}, create: { email: 'admin@example.com', name: 'Administradora', kind: UserKind.ADMIN } });
  await prisma.userRole.upsert({ where: { userId_roleId: { userId: admin.id, roleId: role.id } }, update: {}, create: { userId: admin.id, roleId: role.id } });

  const maker = await prisma.manufacturer.upsert({ where: { id: 'demo-manufacturer' }, update: {}, create: { id: 'demo-manufacturer', legalName: 'Fabricante demonstrativo', regulatoryOwner: 'Definir antes da publicação' } });
  await prisma.product.upsert({
    where: { slug: 'curva-de-caramelo' },
    update: {},
    create: {
      slug: 'curva-de-caramelo', name: 'Curva de Caramelo', shortDescription: 'Cílios leves, macios e desenhados para acompanhar o seu olhar.',
      description: { type: 'doc', content: [{ type: 'paragraph', text: 'Uma curva delicada para todos os dias.' }] },
      category: 'Cílios', status: ProductStatus.ACTIVE, publishedAt: new Date(), manufacturerId: maker.id,
      variants: { create: [{ sku: 'CIL-CURVA-01', name: 'Natural', attributes: { style: 'natural' }, price: 4990, cost: 1700, safetyStock: 1, weightGrams: 20, widthCm: 10, heightCm: 2, lengthCm: 6, batches: { create: [{ lot: 'DEMO-001', expiresAt: new Date('2028-12-31'), quantity: 25, available: 25 }] } }] },
    },
  });
  await prisma.contentPost.upsert({ where: { slug: 'como-escolher-cilios' }, update: {}, create: { slug: 'como-escolher-cilios', title: 'Como escolher cílios para o seu olhar', excerpt: 'Um guia curto para encontrar volume, curva e conforto.', content: { type: 'doc', content: [{ type: 'paragraph', text: 'Comece pelo efeito que você deseja e respeite o formato natural dos seus olhos.' }] }, status: 'PUBLISHED', publishedAt: new Date() } });
}

main().finally(() => prisma.$disconnect());
