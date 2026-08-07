import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AurvexaLogo from '../../components/brand/AurvexaLogo.jsx';
import ProductCard from '../../components/product/ProductCard.jsx';
import { sumStock } from '../../components/product/productUtils.js';
import { fetchProducts } from '../../services/productService.js';
import { useAuth } from '../../context/AuthContext.jsx';

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

/** Watermark word — .LK only for this hero marquee. */
const WATERMARK_WORD = 'AURVEXA.LK';

/** Duplicated strip for a seamless translateX loop. */
function WatermarkStrip({ count = 6 }) {
  return (
    <div className="flex shrink-0 items-center">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="aurvexa-watermark-glyph mx-6 font-display md:mx-10">
          {WATERMARK_WORD}
        </span>
      ))}
    </div>
  );
}

/** Soft hero backdrop — two diagonals from top-right toward bottom-center. */
function AurvexaBannerBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800" />
      <div className="absolute -left-16 top-0 h-64 w-64 rounded-full bg-amber-500/25 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-teal-600/20 blur-3xl" />

      <div className="aurvexa-watermark-stage">
        <div className="aurvexa-watermark-line aurvexa-watermark-line--a">
          <div className="aurvexa-track-left flex w-max will-change-transform">
            <WatermarkStrip />
            <WatermarkStrip />
          </div>
        </div>
        <div className="aurvexa-watermark-line aurvexa-watermark-line--b">
          <div className="aurvexa-track-right flex w-max will-change-transform">
            <WatermarkStrip />
            <WatermarkStrip />
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-neutral-950/40" />
    </div>
  );
}

export default function HomePage() {
  const { isAdmin } = useAuth();
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
      <section className="relative min-h-[78vh] overflow-hidden text-white md:min-h-[85vh]">
        <AurvexaBannerBackdrop />
        <div className="container-app relative z-10 flex min-h-[78vh] flex-col justify-center py-20 md:min-h-[85vh] md:py-28">
          <div className="max-w-3xl">
            <AurvexaLogo height="clamp(3.5rem, 10vw, 5rem)" alt="AURVEXA" />
            <h1 className="hero-gold-tagline mt-5 font-display whitespace-nowrap font-bold leading-tight tracking-[0.04em]">
              The Gold Standard of Modern Fashion.
            </h1>
            <p className="mt-4 max-w-lg text-lg text-neutral-300">
              Fresh drops from AURVEXA — breathable cotton, bold fits, delivered island-wide.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100"
              >
                Shop now
              </Link>
              <Link
                to="/products?sort=newest"
                className="rounded-full border border-white/40 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                New arrivals
              </Link>
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
            {isAdmin ? (
              <Link to="/admin/products" className="mt-4 inline-block font-semibold text-amber-700 hover:underline">
                Manage products in Admin
              </Link>
            ) : (
              <p className="mt-3 text-sm text-neutral-500">Check back soon — new tees are on the way.</p>
            )}
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
