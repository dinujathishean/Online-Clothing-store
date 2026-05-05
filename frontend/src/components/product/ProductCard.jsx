import { Link } from 'react-router-dom';
import ProductBadges from './ProductBadges.jsx';
import { formatLKR, productImage, sumStock } from './productUtils.js';

export default function ProductCard({ product, className = '' }) {
  const img = productImage(product, product?.variants?.[0]);
  const stock = sumStock(product);
  const price = typeof product.minPrice === 'number' ? product.minPrice : null;

  return (
    <Link
      to={`/products/${encodeURIComponent(product.slug)}`}
      className={`group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:border-neutral-900 hover:shadow-md ${className}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
        {img ? (
          <img
            src={img}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400 text-sm">No image</div>
        )}
        <div className="absolute left-2 top-2">
          <ProductBadges product={product} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">{product.category}</p>
        <h3 className="mt-1 line-clamp-2 font-display text-base font-semibold text-neutral-900 group-hover:underline">
          {product.name}
        </h3>
        <p className="mt-2 font-semibold text-neutral-900">{price != null ? formatLKR(price) : '—'}</p>
        <p className="mt-auto pt-2 text-xs text-neutral-500">{stock > 0 ? `${stock} pcs across sizes` : 'Unavailable'}</p>
      </div>
    </Link>
  );
}
