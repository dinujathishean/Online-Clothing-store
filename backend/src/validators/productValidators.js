import { body, param } from 'express-validator';

const sizeField = body('variants.*.size')
  .trim()
  .notEmpty()
  .isLength({ max: 16 })
  .withMessage('Size is required (e.g. S, M, L, XL)');

const colorField = body('variants.*.color')
  .trim()
  .notEmpty()
  .isLength({ max: 48 })
  .withMessage('Colour is required (e.g. Black, Navy)');

const variantRules = [
  body('variants').isArray({ min: 1 }),
  sizeField,
  colorField,
  body('variants.*.price').isFloat({ min: 0 }),
  body('variants.*.stock').isInt({ min: 0 }),
  body('variants.*.sku').optional().isString(),
  body('variants.*.image').optional().isString(),
];

export const createProductRules = [
  body('name').trim().notEmpty(),
  body('category').trim().notEmpty(),
  body('description').optional().isString(),
  body('slug').optional().trim().notEmpty(),
  body('images').optional().isArray(),
  body('isActive').optional().isBoolean(),
  body('discountPercent').optional().isInt({ min: 0, max: 100 }),
  ...variantRules,
];

export const updateProductRules = [
  param('id').isInt({ min: 1 }),
  body('name').optional().trim().notEmpty(),
  body('category').optional().trim().notEmpty(),
  body('description').optional().isString(),
  body('slug').optional().trim().notEmpty(),
  body('images').optional().isArray(),
  body('isActive').optional().isBoolean(),
  body('discountPercent').optional().isInt({ min: 0, max: 100 }),
  body('variants').optional().isArray({ min: 1 }),
  body('variants.*.size').optional().trim().notEmpty().isLength({ max: 16 }),
  body('variants.*.color').optional().trim().notEmpty().isLength({ max: 48 }),
  body('variants.*.price').optional().isFloat({ min: 0 }),
  body('variants.*.stock').optional().isInt({ min: 0 }),
];

export const productIdParam = [param('id').isInt({ min: 1 })];
