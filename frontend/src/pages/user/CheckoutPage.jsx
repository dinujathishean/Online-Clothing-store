import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../services/api.js';
import { useCart } from '../../context/CartContext.jsx';
import { formatLKR } from '../../components/product/productUtils.js';

const fields = [
  { key: 'line1', label: 'Street address', placeholder: '237/9/A/5/, Lane …' },
  { key: 'city', label: 'City', placeholder: 'e.g. Dekatana' },
  { key: 'postalCode', label: 'Postal code', placeholder: '11690' },
  { key: 'country', label: 'Country', placeholder: 'Sri Lanka' },
];

export default function CheckoutPage() {
  const nav = useNavigate();
  const { cart, clear } = useCart();
  const items = cart?.items || [];

  const [form, setForm] = useState({ line1: '', city: '', postalCode: '', country: 'Sri Lanka' });
  const [loading, setLoading] = useState(false);

  const subtotal = items.reduce((sum, it) => sum + (Number(it.snapshot?.price) || 0) * (it.quantity || 0), 0);
  const shippingFee = 0;

  async function submit(e) {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Your bag is empty.');
      return;
    }

    setLoading(true);
    try {
      const r = await api('/api/orders/checkout', {
        method: 'POST',
        body: JSON.stringify({
          shippingAddress: form,
          shippingFee,
          items: items.map((it) => ({
            productId: it.productId,
            variantId: it.variantId,
            quantity: it.quantity,
          })),
        }),
      });
      clear();
      toast.success(`Order placed — ${r.order.orderNumber}`);
      nav(`/orders/${r.order.id}`, { replace: true });
    } catch (err) {
      toast.error(err?.message || 'Could not place order');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-app py-10 md:py-14">
      <h1 className="font-display text-3xl font-bold text-neutral-900">Checkout</h1>
      <p className="mt-2 text-sm text-neutral-600">Signed-in checkout — confirm your shipping details and place the order.</p>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
          <p className="text-neutral-600">Nothing to checkout.</p>
          <Link to="/products" className="mt-4 inline-block font-semibold text-amber-700 hover:underline">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
          <form onSubmit={submit} className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">Shipping address</h2>
            <div className="space-y-4">
              {fields.map(({ key, label, placeholder }) => (
                <label key={key} className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{label}</span>
                  <input
                    required
                    className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-neutral-900 outline-none ring-neutral-900 focus:border-neutral-900 focus:ring-1"
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                </label>
              ))}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-amber-500 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-amber-400 disabled:opacity-60"
            >
              {loading ? 'Placing order…' : 'Place order'}
            </button>
          </form>

          <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">Order summary</h2>
            <ul className="mt-4 space-y-3 border-b border-neutral-100 pb-4 text-sm">
              {items.map((it) => (
                <li key={`${it.productId}-${it.variantId}`} className="flex justify-between gap-3 text-neutral-700">
                  <span className="min-w-0">
                    <span className="font-medium text-neutral-900">{it.snapshot?.name}</span>
                    <span className="block text-xs text-neutral-500">
                      {it.snapshot?.size} · {it.snapshot?.color} × {it.quantity}
                    </span>
                  </span>
                  <span className="shrink-0 font-medium">{formatLKR((Number(it.snapshot?.price) || 0) * (it.quantity || 0))}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between text-sm text-neutral-600">
              <span>Shipping</span>
              <span>{shippingFee === 0 ? 'Free' : formatLKR(shippingFee)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-neutral-100 pt-4 font-semibold text-neutral-900">
              <span>Total</span>
              <span>{formatLKR(subtotal + shippingFee)}</span>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
