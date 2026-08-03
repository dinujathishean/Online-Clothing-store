import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminProductsPage() {
  const { isAdmin, authReady } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    imagesText: '',
    price: 2490,
    stock: 10,
    size: 'M',
    color: 'Black',
    sku: '',
    variantImage: '',
  });

  async function load() {
    const [p, c] = await Promise.all([
      api('/api/products?includeInactive=true&limit=100'),
      api('/api/categories').catch(() => ({ categories: [] })),
    ]);
    setProducts(p.products);
    setCategories(c.categories || []);
  }

  useEffect(() => {
    if (!authReady || !isAdmin) return;
    load().catch(() => {});
  }, [authReady, isAdmin]);

  if (!authReady) {
    return <p className="text-slate-400">Checking session…</p>;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  async function addProduct(e) {
    e.preventDefault();
    try {
      const images = form.imagesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      await api('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category.trim(),
          description: form.description.trim(),
          images,
          variants: [
            {
              size: String(form.size).trim(),
              color: String(form.color).trim(),
              sku: String(form.sku || '').trim(),
              price: Number(form.price),
              stock: Number(form.stock),
              image: String(form.variantImage || '').trim(),
            },
          ],
        }),
      });
      toast.success('Product added');
      setForm({
        name: '',
        category: form.category,
        description: '',
        imagesText: '',
        price: 2490,
        stock: 10,
        size: 'M',
        color: 'Black',
        sku: '',
        variantImage: '',
      });
      await load();
    } catch (err) {
      toast.error(err?.message || 'Could not add product');
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await api(`/api/admin/products/${id}`, { method: 'DELETE' });
      toast.success('Deleted');
      load();
    } catch (e) {
      toast.error(e.message || 'Delete failed');
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500/90">Admin</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Product management</h1>
          <p className="mt-2 text-sm text-slate-400">Create a product with one variant first, then open Edit to add more sizes/colours.</p>
        </div>
        <Link to="/admin" className="text-sm text-amber-400 hover:text-amber-300">
          ← Dashboard
        </Link>
      </div>

      <form onSubmit={addProduct} className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 md:grid-cols-2">
        <input
          required
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white md:col-span-2"
          placeholder="Product name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          required
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          placeholder="Category (e.g. Oversized, Casual)"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          list="category-suggestions"
        />
        <datalist id="category-suggestions">
          {categories.map((c) => (
            <option key={c.name} value={c.name} />
          ))}
        </datalist>
        <textarea
          className="min-h-[72px] rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white md:col-span-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white md:col-span-2"
          placeholder="Gallery image URLs (comma-separated)"
          value={form.imagesText}
          onChange={(e) => setForm({ ...form, imagesText: e.target.value })}
        />
        <input className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="Size" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
        <input className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="Colour" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
        <input className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="SKU (optional)" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
        <input type="number" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="Price (LKR)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input type="number" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        <input
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white md:col-span-2"
          placeholder="Variant image URL (optional)"
          value={form.variantImage}
          onChange={(e) => setForm({ ...form, variantImage: e.target.value })}
        />
        <button type="submit" className="rounded-lg bg-amber-500 px-4 py-3 font-semibold text-slate-950 md:col-span-2">
          Add product
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[640px] text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-slate-800/80 hover:bg-slate-900/40">
                <td className="px-4 py-3 font-medium text-white">{p.name}</td>
                <td className="px-4 py-3">{p.category}</td>
                <td className="px-4 py-3">{p.isActive ? <span className="text-emerald-400">Active</span> : <span className="text-slate-500">Hidden</span>}</td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/admin/products/${p.id}/edit`} className="mr-4 font-medium text-amber-400 hover:text-amber-300">
                    Edit
                  </Link>
                  <button type="button" className="font-medium text-red-400 hover:text-red-300" onClick={() => remove(p.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
