import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/product/ProductCard.jsx';
import { sumStock } from '../../components/product/productUtils.js';
import { fetchProducts } from '../../services/productService.js';

function SectionTitle({ eyebrow, title, subtitle, href, actionLabel }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{eyebrow}</p>
        )}
        <h2 className="mt-1 font-display text-2xl font-bold text-neutral-900 md:text-3xl">{title}</h2>
        {subtitle && <p className="mt-2 max-w-xl text-sm text-neutral-600">{subtitle}</p>}
      </div>
      {href && (
        <Link
          to={href}
          className="inline-flex w-fit items-center rounded-full border border-neutral-900 px-5 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
        >
          {actionLabel || 'Shop now'}
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchProducts({ limit: 48 })
      .then((r) => {
        if (!cancelled) setProducts(r.products ?? []);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Could not load catalog');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const derived = useMemo(() => {
    const list = products.slice();
    const best = [...list].sort((a, b) => sumStock(b) - sumStock(a));
    const catMatch = (p, needle) => (p.category || '').toLowerCase().includes(needle);
    const oversized = list.filter((p) => catMatch(p, 'oversized'));
    const casual = list.filter((p) => catMatch(p, 'casual'));
    const priced = [...list].filter((p) => typeof p.minPrice === 'number').sort((a, b) => a.minPrice - b.minPrice);
    const offers = priced.slice(0, 8);

    return {
      newArrivals: list.slice(0, 8),
      bestSellers: best.slice(0, 8),
      oversized: oversized.length ? oversized.slice(0, 8) : list.slice(0, 4),
      casual: casual.length ? casual.slice(0, 8) : list.slice(4, 12),
      offers,
    };
  }, [products]);

  return (
    <div>
      <section className="relative overflow-hidden bg-neutral-900 text-white">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-amber-500 blur-[100px]" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-teal-600 blur-[120px]" />
        </div>
        <div className="container-app relative py-16 md:flex md:items-center md:gap-12 md:py-24">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">Island-made attitude</p>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight md:text-6xl">
              Tees built for Colombo heat & weekend hangs.
            </h1>
            <p className="mt-4 text-lg text-neutral-300">
              Oversized drops, crisp casual fits, and limited graphic runs — delivered across Sri Lanka.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
              >
                Shop now
              </Link>
              <Link
                to="/products?sort=newest"
                className="rounded-full border border-white/40 px-8 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                New arrivals
              </Link>
            </div>
          </div>
          <div className="relative mt-12 hidden flex-1 md:block">
            <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-neutral-800 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"
                alt=""
                className="h-full w-full object-cover opacity-90"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm backdrop-blur-md">
              <p className="font-semibold text-white">LKR-friendly pricing</p>
              <p className="text-neutral-300">Cotton-heavy blanks · S–XXL</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-app py-14 md:py-20">
        {loading && <p className="text-neutral-500">Loading collection…</p>}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
            <p className="font-medium">{error}</p>
            <p className="mt-2 text-sm">Start the API at http://localhost:5000</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
            <p className="text-neutral-600">Your catalog is empty.</p>
            <Link to="/admin/products" className="mt-4 inline-block font-semibold text-amber-700 hover:underline">
              Add products in Admin
            </Link>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <section className="mb-20">
              <SectionTitle
                eyebrow="Fresh on the rack"
                title="New arrivals"
                subtitle="Latest cuts and colours — rotated every drop."
                href="/products?sort=newest"
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {derived.newArrivals.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>

            <section className="mb-20">
              <SectionTitle
                eyebrow="Crowd favourites"
                title="Best sellers"
                subtitle="What customers reorder — stocked deep across sizes."
                href="/products"
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {derived.bestSellers.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>

            <section className="mb-20 rounded-2xl border border-neutral-200 bg-neutral-100 px-6 py-12 md:px-10 md:py-16">
              <SectionTitle
                eyebrow="Fit & silhouette"
                title="Oversized T-shirts"
                subtitle="Roomy shoulders, dropped hem — styled for sneakers and slides."
                href="/products?q=oversized"
                actionLabel="Browse oversized"
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {derived.oversized.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>

            <section className="mb-20">
              <SectionTitle
                eyebrow="Everyday rotation"
                title="Casual T-shirts"
                subtitle="Clean necklines and soft-hand cotton for work-from-café days."
                href="/products?q=casual"
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {derived.casual.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white px-6 py-12 md:px-10 md:py-14">
              <SectionTitle
                eyebrow="Limited windows"
                title="Offers & value picks"
                subtitle="Grab approachable price points before sizes sell through."
                href="/products?sort=price_asc"
                actionLabel="See deals"
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {derived.offers.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
