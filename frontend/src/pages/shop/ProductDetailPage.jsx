import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProductBadges from '../../components/product/ProductBadges.jsx';
import { fetchProduct } from '../../services/productService.js';
import { formatLKR, productImage, variantSku } from '../../components/product/productUtils.js';
import { useCart } from '../../context/CartContext.jsx';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { add } = useCart();
  const [product, setProduct] = useState(null);
  const [variantId, setVariantId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchProduct(slug)
      .then((r) => {
        if (cancelled) return;
        const p = r.product;
        setProduct(p);
        const first = p?.variants?.[0];
        setVariantId(first ? String(first.id) : '');
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Product not found');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const selected = useMemo(() => {
    if (!product?.variants?.length) return null;
    return product.variants.find((v) => String(v.id) === variantId) || product.variants[0];
  }, [product, variantId]);

  const heroImg = product && selected ? productImage(product, selected) : '';

  function handleAdd() {
    if (!product || !selected) return;
    if (selected.stock <= 0) {
      toast.error('This variant is out of stock.');
      return;
    }
    add(product.id, selected.id, 1, {
      name: product.name,
      slug: product.slug,
      price: selected.price,
      image: heroImg,
      size: selected.size,
      color: selected.color,
      sku: variantSku(selected, product),
      stock: selected.stock,
    });
    toast.success('Added to bag');
  }

  if (loading) {
    return (
      <div className="container-app py-16">
        <p className="text-neutral-500">Loading product…</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-app py-16">
        <p className="text-red-600">{error || 'Product not found.'}</p>
        <Link to="/products" className="mt-4 inline-block font-semibold text-neutral-900 underline">
          Back to catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app py-8 md:py-12">
      <nav className="mb-8 text-sm text-neutral-500">
        <Link to="/" className="hover:text-neutral-900">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-neutral-900">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-900">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 aspect-[4/5]">
            {heroImg ? (
              <img src={heroImg} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-neutral-400">No image</div>
            )}
          </div>
          <ProductBadges product={product} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{product.category}</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-neutral-900 md:text-4xl">{product.name}</h1>
          <p className="mt-4 text-lg font-semibold text-neutral-900">{selected ? formatLKR(selected.price) : '—'}</p>
          {selected && (
            <p className="mt-1 text-sm text-neutral-600">
              SKU <span className="font-mono text-neutral-800">{variantSku(selected, product)}</span>
            </p>
          )}

          <p className="mt-6 leading-relaxed text-neutral-600">{product.description || 'Premium cotton tee — see size guide on the label.'}</p>

          <div className="mt-8 space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500">Size & colour</label>
            <select
              value={variantId}
              onChange={(e) => setVariantId(e.target.value)}
              className="w-full max-w-md rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            >
              {product.variants.map((v) => (
                <option key={v.id} value={String(v.id)}>
                  {v.size} · {v.color} — {formatLKR(v.price)} · {v.stock > 0 ? `${v.stock} in stock` : 'Out of stock'}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <button
              type="button"
              disabled={!selected || selected.stock <= 0}
              onClick={handleAdd}
              className="rounded-full bg-neutral-900 px-10 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              Add to bag
            </button>
            <Link
              to="/products"
              className="rounded-full border border-neutral-300 px-10 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
            >
              Continue shopping
            </Link>
          </div>

          <dl className="mt-12 grid gap-4 border-t border-neutral-200 pt-8 text-sm text-neutral-600 sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-neutral-900">Fabric & care</dt>
              <dd className="mt-1">Machine wash cold · Line dry · Warm iron inside-out</dd>
            </div>
            <div>
              <dt className="font-semibold text-neutral-900">Delivery</dt>
              <dd className="mt-1">Colombo 1–2 days · Island-wide via courier partners</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
