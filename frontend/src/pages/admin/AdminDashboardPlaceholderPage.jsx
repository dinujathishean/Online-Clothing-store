import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../services/api.js';

export default function AdminDashboardPlaceholderPage() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api('/api/admin/summary')
      .then((r) => {
        if (!cancelled) setSummary(r);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message || 'Could not load stats');
          toast.error(e.message || 'Could not load stats');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-500/90">Admin</p>
        <h1 className="mt-1 text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 max-w-xl text-slate-400">Inventory and customer orders for AURVEXA.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">{error}</div>
      )}

      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total products</p>
            <p className="mt-2 text-3xl font-bold text-white">{summary.totalProducts}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Active on storefront</p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">{summary.activeProducts}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Customer orders</p>
            <p className="mt-2 text-3xl font-bold text-sky-400">{summary.totalOrders ?? 0}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Pending orders</p>
            <p className="mt-2 text-3xl font-bold text-amber-400">{summary.pendingOrders ?? 0}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 sm:col-span-2 lg:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Low-stock variants</p>
            <p className="mt-2 text-3xl font-bold text-amber-400">{summary.lowStockVariants}</p>
            <p className="mt-1 text-xs text-slate-500">Threshold ≤ {summary.lowStockThreshold}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/admin/products" className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-amber-500/40">
          <h2 className="font-semibold text-white">Products</h2>
          <p className="mt-1 text-sm text-slate-400">Add, edit, delete, manage variants & imagery</p>
        </Link>
        <Link to="/admin/orders" className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-amber-500/40">
          <h2 className="font-semibold text-white">Orders</h2>
          <p className="mt-1 text-sm text-slate-400">View customer checkouts &amp; update status</p>
        </Link>
      </div>
    </div>
  );
}
