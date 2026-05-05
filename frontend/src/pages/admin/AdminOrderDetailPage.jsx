import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../services/api.js';
import { formatLKR } from '../../components/product/productUtils.js';

const STATUSES = ['pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await api(`/api/admin/orders/${encodeURIComponent(id)}`);
      setOrder(r.order);
      setStatus(r.order.status || 'pending');
    } catch (e) {
      toast.error(e.message || 'Could not load order');
      nav('/admin/orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when id changes
  }, [id]);

  async function saveStatus(e) {
    e.preventDefault();
    if (!order || status === order.status) return;
    setSaving(true);
    try {
      const r = await api(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setOrder(r.order);
      setStatus(r.order.status);
      toast.success('Order updated');
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !order) {
    return <p className="text-slate-500">Loading…</p>;
  }

  const addr = order.shippingAddress || {};

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/admin/orders" className="text-sm text-amber-400 hover:text-amber-300">
            ← All orders
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-white">Order {order.orderNumber}</h1>
          <p className="mt-1 text-sm text-slate-400">
            Placed{' '}
            {order.createdAt
              ? new Date(order.createdAt).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' })
              : '—'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-slate-500">Total</p>
          <p className="text-2xl font-bold text-white">{formatLKR(order.total)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Customer</h2>
          {order.customer ? (
            <div className="mt-3 text-slate-200">
              <p className="font-medium text-white">{order.customer.name}</p>
              <p className="text-sm text-slate-400">{order.customer.email}</p>
              <p className="mt-2 text-xs text-slate-500">User ID {order.customer.id}</p>
            </div>
          ) : (
            <p className="mt-3 text-slate-500">—</p>
          )}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Ship to</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {addr.line1}
            <br />
            {addr.city} {addr.postalCode}
            <br />
            {addr.country}
          </p>
        </div>
      </div>

      <form onSubmit={saveStatus} className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <div>
          <label htmlFor="order-status" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Order status
          </label>
          <select
            id="order-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-2 block rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={saving || status === order.status}
          className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save status'}
        </button>
      </form>

      <div className="rounded-xl border border-slate-800">
        <div className="border-b border-slate-800 bg-slate-900/60 px-5 py-3">
          <h2 className="font-semibold text-white">Line items</h2>
        </div>
        <div className="divide-y divide-slate-800">
          {(order.items || []).map((line) => (
            <div key={line.id} className="flex flex-wrap justify-between gap-4 px-5 py-4 text-sm">
              <div>
                <p className="font-medium text-white">{line.productName}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {line.size} · {line.color}
                  {line.sku ? (
                    <>
                      {' '}
                      · <span className="font-mono">{line.sku}</span>
                    </>
                  ) : null}{' '}
                  · Qty {line.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-400">{formatLKR(line.unitPrice)} each</p>
                <p className="font-semibold text-white">{formatLKR(Number(line.unitPrice) * line.quantity)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
