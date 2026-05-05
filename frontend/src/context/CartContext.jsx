import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as cartStorage from '../services/cartStorage.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => cartStorage.getCart());

  useEffect(() => {
    const sync = () => setCart(cartStorage.getCart());
    window.addEventListener('cart-changed', sync);
    return () => window.removeEventListener('cart-changed', sync);
  }, []);

  const refreshCart = useCallback(() => setCart(cartStorage.getCart()), []);

  const value = useMemo(
    () => ({
      cart,
      refreshCart,
      /** @param {number|string} productId @param {number|string} variantId @param {number} [quantity] @param {object} [snapshot] */
      add(productId, variantId, quantity = 1, snapshot = {}) {
        cartStorage.addCartLine({
          productId,
          variantId,
          quantity,
          snapshot,
        });
        setCart(cartStorage.getCart());
      },
      update(productId, variantId, quantity) {
        cartStorage.updateCartQuantity(productId, variantId, quantity);
        setCart(cartStorage.getCart());
      },
      remove(productId, variantId) {
        cartStorage.removeCartLine(productId, variantId);
        setCart(cartStorage.getCart());
      },
      clear() {
        cartStorage.clearCart();
        setCart(cartStorage.getCart());
      },
    }),
    [cart, refreshCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
