import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { formatLKR } from '../../components/product/productUtils.js';

export default function CartPage() {
  const { cart, update, remove } = useCart();
  const items = cart?.items || [];

  const subtotal = items.reduce((sum, it) => {
    const price = Number(it.snapshot?.price) || 0;
    return sum + price * (it.quantity || 0);
  }, 0);

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
              const max = snap.stock ?? 99;
              return (
                <li key={`${it.productId}-${it.variantId}`} className="flex gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                  <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                    {snap.image ? (
                      <img src={snap.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-neutral-400">No img</div>
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
                    <p className="mt-2 text-sm font-semibold text-neutral-900">{formatLKR(snap.price)}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-2 text-xs text-neutral-600">
                        Qty
                        <input
                          type="number"
                          min={1}
                          max={max}
                          value={it.quantity}
                          onChange={(e) => {
                            const n = parseInt(e.target.value, 10);
                            if (!Number.isNaN(n)) update(it.productId, it.variantId, n);
                          }}
                          className="w-16 rounded border border-neutral-200 px-2 py-1 text-sm"
                        />
                      </label>
                      <button type="button" className="text-xs font-semibold text-red-600 hover:underline" onClick={() => remove(it.productId, it.variantId)}>
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="hidden shrink-0 text-right text-sm font-semibold text-neutral-900 sm:block">{formatLKR(lineTotal)}</div>
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
            <Link
              to="/checkout"
              className="mt-6 block w-full rounded-full bg-neutral-900 py-3 text-center text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Checkout
            </Link>
            <Link to="/products" className="mt-4 block text-center text-sm font-medium text-neutral-600 hover:text-neutral-900">
              Keep shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
