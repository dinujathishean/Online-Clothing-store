/** @param {object} product – API product with variants, createdAt */
export function sumStock(product) {
  if (typeof product?.totalStock === 'number' && !Number.isNaN(product.totalStock)) {
    return Math.max(0, product.totalStock);
  }
  if (!product?.variants?.length) return 0;
  return product.variants.reduce((s, v) => s + (Number(v.stock) || 0), 0);
}

/** Product-level OOS: no variant has stock > 0. */
export function isProductOutOfStock(product) {
  if (!product) return true;
  if (typeof product.inStock === 'boolean') return !product.inStock;
  if (Array.isArray(product.inStockSizes) && Array.isArray(product.variants) && product.variants.length) {
    return product.inStockSizes.length === 0;
  }
  return sumStock(product) <= 0;
}

export function productImage(product, variant) {
  const vImg = variant?.image;
  if (vImg) return vImg;
  if (product?.images?.length) return product.images[0];
  return '';
}

/** Unique gallery URLs for detail page (variant override first, then product images). */
export function productGallery(product, variant) {
  const urls = [];
  const push = (u) => {
    const s = String(u || '').trim();
    if (s && !urls.includes(s)) urls.push(s);
  };
  push(variant?.image);
  for (const u of product?.images || []) push(u);
  return urls;
}

export function getDiscountPercent(product) {
  const n = Number(product?.discountPercent);
  if (Number.isNaN(n) || n <= 0) return 0;
  return Math.min(100, Math.round(n));
}

/** List price with product discount applied. */
export function salePrice(listPrice, productOrPercent) {
  const list = Number(listPrice);
  if (Number.isNaN(list)) return null;
  const pct =
    typeof productOrPercent === 'number'
      ? productOrPercent
      : getDiscountPercent(productOrPercent);
  if (!pct) return list;
  return Math.round(list * (100 - pct) * 100) / 100;
}

export function displayMinPrice(product) {
  if (typeof product?.minSalePrice === 'number') return product.minSalePrice;
  if (typeof product?.minPrice === 'number') return salePrice(product.minPrice, product);
  return null;
}

/** @returns {{ type: string, label: string }[]} */
export function getProductBadges(product) {
  const badges = [];
  if (!product) return badges;

  const oos = isProductOutOfStock(product);
  if (oos) {
    badges.push({ type: 'oos', label: 'Out of stock' });
  }

  const discount = getDiscountPercent(product);
  if (discount > 0) badges.push({ type: 'sale', label: `${discount}% Off` });

  const created = product.createdAt ? new Date(product.createdAt) : null;
  if (created) {
    const days = (Date.now() - created.getTime()) / 86400000;
    if (days <= 14) badges.push({ type: 'new', label: 'New' });
  }

  if (!oos) {
    const stock = sumStock(product);
    badges.push({ type: 'stock', label: 'In stock' });
    if (stock > 0 && stock <= 5) badges.push({ type: 'hot', label: `Only ${stock} left` });
    else if (stock < 10) badges.push({ type: 'hot', label: 'Selling fast' });
    else if (stock > 40) badges.push({ type: 'hot', label: 'Hot' });
  }

  return badges;
}

export function formatLKR(price) {
  const n = Number(price);
  if (Number.isNaN(n)) return '—';
  return `Rs. ${n.toLocaleString('en-LK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function variantSku(variant, product) {
  if (variant?.sku) return variant.sku;
  return `${product?.slug || 'tee'}-${variant?.size || ''}-${variant?.color || ''}`.replace(/-+/g, '-').replace(/^-|-$/g, '');
}
