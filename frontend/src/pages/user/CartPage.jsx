import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';

export default function CartPage() {
  const { cart, refreshCart, update, remove } = useCart();
  useEffect(() => { refreshCart(); }, []); // eslint-disable-line
  const total = (cart?.items || []).reduce((sum, it) => {
    const v = it.product?.variants?.find((x) => x._id === it.variantId);
    return sum + (v?.price || 0) * it.quantity;
  }, 0);
  return (
    <div>
      <h2 className="text-2xl font-semibold">Cart</h2>
      <div className="mt-4 space-y-3">
        {(cart?.items || []).map((it) => (
          <div key={`${it.product?._id}-${it.variantId}`} className="flex items-center justify-between rounded border border-slate-800 p-3">
            <p>{it.product?.name}</p>
            <div className="flex items-center gap-2">
              <input type="number" min="1" className="w-20 rounded bg-slate-900 p-1" value={it.quantity} onChange={(e) => update(it.product._id, it.variantId, Number(e.target.value))} />
              <button onClick={() => remove(it.product._id, it.variantId)} className="text-red-400">Remove</button>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-lg">Total: <span className="text-amber-400">${total.toFixed(2)}</span></p>
      <Link to="/checkout" className="mt-3 inline-block rounded bg-amber-500 px-4 py-2 text-slate-900">Checkout</Link>
    </div>
  );
}
