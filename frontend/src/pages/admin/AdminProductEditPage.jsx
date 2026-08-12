import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import ImageUploadField from '../../components/admin/ImageUploadField.jsx';
import SizeChipSelector from '../../components/admin/SizeChipSelector.jsx';
import ColorChipSelector from '../../components/admin/ColorChipSelector.jsx';
import { normalizeSize } from '../../constants/sizes.js';
import { normalizeColor } from '../../constants/colors.js';

const emptyVariant = (size = 'M', color = 'Black') => ({
  size: normalizeSize(size) || 'M',
  color: normalizeColor(color) || 'Black',
  sku: '',
  price: '2490',
  stock: '10',
  image: '',
});

function uniqueSizes(variants) {
  const seen = [];
  for (const v of variants) {
    const s = normalizeSize(v.size);
    if (s && !seen.includes(s)) seen.push(s);
  }
  return seen;
}

function uniqueColors(variants) {
  const seen = [];
  for (const v of variants) {
    const c = normalizeColor(v.color);
    if (c && !seen.includes(c)) seen.push(c);
  }
  return seen;
}

function comboKey(size, color) {
  return `${normalizeSize(size)}::${normalizeColor(color)}`;
}

/** Ensure a size×colour matrix exists; preserve existing row data when possible. */
function syncVariantMatrix(rows, wantedSizes, wantedColors) {
  const template = rows[0] || emptyVariant();
  const byKey = new Map();
  for (const v of rows) {
    const key = comboKey(v.size, v.color);
    if (!byKey.has(key)) byKey.set(key, v);
  }

  const next = [];
  for (const sz of wantedSizes) {
    for (const col of wantedColors) {
      const key = comboKey(sz, col);
      const existing = byKey.get(key);
      if (existing) {
        next.push({
          ...existing,
          size: normalizeSize(existing.size) || sz,
          color: normalizeColor(existing.color) || col,
        });
      } else {
        next.push({
          ...emptyVariant(sz, col),
          price: template.price || '2490',
          stock: template.stock || '10',
          image: template.image || '',
        });
      }
    }
  }
  return next.length ? next : [emptyVariant(wantedSizes[0], wantedColors[0])];
}

