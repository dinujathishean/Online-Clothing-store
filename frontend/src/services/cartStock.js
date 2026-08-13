import { fetchProduct } from './productService.js';
import * as cartStorage from './cartStorage.js';

/**
 * Re-fetch live variant stock for every cart line, clamp quantities,
 * and mark missing/unavailable variants as stock 0.
 * @returns {{ cart: { items: object[] }, adjusted: boolean, outOfStockCount: number }}
 */
export async function refreshCartStock() {
  const cart = cartStorage.getCart();
  const items = cart.items || [];
  if (!items.length) {
    return { cart, adjusted: false, outOfStockCount: 0 };
  }

  const productIds = [...new Set(items.map((it) => it.productId))];
  const stockByVariantId = {};

  await Promise.all(
    productIds.map(async (productId) => {
      try {
        const { product } = await fetchProduct(productId);
        for (const v of product?.variants || []) {
          stockByVariantId[String(v.id)] = Math.max(0, Number(v.stock) || 0);
        }
      } catch {
        // Product deleted / inactive — treat its lines as unavailable below.
      }
    })
  );

  for (const it of items) {
    const key = String(it.variantId);
    if (!(key in stockByVariantId)) stockByVariantId[key] = 0;
  }

  const next = cartStorage.applyStockLevels(stockByVariantId);
  const outOfStockCount = (next.items || []).filter((it) => (Number(it.snapshot?.stock) || 0) <= 0).length;
  const adjusted = JSON.stringify(next.items) !== JSON.stringify(items);

  return { cart: next, adjusted, outOfStockCount };
}
