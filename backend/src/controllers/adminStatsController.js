import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const LOW = Number(process.env.LOW_STOCK_THRESHOLD) || 10;

/** Lightweight stats for admin home. */
export const adminSummary = asyncHandler(async (req, res) => {
  const [totalProducts, activeProducts, lowStockVariants, totalOrders, pendingOrders] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.productVariant.count({ where: { stock: { lte: LOW } } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'pending' } }),
  ]);

  res.json({
    totalProducts,
    activeProducts,
    lowStockVariants,
    lowStockThreshold: LOW,
    totalOrders,
    pendingOrders,
  });
});
