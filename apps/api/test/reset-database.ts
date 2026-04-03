import { PrismaClient } from 'src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config as loadEnv } from 'dotenv';

function createPrismaClient(): PrismaClient {
  loadEnv({
    path: '.env.test'
  });

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is required to run e2e database reset');
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export async function resetDatabase(): Promise<void> {
  const prisma = createPrismaClient();

  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> '_prisma_migrations'
  `;

  if (tables.length === 0) {
    return;
  }

  const tableNames = tables.map(({ tablename }) => `"public"."${tablename}"`).join(', ');

  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`);
  await prisma.$disconnect();
}
