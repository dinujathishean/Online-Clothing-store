import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';

/**
 * Public product catalog — loads from GET /api/products.
 */
export default function ProductsPlaceholderPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api('/api/products?limit=48')
      .then((r) => {
        if (!cancelled) setProducts(r.products ?? []);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Failed to load products');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-slate-400">Loading products…</p>;
  }
  if (error) {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-6 text-red-200">
        <p className="font-medium">Could not load products</p>
        <p className="mt-1 text-sm opacity-90">{error}</p>
        <p className="mt-3 text-sm text-slate-400">
          Make sure the backend is running at <code className="text-amber-200/90">http://localhost:5000</code>.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500/90">Catalog</p>
          <h1 className="mt-1 text-3xl font-bold text-white">Products</h1>
        </div>
        <Link
          to="/home"
          className="text-sm text-slate-400 hover:text-amber-300"
        >
          ← Back to home
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 p-12 text-center">
          <p className="text-slate-400">No products yet.</p>
          <p className="mt-2 text-sm text-slate-500">
            Add items from <Link to="/admin/products" className="text-amber-400 hover:underline">Admin → Manage products</Link>.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Link
              key={p.id}
              to={`/products/${encodeURIComponent(p.slug)}`}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-amber-500/40 hover:bg-slate-900/80"
            >
              <h2 className="font-semibold text-white">{p.name}</h2>
              <p className="mt-1 text-sm text-slate-400">{p.category}</p>
              <p className="mt-3 text-amber-400">
                From $
                {typeof p.minPrice === 'number' ? p.minPrice.toFixed(2) : '—'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
