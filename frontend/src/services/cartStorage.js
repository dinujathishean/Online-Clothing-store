const KEY = 'aurvexa_cart_v1';

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { items: [] };
    const data = JSON.parse(raw);
    return { items: Array.isArray(data.items) ? data.items : [] };
  } catch {
    return { items: [] };
  }
}

function write(cart) {
  localStorage.setItem(KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-changed'));
}

export function getCart() {
  return read();
}

export function getCartCount() {
  return read().items.reduce((n, i) => n + (i.quantity || 0), 0);
}

/**
 * Line: { productId, variantId, quantity, snapshot }
 * snapshot: { name, slug, price, image, size, color, sku, stock }
 */
export function addCartLine(line) {
  const cart = read();
  const incomingStock = line.snapshot?.stock;
  if (incomingStock !== undefined && incomingStock !== null && Number(incomingStock) <= 0) {
    return cart;
  }
  const idx = cart.items.findIndex(
    (x) => String(x.productId) === String(line.productId) && String(x.variantId) === String(line.variantId)
  );
  if (idx >= 0) {
    const nextQty = cart.items[idx].quantity + line.quantity;
    const cap = line.snapshot?.stock ?? cart.items[idx].snapshot?.stock ?? Infinity;
    cart.items[idx].quantity = Math.min(nextQty, cap);
    if (line.snapshot) {
      cart.items[idx].snapshot = { ...cart.items[idx].snapshot, ...line.snapshot };
    }
  } else {
    cart.items.push({ ...line, quantity: Math.min(line.quantity, line.snapshot?.stock ?? line.quantity) });
  }
  write(cart);
  return cart;
}

export function updateCartQuantity(productId, variantId, quantity) {
  const cart = read();
  const item = cart.items.find(
    (x) => String(x.productId) === String(productId) && String(x.variantId) === String(variantId)
  );
  if (!item) return cart;
  const cap = item.snapshot?.stock;
  if (cap !== undefined && cap !== null && Number(cap) <= 0) {
    // Keep line for UX warning; quantity stays at least 1 until user removes it.
    item.quantity = Math.max(1, quantity);
    write(cart);
    return cart;
  }
  const max = cap ?? quantity;
  item.quantity = Math.max(1, Math.min(quantity, max));
  write(cart);
  return cart;
}

/**
 * Apply live stock levels keyed by variantId (string or number).
 * Clamps quantities down; sets snapshot.stock (0 = out of stock).
 */
export function applyStockLevels(stockByVariantId) {
  const cart = read();
  let changed = false;
  for (const item of cart.items) {
    const key = String(item.variantId);
    if (!(key in stockByVariantId)) continue;
    const stock = Math.max(0, Number(stockByVariantId[key]) || 0);
    const prev = item.snapshot?.stock;
    if (prev !== stock) {
      item.snapshot = { ...(item.snapshot || {}), stock };
      changed = true;
    }
    if (stock > 0 && item.quantity > stock) {
      item.quantity = stock;
      changed = true;
    }
  }
  if (changed) write(cart);
  return read();
}

export function removeCartLine(productId, variantId) {
  const cart = read();
  cart.items = cart.items.filter(
    (x) => !(String(x.productId) === String(productId) && String(x.variantId) === String(variantId))
  );
  write(cart);
  return cart;
}

export function clearCart() {
  write({ items: [] });
}
