import { Link } from 'react-router-dom';
import ProductBadges from './ProductBadges.jsx';
import { displayMinPrice, formatLKR, getDiscountPercent, isProductOutOfStock, productImage, sumStock } from './productUtils.js';

export default function ProductCard({ product, className = '' }) {
  const img = productImage(product, product?.variants?.[0]);
  const stock = sumStock(product);
  const discount = getDiscountPercent(product);
  const sale = displayMinPrice(product);
  const list = typeof product.minPrice === 'number' ? product.minPrice : null;

  const oos = isProductOutOfStock(product);

  return (
    <Link
      to={`/products/${encodeURIComponent(product.slug)}`}
      className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition hover:border-neutral-900 hover:shadow-md ${
        oos ? 'border-neutral-400' : 'border-neutral-200'
      } ${className}`}
      aria-label={oos ? `${product.name} — Out of stock` : product.name}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
        {img ? (
          <img
            src={img}
            alt=""
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${oos ? 'opacity-55 grayscale-[35%]' : ''}`}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400 text-sm">No image</div>
        )}
        {oos && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] bg-neutral-950/90 px-3 py-2.5 text-center"
            aria-hidden
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white">Out of stock</span>
          </div>
        )}
        <div className="absolute left-2 top-2 z-[2]">
          <ProductBadges product={product} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">{product.category}</p>
        <h3 className="mt-1 line-clamp-2 font-display text-base font-semibold text-neutral-900 group-hover:underline">
          {product.name}
        </h3>
        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <p className="font-semibold text-neutral-900">{sale != null ? formatLKR(sale) : '—'}</p>
          {discount > 0 && list != null && (
            <p className="text-sm text-neutral-400 line-through">{formatLKR(list)}</p>
          )}
        </div>
        <p
          className={`mt-auto pt-2 text-xs ${
            oos ? 'font-semibold uppercase tracking-wide text-neutral-900' : 'text-neutral-500'
          }`}
        >
          {oos ? 'Out of stock' : stock <= 5 ? `Only ${stock} left` : `${stock} pcs across sizes`}
        </p>
      </div>
    </Link>
  );
}
