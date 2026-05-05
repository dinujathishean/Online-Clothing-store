/** @param {object} product – API product with variants, createdAt */
export function sumStock(product) {
  if (!product?.variants?.length) return 0;
  return product.variants.reduce((s, v) => s + (Number(v.stock) || 0), 0);
}

export function productImage(product, variant) {
  const vImg = variant?.image;
  if (vImg) return vImg;
  if (product?.images?.length) return product.images[0];
  return '';
}

/** @returns {{ type: string, label: string }[]} */
export function getProductBadges(product) {
  const badges = [];
  if (!product) return badges;

  const created = product.createdAt ? new Date(product.createdAt) : null;
  if (created) {
    const days = (Date.now() - created.getTime()) / 86400000;
    if (days <= 14) badges.push({ type: 'new', label: 'New' });
  }

  const stock = sumStock(product);
  if (stock <= 0) badges.push({ type: 'oos', label: 'Out of Stock' });
  else {
    badges.push({ type: 'stock', label: 'In Stock' });
    if (stock < 10) badges.push({ type: 'hot', label: 'Selling fast' });
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
