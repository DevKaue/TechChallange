import { PrismaService } from '@/prisma/prisma.service';

const TABLES_IN_ORDER = [
  'estimate_items',
  'estimates',
  'service_order_status_history',
  'service_orders',
  'vehicles',
  'customers',
  'parts',
  'service_catalog',
  'users',
];

export async function truncateAll(prisma: PrismaService): Promise<void> {
  for (const table of TABLES_IN_ORDER) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`,
    );
  }
}
