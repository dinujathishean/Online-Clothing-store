import { getProductBadges } from './productUtils.js';

const styles = {
  sale: 'bg-rose-600 text-white',
  new: 'bg-emerald-600 text-white',
  hot: 'bg-orange-500 text-white',
  stock: 'bg-slate-800 text-white',
  oos: 'bg-neutral-950 text-white ring-2 ring-white/90 shadow-md',
};

export default function ProductBadges({ product, className = '' }) {
  const badges = getProductBadges(product);

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {badges.map((b) => (
        <span
          key={`${b.type}-${b.label}`}
          className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            b.type === 'oos' ? 'px-2.5 py-1 text-[11px]' : ''
          } ${styles[b.type] || 'bg-neutral-700 text-white'}`}
        >
          {b.label}
        </span>
      ))}
    </div>
  );
}
