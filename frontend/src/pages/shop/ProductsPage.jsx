import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/product/ProductCard.jsx';
import { fetchCategories, fetchProducts } from '../../services/productService.js';
import { PRESET_SIZES } from '../../constants/sizes.js';
import { normalizeColor } from '../../constants/colors.js';

const SIZE_OPTIONS = PRESET_SIZES;

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [colorOptions, setColorOptions] = useState([]);
  const [searchInput, setSearchInput] = useState(() => searchParams.get('q') || '');

  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const sizesParam = searchParams.get('sizes') || '';
  const colorsParam = searchParams.get('colors') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const selectedSizes = useMemo(() => sizesParam.split(',').filter(Boolean), [sizesParam]);
  const selectedColors = useMemo(() => colorsParam.split(',').filter(Boolean), [colorsParam]);

  const load = useCallback(async (opts = {}) => {
    const quiet = Boolean(opts.quiet);
    if (!quiet) {
      setLoading(true);
      setError('');
    }
    try {
      const params = {
        limit: 48,
        page: 1,
      };
      if (q.trim()) params.q = q.trim();
      if (category.trim()) params.category = category.trim();
      if (selectedSizes.length) params.sizes = selectedSizes.join(',');
      if (selectedColors.length) params.colors = selectedColors.join(',');
      if (minPrice !== '') params.minPrice = minPrice;
      if (maxPrice !== '') params.maxPrice = maxPrice;

      const [res, cats] = await Promise.all([fetchProducts(params), fetchCategories().catch(() => ({ categories: [] }))]);
      let list = res.products ?? [];
      if (sort === 'price_asc') list = [...list].sort((a, b) => (a.minPrice ?? 0) - (b.minPrice ?? 0));
      if (sort === 'price_desc') list = [...list].sort((a, b) => (b.minPrice ?? 0) - (a.minPrice ?? 0));

      setProducts(list);
      setCategories(cats.categories ?? []);
      setError('');

      const colors = new Set();
      (res.products ?? []).forEach((p) => {
        if (Array.isArray(p.availableColors) && p.availableColors.length) {
          p.availableColors.forEach((c) => {
            const n = normalizeColor(c);
            if (n) colors.add(n);
          });
        } else {
          (p.variants || []).forEach((v) => {
            const n = normalizeColor(v.color);
            if (n) colors.add(n);
          });
        }
      });
      setColorOptions([...colors].sort((a, b) => a.localeCompare(b)));
    } catch (e) {
      if (!quiet) {
        setError(e.message || 'Failed to load products');
        setProducts([]);
      }
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [q, category, sort, selectedSizes, selectedColors, minPrice, maxPrice]);

  useEffect(() => {
    load();
  }, [load]);

  // Soft refresh when returning to the tab so OOS updates after purchases.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') load({ quiet: true });
    };
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  function patchParams(next) {
    const sp = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined) sp.delete(k);
      else sp.set(k, String(v));
    });
    setSearchParams(sp, { replace: true });
  }

  function toggleSize(sz) {
    const set = new Set(selectedSizes);
    if (set.has(sz)) set.delete(sz);
    else set.add(sz);
    patchParams({ sizes: [...set].join(',') });
  }

  function toggleColor(c) {
    const set = new Set(selectedColors);
    if (set.has(c)) set.delete(c);
    else set.add(c);
    patchParams({ colors: [...set].join(',') });
  }

  function clearFilters() {
    setSearchParams({}, { replace: true });
  }

  return (
    <div className="container-app py-8 md:py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Catalogue</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-neutral-900">All T-shirts</h1>
          <p className="mt-2 max-w-xl text-sm text-neutral-600">Filter by fit, palette, and budget — priced in LKR for local checkout flows.</p>
        </div>
        <Link to="/" className="text-sm font-medium text-neutral-500 hover:text-neutral-900">
          ← Back to home
        </Link>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 space-y-6 rounded-2xl border border-neutral-200 bg-white p-5 lg:w-64">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Search</p>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Keywords…"
              className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              onKeyDown={(e) => {
                if (e.key === 'Enter') patchParams({ q: searchInput.trim() });
              }}
            />
            <button
              type="button"
              className="mt-2 w-full rounded-lg bg-neutral-900 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
              onClick={() => patchParams({ q: searchInput.trim() })}
            >
              Apply search
            </button>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Category</p>
            <select
              value={category}
              onChange={(e) => patchParams({ category: e.target.value })}
              className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-900"
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c._id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Size</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SIZE_OPTIONS.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => toggleSize(sz)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    selectedSizes.includes(sz) ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Colour</p>
            <div className="mt-2 flex max-h-40 flex-wrap gap-2 overflow-y-auto">
              {colorOptions.length === 0 && <span className="text-xs text-neutral-400">Load products to see colours</span>}
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleColor(c)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    selectedColors.includes(c) ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Price (LKR)</p>
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                min={0}
                placeholder="Min"
                value={minPrice}
                onChange={(e) => patchParams({ minPrice: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 px-2 py-2 text-sm"
              />
              <input
                type="number"
                min={0}
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => patchParams({ maxPrice: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 px-2 py-2 text-sm"
              />
            </div>
          </div>

          <button type="button" onClick={clearFilters} className="w-full rounded-lg border border-neutral-300 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
            Clear filters
          </button>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-neutral-600">{loading ? 'Loading…' : `${products.length} styles`}</p>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-xs font-semibold uppercase text-neutral-500">
                Sort
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => patchParams({ sort: e.target.value })}
                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
              {error}
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white py-16 text-center text-neutral-600">
              No matches — loosen filters or{' '}
              <button type="button" className="font-semibold text-neutral-900 underline" onClick={clearFilters}>
                reset
              </button>
              .
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {!loading &&
              products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
