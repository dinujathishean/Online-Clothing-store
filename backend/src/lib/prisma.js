import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

/** Single PrismaClient instance (avoids exhausting connections in dev hot-reload). */
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
