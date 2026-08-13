import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext.jsx';
import { formatLKR } from '../../components/product/productUtils.js';
import { refreshCartStock } from '../../services/cartStock.js';

export default function CartPage() {
  const { cart, update, remove, refreshCart } = useCart();
  const items = cart?.items || [];
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!items.length) return;
      setSyncing(true);
      try {
        const { adjusted, outOfStockCount } = await refreshCartStock();
        if (cancelled) return;
        refreshCart();
        if (outOfStockCount > 0) {
          toast.error(
            outOfStockCount === 1
              ? '1 item in your bag is out of stock.'
              : `${outOfStockCount} items in your bag are out of stock.`
          );
        } else if (adjusted) {
          toast('Some quantities were updated to match available stock.', { icon: 'ℹ️' });
        }
      } catch {
        /* ignore — checkout API still enforces stock */
      } finally {
        if (!cancelled) setSyncing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Sync once when bag gains items / mounts — not on every qty tweak.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const subtotal = items.reduce((sum, it) => {
    const price = Number(it.snapshot?.price) || 0;
    return sum + price * (it.quantity || 0);
  }, 0);

  const hasOutOfStock = items.some((it) => (Number(it.snapshot?.stock) || 0) <= 0);

  return (
    <div className="container-app py-10 md:py-14">
      <h1 className="font-display text-3xl font-bold text-neutral-900">Your bag</h1>
      <p className="mt-2 text-sm text-neutral-600">Review sizes and quantities before checkout.</p>

      {items.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-neutral-300 bg-white py-16 text-center">
          <p className="text-neutral-600">Your bag is empty.</p>
          <Link to="/products" className="mt-6 inline-block rounded-full bg-neutral-900 px-8 py-3 text-sm font-semibold text-white hover:bg-neutral-800">
            Browse tees
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <ul className="space-y-4">
            {items.map((it) => {
              const snap = it.snapshot || {};
              const lineTotal = (Number(snap.price) || 0) * (it.quantity || 0);
              const liveStock = Number(snap.stock);
              const oos = !Number.isNaN(liveStock) && liveStock <= 0;
              const max = oos ? 1 : liveStock >= 0 && !Number.isNaN(liveStock) ? liveStock : 99;
              const lowStock = !oos && liveStock > 0 && it.quantity > liveStock;
              return (
                <li
                  key={`${it.productId}-${it.variantId}`}
                  className={`flex gap-4 rounded-2xl border bg-white p-4 shadow-sm ${
                    oos ? 'border-amber-300 ring-1 ring-amber-200' : 'border-neutral-200'
                  }`}
                >
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                    {snap.image ? (
                      <img src={snap.image} alt="" className={`h-full w-full object-cover ${oos ? 'opacity-50' : ''}`} />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-neutral-400">No img</div>
                    )}
                    {oos && (
                      <span className="absolute inset-x-0 bottom-0 bg-amber-100/95 py-0.5 text-center text-[10px] font-semibold uppercase tracking-wide text-amber-900">
                        Out of stock
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link to={`/products/${encodeURIComponent(snap.slug || '')}`} className="font-semibold text-neutral-900 hover:underline">
                      {snap.name || 'Product'}
                    </Link>
                    <p className="mt-1 text-xs text-neutral-500">
                      {snap.size} · {snap.color}
                      {snap.sku ? (
                        <>
                          {' '}
                          · <span className="font-mono">{snap.sku}</span>
                        </>
                      ) : null}
                    </p>
                    {oos ? (
                      <p className="mt-2 text-sm font-medium text-amber-800">
                        This size/colour sold out — remove it to continue checkout.
                      </p>
                    ) : (
                      <p className="mt-2 text-sm font-semibold text-neutral-900">{formatLKR(snap.price)}</p>
                    )}
                    {lowStock && (
                      <p className="mt-1 text-xs text-amber-700">Only {liveStock} left — quantity was capped.</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {!oos && (
                        <label className="flex items-center gap-2 text-xs text-neutral-600">
                          Qty
                          <input
                            type="number"
                            min={1}
                            max={max}
                            value={it.quantity}
                            disabled={syncing}
                            onChange={(e) => {
                              const n = parseInt(e.target.value, 10);
                              if (!Number.isNaN(n)) update(it.productId, it.variantId, n);
                            }}
                            className="w-16 rounded border border-neutral-200 px-2 py-1 text-sm"
                          />
                        </label>
                      )}
                      <button type="button" className="text-xs font-semibold text-red-600 hover:underline" onClick={() => remove(it.productId, it.variantId)}>
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="hidden shrink-0 text-right text-sm font-semibold text-neutral-900 sm:block">
                    {oos ? '—' : formatLKR(lineTotal)}
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Summary</p>
            <p className="mt-4 flex justify-between text-neutral-700">
              <span>Subtotal</span>
              <span className="font-semibold text-neutral-900">{formatLKR(subtotal)}</span>
            </p>
            <p className="mt-2 text-xs text-neutral-500">Shipping calculated at checkout.</p>
            {hasOutOfStock && (
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
                Remove out-of-stock items before checkout.
              </p>
            )}
            {hasOutOfStock ? (
              <button
                type="button"
                disabled
                className="mt-6 block w-full cursor-not-allowed rounded-full bg-neutral-300 py-3 text-center text-sm font-semibold text-neutral-500"
              >
                Checkout unavailable
              </button>
            ) : (
              <Link
                to="/checkout"
                className="mt-6 block w-full rounded-full bg-neutral-900 py-3 text-center text-sm font-semibold text-white hover:bg-neutral-800"
              >
                Checkout
              </Link>
            )}
            <Link to="/products" className="mt-4 block text-center text-sm font-medium text-neutral-600 hover:text-neutral-900">
              Keep shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
