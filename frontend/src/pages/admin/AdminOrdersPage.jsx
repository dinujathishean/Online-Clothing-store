import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../services/api.js';
import { formatLKR } from '../../components/product/productUtils.js';

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api('/api/admin/orders?limit=200')
      .then((r) => {
        if (!cancelled) setOrders(r.orders ?? []);
      })
      .catch((e) => {
        if (!cancelled) toast.error(e.message || 'Could not load orders');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500/90">Admin</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Customer orders</h1>
          <p className="mt-2 text-sm text-slate-400">Every checkout from the storefront appears here.</p>
        </div>
        <Link to="/admin" className="text-sm text-amber-400 hover:text-amber-300">
          ← Dashboard
        </Link>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading orders…</p>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-10 text-center text-slate-400">
          No orders yet. When a customer completes checkout, it will show up in this table.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[720px] text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Lines</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-slate-800/80 hover:bg-slate-900/40">
                  <td className="px-4 py-3 font-mono text-xs text-white">{o.orderNumber}</td>
                  <td className="px-4 py-3">
                    {o.customer ? (
                      <>
                        <span className="font-medium text-white">{o.customer.name}</span>
                        <span className="block text-xs text-slate-500">{o.customer.email}</span>
                      </>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3">{o.itemCount}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs capitalize text-slate-200">{o.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-white">{formatLKR(o.total)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/admin/orders/${o.id}`} className="font-medium text-amber-400 hover:text-amber-300">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
