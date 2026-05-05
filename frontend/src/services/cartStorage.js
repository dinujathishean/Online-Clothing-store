const KEY = 'threaded_cart_v1';

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
  const idx = cart.items.findIndex(
    (x) => String(x.productId) === String(line.productId) && String(x.variantId) === String(line.variantId)
  );
  if (idx >= 0) {
    const nextQty = cart.items[idx].quantity + line.quantity;
    const cap = line.snapshot?.stock ?? Infinity;
    cart.items[idx].quantity = Math.min(nextQty, cap);
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
  const cap = item.snapshot?.stock ?? quantity;
  item.quantity = Math.max(1, Math.min(quantity, cap));
  write(cart);
  return cart;
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
