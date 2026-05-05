import { verifyToken } from '../utils/token.js';
import { prisma } from '../lib/prisma.js';

/**
 * If a valid Bearer token is present, attaches `req.user` (light fields). Otherwise continues.
 */
export async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = header.slice(7);
  try {
    const decoded = verifyToken(token);
    const id = Number(decoded.id ?? decoded.sub);
    if (Number.isInteger(id)) {
      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, name: true, email: true, role: true },
      });
      if (user) req.user = user;
    }
  } catch {
    // ignore invalid token for public routes
  }
  next();
}
