import { validationResult } from 'express-validator';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { toSlug } from '../utils/slug.js';

function parseList(param) {
  if (!param) return [];
  return String(param)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function serializeVariant(v) {
  return {
    id: v.id,
    size: v.size,
    color: v.color,
    sku: v.sku,
    price: Number(v.price),
    stock: v.stock,
    image: v.image,
  };
}

function serializeProduct(p) {
  const variants = (p.variants || []).map(serializeVariant);
  const prices = variants.map((v) => v.price);
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    category: p.category,
    images: p.images,
    isActive: p.isActive,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    variants,
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null,
  };
}

/**
 * Public catalog: search, category, size/color/price filters, pagination.
 */
export const listProducts = asyncHandler(async (req, res) => {
  const {
    q,
    category,
    sizes,
    colors,
    minPrice,
    maxPrice,
    page = '1',
    limit = '12',
    includeInactive,
  } = req.query;

  const isAdmin = req.user?.role === 'ADMIN';
  const showInactive = isAdmin && includeInactive === 'true';

  const clauses = [];

  if (!showInactive) {
    clauses.push({ isActive: true });
  }

  if (q) {
    const term = String(q).trim();
    clauses.push({
      OR: [
        { name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
      ],
    });
  }

  if (category) {
    clauses.push({ category: { equals: String(category), mode: 'insensitive' } });
  }

  const sizeList = parseList(sizes);
  const colorList = parseList(colors);
  const min = minPrice !== undefined && minPrice !== '' ? Number(minPrice) : null;
  const max = maxPrice !== undefined && maxPrice !== '' ? Number(maxPrice) : null;

  const variantWhere = {};
  if (sizeList.length) variantWhere.size = { in: sizeList };
  if (colorList.length) variantWhere.color = { in: colorList };
  if (min !== null && !Number.isNaN(min)) {
    variantWhere.price = { ...(variantWhere.price || {}), gte: new Prisma.Decimal(min) };
  }
  if (max !== null && !Number.isNaN(max)) {
    variantWhere.price = { ...(variantWhere.price || {}), lte: new Prisma.Decimal(max) };
  }
  if (Object.keys(variantWhere).length) {
    clauses.push({ variants: { some: variantWhere } });
  }

  const where = clauses.length === 0 ? {} : clauses.length === 1 ? clauses[0] : { AND: clauses };

  const p = Math.max(1, parseInt(page, 10) || 1);
  const lim = Math.min(48, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (p - 1) * lim;

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { variants: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: lim,
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    products: rows.map(serializeProduct),
    pagination: { page: p, limit: lim, total, pages: Math.ceil(total / lim) || 1 },
  });
});

export const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isNumeric = /^\d+$/.test(String(id));

  const product = await prisma.product.findFirst({
    where: isNumeric ? { id: Number(id) } : { slug: String(id) },
    include: { variants: true },
  });

  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  if (!product.isActive && (!req.user || req.user.role !== 'ADMIN')) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  res.json({ product: serializeProduct(product) });
});

export const createProduct = asyncHandler(async (req, res) => {
  if (String(req.user?.role || '').toUpperCase() !== 'ADMIN') {
    res.status(403).json({ message: 'Only admins can add products' });
    return;
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: 'Invalid input', errors: errors.array() });
    return;
  }

  const body = req.body;
  const slug = body.slug ? toSlug(body.slug) : toSlug(body.name);

  const product = await prisma.product.create({
    data: {
      name: body.name.trim(),
      slug,
      description: body.description ?? '',
      category: body.category.trim(),
      images: Array.isArray(body.images) ? body.images : [],
      isActive: body.isActive !== false,
      createdById: req.user?.id,
      variants: {
        create: body.variants.map((v) => ({
          size: v.size.trim(),
          color: v.color.trim(),
          sku: (v.sku || '').trim(),
          price: new Prisma.Decimal(v.price),
          stock: Number(v.stock),
          image: (v.image || '').trim(),
        })),
      },
    },
    include: { variants: true },
  });

  res.status(201).json({ product: serializeProduct(product) });
});

export const updateProduct = asyncHandler(async (req, res) => {
  if (String(req.user?.role || '').toUpperCase() !== 'ADMIN') {
    res.status(403).json({ message: 'Only admins can edit products' });
    return;
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: 'Invalid input', errors: errors.array() });
    return;
  }

  const id = Number(req.params.id);
  const body = req.body;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  const data = {};
  if (body.name) data.name = body.name.trim();
  if (body.slug) data.slug = toSlug(body.slug);
  else if (body.name) data.slug = toSlug(body.name);
  if (body.description !== undefined) data.description = body.description;
  if (body.category) data.category = body.category.trim();
  if (body.images) data.images = body.images;
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

  const product = await prisma.$transaction(async (tx) => {
    if (body.variants) {
      await tx.productVariant.deleteMany({ where: { productId: id } });
      await tx.productVariant.createMany({
        data: body.variants.map((v) => ({
          productId: id,
          size: v.size.trim(),
          color: v.color.trim(),
          sku: (v.sku || '').trim(),
          price: new Prisma.Decimal(v.price),
          stock: Number(v.stock),
          image: (v.image || '').trim(),
        })),
      });
    }
    if (Object.keys(data).length > 0) {
      return tx.product.update({
        where: { id },
        data,
        include: { variants: true },
      });
    }
    return tx.product.findUniqueOrThrow({ where: { id }, include: { variants: true } });
  });

  res.json({ product: serializeProduct(product) });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  if (String(req.user?.role || '').toUpperCase() !== 'ADMIN') {
    res.status(403).json({ message: 'Only admins can delete products' });
    return;
  }

  const id = Number(req.params.id);
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }
  await prisma.product.delete({ where: { id } });
  res.json({ message: 'Product deleted' });
});