export default function AdminProductEditPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { isAdmin, authReady } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [variants, setVariants] = useState([emptyVariant()]);

  const availableSizes = useMemo(() => uniqueSizes(variants), [variants]);
  const availableColors = useMemo(() => uniqueColors(variants), [variants]);

  useEffect(() => {
    if (!authReady || !isAdmin) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await api(`/api/products/${encodeURIComponent(id)}`);
        const p = r.product;
        if (cancelled || !p) return;
        setName(p.name || '');
        setCategory(p.category || '');
        setDescription(p.description || '');
        setImages(Array.isArray(p.images) ? p.images : []);
        setIsActive(p.isActive !== false);
        setDiscountPercent(Number(p.discountPercent) || 0);
        setVariants(
          (p.variants || []).length
            ? p.variants.map((v) => ({
                size: normalizeSize(v.size) || v.size || '',
                color: normalizeColor(v.color) || v.color || '',
                sku: v.sku || '',
                price: String(v.price ?? ''),
                stock: String(v.stock ?? 0),
                image: v.image || '',
              }))
            : [emptyVariant()]
        );
      } catch (e) {
        if (!cancelled) toast.error(e.message || 'Could not load product');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, authReady, isAdmin]);

  if (!authReady) {
    return <p className="text-slate-400">Checking session…</p>;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  function updateVariant(index, patch) {
    setVariants((rows) =>
      rows.map((row, i) => {
        if (i !== index) return row;
        const next = { ...row, ...patch };
        if (patch.size !== undefined) next.size = normalizeSize(patch.size) || patch.size;
        if (patch.color !== undefined) next.color = normalizeColor(patch.color) || patch.color;
        return next;
      })
    );
  }

  function addVariant(size, color) {
    const template = variants[0] || emptyVariant();
    setVariants((rows) => [
      ...rows,
      {
        ...emptyVariant(size || availableSizes[0] || template.size, color || availableColors[0] || template.color),
        price: template.price || '2490',
        stock: template.stock || '10',
        image: template.image || '',
      },
    ]);
  }

  function removeVariant(index) {
    setVariants((rows) => {
      if (rows.length <= 1) return rows;
      return rows.filter((_, i) => i !== index);
    });
  }

  /** Sync available size chips ↔ variant rows (size × colour matrix). */
  function setAvailableSizes(nextSizes) {
    const wanted = nextSizes.map(normalizeSize).filter(Boolean);
    if (wanted.length === 0) {
      toast.error('Keep at least one size.');
      return;
    }
    setVariants((rows) => {
      const colors = uniqueColors(rows);
      const cols = colors.length ? colors : ['Black'];
      return syncVariantMatrix(rows, wanted, cols);
    });
  }

  /** Sync available colour chips ↔ variant rows (size × colour matrix). */
  function setAvailableColors(nextColors) {
    const wanted = nextColors.map(normalizeColor).filter(Boolean);
    if (wanted.length === 0) {
      toast.error('Keep at least one colour.');
      return;
    }
    setVariants((rows) => {
      const sizes = uniqueSizes(rows);
      const szs = sizes.length ? sizes : ['M'];
      return syncVariantMatrix(rows, szs, wanted);
    });
  }

  async function save(e) {
    e.preventDefault();
    if (variants.length === 0) {
      toast.error('Add at least one size/colour variant.');
      return;
    }
    const missingSize = variants.some((v) => !normalizeSize(v.size));
    if (missingSize) {
      toast.error('Every variant needs a size.');
      return;
    }
    const missingColor = variants.some((v) => !normalizeColor(v.color));
    if (missingColor) {
      toast.error('Every variant needs a colour.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        category: category.trim(),
        description,
        images,
        isActive,
        discountPercent: Math.min(100, Math.max(0, Number(discountPercent) || 0)),
        variants: variants.map((v) => ({
          size: normalizeSize(v.size),
          color: normalizeColor(v.color),
          sku: v.sku.trim(),
          price: Number(v.price),
          stock: Number(v.stock),
          image: v.image.trim(),
        })),
      };
      await api(`/api/admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      toast.success('Product updated');
      nav('/admin/products');
    } catch (err) {
      toast.error(err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-slate-400">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500/90">Admin</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Edit product</h1>
        </div>
        <Link to="/admin/products" className="text-sm text-amber-400 hover:text-amber-300">
          ← Back to list
        </Link>
      </div>

      <form onSubmit={save} className="space-y-6">
        <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-xs font-medium text-slate-400">Name</span>
            <input required className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-400">Category</span>
            <input required className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" value={category} onChange={(e) => setCategory(e.target.value)} />
          </label>
          <label className="flex items-center gap-2 pt-6">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span className="text-sm text-slate-300">Active on storefront</span>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-400">Discount % (0–100)</span>
            <input
              type="number"
              min={0}
              max={100}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
            />
            <span className="mt-1 block text-xs text-slate-500">Customers see sale price and “% Off” badge</span>
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs font-medium text-slate-400">Description</span>
            <textarea className="mt-1 min-h-[88px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <div className="space-y-2 md:col-span-2">
            <span className="text-xs font-medium text-slate-400">Gallery images</span>
            <ImageUploadField urls={images} onChange={setImages} multiple label="Upload tee photos from PC" />
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <SizeChipSelector selected={availableSizes} onChange={setAvailableSizes} label="Available sizes" />
          <ColorChipSelector selected={availableColors} onChange={setAvailableColors} label="Available colours" />
          <p className="text-xs text-slate-500">
            Selecting sizes and colours builds a size × colour matrix. Deselecting removes that option from the storefront
            (order history keeps size/colour snapshots).
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Variants (size · colour · price · stock)</h2>
            <button
              type="button"
              onClick={() => addVariant(availableSizes[0] || 'M', availableColors[0] || 'Black')}
              className="text-sm font-medium text-amber-400 hover:text-amber-300"
            >
              + Add variant
            </button>
          </div>
          {variants.map((v, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/40 p-3">
              <div className="grid gap-2 sm:grid-cols-5">
                <select
                  className="rounded border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-white"
                  value={normalizeSize(v.size)}
                  onChange={(e) => updateVariant(i, { size: e.target.value })}
                >
                  {availableSizes.map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}
                    </option>
                  ))}
                  {!availableSizes.includes(normalizeSize(v.size)) && v.size ? (
                    <option value={normalizeSize(v.size)}>{normalizeSize(v.size)}</option>
                  ) : null}
                </select>
                <select
                  className="rounded border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-white"
                  value={normalizeColor(v.color)}
                  onChange={(e) => updateVariant(i, { color: e.target.value })}
                >
                  {availableColors.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                  {!availableColors.includes(normalizeColor(v.color)) && v.color ? (
                    <option value={normalizeColor(v.color)}>{normalizeColor(v.color)}</option>
                  ) : null}
                </select>
                <input className="rounded border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-white" placeholder="SKU" value={v.sku} onChange={(e) => updateVariant(i, { sku: e.target.value })} />
                <input type="number" className="rounded border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-white" placeholder="Price" value={v.price} onChange={(e) => updateVariant(i, { price: e.target.value })} />
                <div className="flex gap-2">
                  <input type="number" className="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-white" placeholder="Stock" value={v.stock} onChange={(e) => updateVariant(i, { stock: e.target.value })} />
                  <button type="button" className="shrink-0 text-red-400" onClick={() => removeVariant(i)} disabled={variants.length <= 1}>
                    ✕
                  </button>
                </div>
              </div>
              <ImageUploadField
                urls={v.image ? [v.image] : []}
                onChange={(urls) => updateVariant(i, { image: urls[0] || '' })}
                multiple={false}
                label="Upload variant photo"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save product'}
        </button>
      </form>
    </div>
  );
}
