import { validationResult } from 'express-validator';
import { Prisma } from '@prisma/client';
import { availableColorsFromVariants, normalizeColor } from '../constants/colors.js';
import { availableSizesFromVariants, normalizeSize } from '../constants/sizes.js';
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
    size: normalizeSize(v.size) || v.size,
    color: normalizeColor(v.color) || v.color,
    sku: v.sku,
    price: Number(v.price),
    stock: v.stock,
    image: v.image,
  };
}

function mapVariantCreate(v) {
  return {
    size: normalizeSize(v.size) || String(v.size || '').trim(),
    color: normalizeColor(v.color) || String(v.color || '').trim(),
    sku: String(v.sku || '').trim(),
    price: new Prisma.Decimal(v.price),
    stock: Number(v.stock),
    image: String(v.image || '').trim(),
  };
}

function clampDiscount(n) {
  const v = Number(n);
  if (Number.isNaN(v)) return 0;
  return Math.min(100, Math.max(0, Math.round(v)));
}

function applyDiscount(price, discountPercent) {
  const p = Number(price);
  const d = clampDiscount(discountPercent);
  if (!d) return p;
  return Math.round(p * (100 - d)) / 100;
}

function serializeProduct(p) {
  const discountPercent = clampDiscount(p.discountPercent ?? 0);
  const variants = (p.variants || []).map((v) => {
    const base = serializeVariant(v);
    return {
      ...base,
      salePrice: applyDiscount(base.price, discountPercent),
    };
  });
  const prices = variants.map((v) => v.price);
  const salePrices = variants.map((v) => v.salePrice);
  const availableSizes = availableSizesFromVariants(variants);
  const inStockSizes = availableSizes.filter((sz) =>
    variants.some((v) => normalizeSize(v.size) === sz && Number(v.stock) > 0)
  );
  const availableColors = availableColorsFromVariants(variants);
  const inStockColors = availableColors.filter((c) =>
    variants.some((v) => normalizeColor(v.color) === c && Number(v.stock) > 0)
  );

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    category: p.category,
    images: p.images,
    isActive: p.isActive,
    discountPercent,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    variants,
    /** Sizes configured by admin (from variants). */
    availableSizes,
    /** Subset of availableSizes that currently have stock. */
    inStockSizes,
    /** Colours configured by admin (from variants). */
    availableColors,
    /** Subset of availableColors that currently have stock. */
    inStockColors,
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null,
    minSalePrice: salePrices.length ? Math.min(...salePrices) : null,
    maxSalePrice: salePrices.length ? Math.max(...salePrices) : null,
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

  const sizeList = parseList(sizes).map(normalizeSize).filter(Boolean);
  const colorList = parseList(colors).map(normalizeColor).filter(Boolean);
  const min = minPrice !== undefined && minPrice !== '' ? Number(minPrice) : null;
  const max = maxPrice !== undefined && maxPrice !== '' ? Number(maxPrice) : null;

  const variantWhere = {};
  if (sizeList.length) {
    // Match normalized (uppercase) sizes; also accept legacy mixed-case rows.
    variantWhere.AND = variantWhere.AND || [];
    variantWhere.AND.push({
      OR: sizeList.map((sz) => ({
        size: { equals: sz, mode: 'insensitive' },
      })),
    });
  }
  if (colorList.length) {
    variantWhere.AND = variantWhere.AND || [];
    variantWhere.AND.push({
      OR: colorList.map((c) => ({
        color: { equals: c, mode: 'insensitive' },
      })),
    });
  }
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
      images: Array.isArray(body.images)
        ? body.images.map((u) => String(u || '').trim()).filter(Boolean)
        : [],
      isActive: body.isActive !== false,
      discountPercent: clampDiscount(body.discountPercent ?? 0),
      createdById: req.user?.id,
      variants: {
        create: body.variants.map(mapVariantCreate),
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
  if (Array.isArray(body.images)) data.images = body.images.map((u) => String(u || '').trim()).filter(Boolean);
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
  if (body.discountPercent !== undefined) data.discountPercent = clampDiscount(body.discountPercent);

  const product = await prisma.$transaction(async (tx) => {
    if (body.variants) {
      await tx.productVariant.deleteMany({ where: { productId: id } });
      await tx.productVariant.createMany({
        data: body.variants.map((v) => ({
          productId: id,
          ...mapVariantCreate(v),
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
