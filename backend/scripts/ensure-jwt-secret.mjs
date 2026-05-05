/**
 * Appends JWT_SECRET to backend/.env if missing (dev convenience).
 * Does not modify DATABASE_URL or other variables.
 */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');

let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

if (/^\s*JWT_SECRET=/m.test(content)) {
  console.log('JWT_SECRET already set in .env');
  process.exit(0);
}

const secret = crypto.randomBytes(32).toString('base64');
const line = `JWT_SECRET=${secret}\n`;
content = content.replace(/\s*$/, '') + (content ? '\n' : '') + line;
fs.writeFileSync(envPath, content);
console.log('JWT_SECRET was added to .env (keep this file private).');
