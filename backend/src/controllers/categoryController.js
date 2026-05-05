import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Distinct category strings from active products (for storefront filters).
 * Shape matches older frontend: `_id`, `name`, `slug` — all use the same label string for filtering.
 */
export const listCategories = asyncHandler(async (req, res) => {
  const rows = await prisma.product.findMany({
    where: { isActive: true, NOT: { category: '' } },
    distinct: ['category'],
    select: { category: true },
    orderBy: { category: 'asc' },
  });

  const categories = rows.map((r) => ({
    _id: r.category,
    name: r.category,
    slug: r.category,
  }));

  res.json({ categories });
});
