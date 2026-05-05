import { Prisma } from '@prisma/client';

/**
 * Maps Prisma / generic errors to JSON responses.
 */
export function errorHandler(err, req, res, _next) {
  const status = err.statusCode || err.status || 500;

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = err.meta?.target;
      res.status(400).json({ message: 'Duplicate value', field: target });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ message: 'Record not found' });
      return;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({ message: 'Invalid data' });
    return;
  }

  const message = err.message || 'Server error';
  res.status(status).json({ message });
}
