import 'dotenv/config';
import app from './app.js';
import { prisma } from './lib/prisma.js';

const PORT = Number(process.env.PORT) || 5000;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is missing. Add it to backend/.env (PostgreSQL connection string).');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Add it to backend/.env (long random string) or run: node scripts/ensure-jwt-secret.mjs');
  process.exit(1);
}

async function start() {
  try {
    await prisma.$connect();
    console.log('Prisma connected to PostgreSQL');
    app.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
