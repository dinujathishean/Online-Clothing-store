import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function generateOrderNumber() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TLK-${t}-${r}`;
}

function serializeItem(row) {
  return {
    id: row.id,
    productId: row.productId,
    variantId: row.variantId,
    productName: row.productName,
    sku: row.sku,
    size: row.size,
    color: row.color,
    quantity: row.quantity,
    unitPrice: Number(row.unitPrice),
  };
}

function serializeOrder(o) {
  return {
    id: o.id,
    _id: String(o.id),
    orderNumber: o.orderNumber,
    status: o.status,
    total: Number(o.total),
    shippingFee: Number(o.shippingFee),
    shippingAddress: {
      line1: o.line1,
      city: o.city,
      postalCode: o.postalCode,
      country: o.country,
    },
    items: (o.items || []).map(serializeItem),
    createdAt: o.createdAt,
  };
}

/** Admin list row — includes customer + line count */
function serializeOrderAdminList(o) {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    total: Number(o.total),
    createdAt: o.createdAt,
    customer: o.user ? { id: o.user.id, name: o.user.name, email: o.user.email } : null,
    itemCount: o._count?.items ?? (o.items?.length ?? 0),
  };
}

/** Admin detail — full order + customer */
function serializeOrderAdminDetail(o) {
  const base = serializeOrder(o);
  return {
    ...base,
    customer: o.user ? { id: o.user.id, name: o.user.name, email: o.user.email } : null,
  };
}

/**
 * POST /api/orders/checkout
 * Body: { shippingAddress: { line1, city, postalCode, country }, shippingFee?, items: [{ productId, variantId, quantity }] }
 */
export const checkout = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { shippingAddress, shippingFee = 0, items } = req.body;

  if (!shippingAddress || typeof shippingAddress !== 'object') {
    res.status(400).json({ message: 'shippingAddress is required' });
    return;
  }

  const { line1, city, postalCode, country } = shippingAddress;
  if (!line1?.trim() || !city?.trim() || !postalCode?.trim() || !country?.trim()) {
    res.status(400).json({ message: 'Complete shipping address is required' });
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ message: 'Cart is empty — add items before checkout' });
    return;
  }

  const fee = new Prisma.Decimal(Number(shippingFee) || 0);

  const normalized = items.map((raw) => ({
    productId: Number(raw.productId),
    variantId: Number(raw.variantId),
    quantity: Math.max(1, Math.floor(Number(raw.quantity) || 0)),
  }));

  for (const row of normalized) {
    if (!Number.isInteger(row.productId) || !Number.isInteger(row.variantId) || row.quantity < 1) {
      res.status(400).json({ message: 'Invalid cart line' });
      return;
    }
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      let subtotal = new Prisma.Decimal(0);

      const lines = [];
      for (const row of normalized) {
        const variant = await tx.productVariant.findFirst({
          where: {
            id: row.variantId,
            productId: row.productId,
            product: { isActive: true },
          },
          include: { product: true },
        });

        if (!variant) {
          throw Object.assign(new Error('Product or variant is no longer available'), { status: 400 });
        }

        if (variant.stock < row.quantity) {
          throw Object.assign(new Error(`Insufficient stock for ${variant.product.name} (${variant.size} / ${variant.color})`), {
            status: 400,
          });
        }

        const unitPrice = (() => {
          const list = Number(variant.price);
          const pct = Math.min(100, Math.max(0, Number(variant.product.discountPercent) || 0));
          const sale = pct ? Math.round(list * (100 - pct)) / 100 : list;
          return new Prisma.Decimal(sale);
        })();
        subtotal = subtotal.add(unitPrice.mul(row.quantity));

        lines.push({
          productId: row.productId,
          variantId: row.variantId,
          productName: variant.product.name,
          sku: variant.sku || '',
          size: variant.size,
          color: variant.color,
          quantity: row.quantity,
          unitPrice,
        });
      }

      const total = subtotal.add(fee);

      const updated = await Promise.all(
        normalized.map((row) =>
          tx.productVariant.updateMany({
            where: { id: row.variantId, stock: { gte: row.quantity } },
            data: { stock: { decrement: row.quantity } },
          })
        )
      );

      if (updated.some((u) => u.count !== 1)) {
        throw Object.assign(new Error('Stock changed — refresh your cart and try again'), { status: 409 });
      }

      const created = await tx.order.create({
        data: {
          userId,
          orderNumber: generateOrderNumber(),
          status: 'pending',
          line1: line1.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
          shippingFee: fee,
          total,
          items: {
            create: lines.map((l) => ({
              productId: l.productId,
              variantId: l.variantId,
              productName: l.productName,
              sku: l.sku,
              size: l.size,
              color: l.color,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
            })),
          },
        },
        include: { items: true },
      });

      return created;
    });

    res.status(201).json({ order: serializeOrder(order) });
  } catch (e) {
    const status = e.status;
    if (status === 400 || status === 409) {
      res.status(status).json({ message: e.message });
      return;
    }
    throw e;
  }
});

export const listMyOrders = asyncHandler(async (req, res) => {
  const rows = await prisma.order.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
    take: 50,
  });

  res.json({ orders: rows.map(serializeOrder) });
});

export const getMyOrder = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: 'Invalid order id' });
    return;
  }

  const order = await prisma.order.findFirst({
    where: { id, userId: req.user.id },
    include: { items: true },
  });

  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }

  res.json({ order: serializeOrder(order) });
});

const ADMIN_ORDER_STATUSES = ['pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled'];

/** GET /api/admin/orders */
export const listAdminOrders = asyncHandler(async (req, res) => {
  const lim = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 100));
  const rows = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: lim,
    include: {
      user: { select: { id: true, name: true, email: true } },
      _count: { select: { items: true } },
    },
  });

  res.json({ orders: rows.map(serializeOrderAdminList) });
});

/** GET /api/admin/orders/:id */
export const getAdminOrder = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: 'Invalid order id' });
    return;
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }

  res.json({ order: serializeOrderAdminDetail(order) });
});

/** PATCH /api/admin/orders/:id — body: { status } */
export const patchAdminOrderStatus = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: 'Invalid order id' });
    return;
  }

  const status = String(req.body.status || '')
    .trim()
    .toLowerCase();
  if (!ADMIN_ORDER_STATUSES.includes(status)) {
    res.status(400).json({ message: `Invalid status (allowed: ${ADMIN_ORDER_STATUSES.join(', ')})` });
    return;
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
    res.json({ order: serializeOrderAdminDetail(order) });
  } catch {
    res.status(404).json({ message: 'Order not found' });
  }
});
