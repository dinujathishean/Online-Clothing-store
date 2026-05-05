import { verifyToken } from '../utils/token.js';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Requires `Authorization: Bearer <JWT>`. Attaches user (no password) on `req.user`.
 */
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Not authorized, token missing' });
    return;
  }

  const token = header.slice(7);
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    res.status(401).json({ message: 'Not authorized, invalid token' });
    return;
  }

  const id = Number(decoded.id ?? decoded.sub);
  if (!Number.isInteger(id)) {
    res.status(401).json({ message: 'Not authorized, invalid token' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    res.status(401).json({ message: 'User not found' });
    return;
  }

  req.user = user;
  next();
});
