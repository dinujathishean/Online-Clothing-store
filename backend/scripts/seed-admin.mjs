/**
 * Seeds default admin user if missing (does not overwrite existing password).
 * Run: npm run db:seed   (from backend folder)
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@tshirtshop.com';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_NAME = 'Administrator';

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existing) {
    if (existing.role !== 'ADMIN') {
      await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: { role: 'ADMIN' },
      });
      console.log('Updated role to ADMIN for', ADMIN_EMAIL);
    } else {
      console.log('Admin already exists:', ADMIN_EMAIL);
    }
    return;
  }

  const password = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.user.create({
    data: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password,
      role: 'ADMIN',
    },
  });
  console.log('Created default admin user');
  console.log('  email:', ADMIN_EMAIL);
  console.log('  password:', ADMIN_PASSWORD);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
