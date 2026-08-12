import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProductBadges from '../../components/product/ProductBadges.jsx';
import { fetchProduct } from '../../services/productService.js';
import { formatLKR, productGallery, productImage, salePrice, variantSku } from '../../components/product/productUtils.js';
import { normalizeSize, PRESET_SIZES } from '../../constants/sizes.js';
import { normalizeColor, PRESET_COLORS } from '../../constants/colors.js';
import { useCart } from '../../context/CartContext.jsx';

function sortSizes(sizes) {
  return [...sizes].sort((a, b) => {
    const ia = PRESET_SIZES.indexOf(a);
    const ib = PRESET_SIZES.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

function sortColors(colors) {
  return [...colors].sort((a, b) => {
    const ia = PRESET_COLORS.indexOf(a);
    const ib = PRESET_COLORS.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { add } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
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
        const sizes =
          Array.isArray(p?.availableSizes) && p.availableSizes.length
            ? p.availableSizes
            : sortSizes([
                ...new Set((p?.variants || []).map((v) => normalizeSize(v.size)).filter(Boolean)),
              ]);
        const inStock =
          Array.isArray(p?.inStockSizes) && p.inStockSizes.length
            ? p.inStockSizes
            : sizes.filter((sz) => (p?.variants || []).some((v) => normalizeSize(v.size) === sz && v.stock > 0));
        const initialSize = inStock[0] || sizes[0] || '';
        setSelectedSize(initialSize);

        const colorsForSize = (p?.variants || [])
          .filter((v) => normalizeSize(v.size) === initialSize)
          .map((v) => normalizeColor(v.color))
          .filter(Boolean);
        const firstInStock = (p?.variants || []).find(
          (v) => normalizeSize(v.size) === initialSize && v.stock > 0
        );
        setSelectedColor(normalizeColor(firstInStock?.color) || colorsForSize[0] || '');
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

  const sizeOptions = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.availableSizes) && product.availableSizes.length) {
      return product.availableSizes;
    }
    return sortSizes([
      ...new Set((product.variants || []).map((v) => normalizeSize(v.size)).filter(Boolean)),
    ]);
  }, [product]);

  const sizeStock = useMemo(() => {
    const map = {};
    if (!product?.variants) return map;
    for (const sz of sizeOptions) {
      map[sz] = product.variants
        .filter((v) => normalizeSize(v.size) === sz)
        .reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    }
    return map;
  }, [product, sizeOptions]);

  const colorOptions = useMemo(() => {
    if (!product || !selectedSize) return [];
    // Prefer colours that exist for this size; fall back to product-level availableColors.
    const forSize = [];
    for (const v of product.variants || []) {
      if (normalizeSize(v.size) !== selectedSize) continue;
      const c = normalizeColor(v.color);
      if (c && !forSize.includes(c)) forSize.push(c);
    }
    if (forSize.length) return sortColors(forSize);
    if (Array.isArray(product.availableColors) && product.availableColors.length) {
      return product.availableColors;
    }
    return [];
  }, [product, selectedSize]);

  const selected = useMemo(() => {
    if (!product?.variants?.length || !selectedSize) return null;
    const matches = product.variants.filter((v) => normalizeSize(v.size) === selectedSize);
    if (!matches.length) return null;
    const colorNorm = normalizeColor(selectedColor);
    return (
      matches.find((v) => normalizeColor(v.color) === colorNorm) ||
      matches.find((v) => v.stock > 0) ||
      matches[0]
    );
  }, [product, selectedSize, selectedColor]);

  const gallery = useMemo(
    () => (product ? productGallery(product, selected) : []),
    [product, selected]
  );

  useEffect(() => {
    setActiveImageIndex(0);
  }, [selected?.id, product?.id, gallery.length]);

  const heroImg =
    gallery[Math.min(activeImageIndex, Math.max(gallery.length - 1, 0))] ||
    (product && selected ? productImage(product, selected) : '') ||
    '';

  function pickSize(sz) {
    if (sizeStock[sz] <= 0) return;
    setSelectedSize(sz);
    const matches = (product?.variants || []).filter((v) => normalizeSize(v.size) === sz);
    const inStock = matches.find((v) => v.stock > 0);
    setSelectedColor(normalizeColor(inStock?.color) || normalizeColor(matches[0]?.color) || '');
  }

  function pickColor(color) {
    const c = normalizeColor(color);
    const variant = (product?.variants || []).find(
      (v) => normalizeSize(v.size) === selectedSize && normalizeColor(v.color) === c
    );
    if (!variant || (variant.stock || 0) <= 0) return;
    setSelectedColor(c);
  }

  function handleAdd() {
    if (!product || !selected) return;
    if (selected.stock <= 0) {
      toast.error('This size/colour is out of stock.');
      return;
    }
    const unit = selected.salePrice ?? salePrice(selected.price, product);
    add(product.id, selected.id, 1, {
      name: product.name,
      slug: product.slug,
      price: unit,
      listPrice: selected.price,
      discountPercent: product.discountPercent || 0,
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
              <img src={heroImg} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-neutral-400">No image</div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {gallery.map((url, i) => {
                const active = i === activeImageIndex;
                return (
                  <button
                    key={`${url}-${i}`}
                    type="button"
                    onClick={() => setActiveImageIndex(i)}
                    className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition ${
                      active
                        ? 'border-neutral-900 ring-1 ring-neutral-900'
                        : 'border-neutral-200 opacity-80 hover:opacity-100'
                    }`}
                    aria-label={`View photo ${i + 1}`}
                    aria-pressed={active}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
          <ProductBadges product={product} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{product.category}</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-neutral-900 md:text-4xl">{product.name}</h1>
          {selected && (
            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <p className="text-lg font-semibold text-neutral-900">
                {formatLKR(selected.salePrice ?? salePrice(selected.price, product))}
              </p>
              {Number(product.discountPercent) > 0 && (
                <>
                  <p className="text-base text-neutral-400 line-through">{formatLKR(selected.price)}</p>
                  <span className="rounded bg-rose-600 px-2 py-0.5 text-xs font-semibold uppercase text-white">
                    {product.discountPercent}% off
                  </span>
                </>
              )}
            </div>
          )}
          {selected && (
            <p className="mt-1 text-sm text-neutral-600">
              SKU <span className="font-mono text-neutral-800">{variantSku(selected, product)}</span>
            </p>
          )}

          <p className="mt-6 leading-relaxed text-neutral-600">{product.description || 'Premium cotton tee — see size guide on the label.'}</p>

          <div className="mt-8 space-y-6">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Size</p>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((sz) => {
                  const stock = sizeStock[sz] || 0;
                  const available = stock > 0;
                  const active = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      disabled={!available}
                      onClick={() => pickSize(sz)}
                      title={available ? `${stock} in stock` : 'Out of stock'}
                      className={`min-w-[3rem] rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                        !available
                          ? 'cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-300 line-through'
                          : active
                            ? 'border-neutral-900 bg-neutral-900 text-white'
                            : 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-900'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
              {sizeOptions.length === 0 && (
                <p className="text-sm text-neutral-500">No sizes configured for this product.</p>
              )}
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">Colour</p>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => {
                  const variant = product.variants.find(
                    (v) =>
                      normalizeSize(v.size) === selectedSize && normalizeColor(v.color) === normalizeColor(color)
                  );
                  const available = (variant?.stock || 0) > 0;
                  const active = normalizeColor(selectedColor) === normalizeColor(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      disabled={!available}
                      onClick={() => pickColor(color)}
                      title={available ? `${variant?.stock} in stock` : 'Out of stock'}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                        !available
                          ? 'cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-300 line-through'
                          : active
                            ? 'border-neutral-900 bg-neutral-900 text-white'
                            : 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-900'
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
              {colorOptions.length === 0 && selectedSize && (
                <p className="text-sm text-neutral-500">No colours configured for this size.</p>
              )}
              {selected && colorOptions.length > 0 && (
                <p className="mt-2 text-sm text-neutral-500">
                  {selected.stock > 0 ? `${selected.stock} in stock` : 'Out of stock'}
                </p>
              )}
            </div>
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
