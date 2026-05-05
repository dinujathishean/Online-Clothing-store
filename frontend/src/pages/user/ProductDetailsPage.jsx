import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useCart } from '../../context/CartContext.jsx';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { add } = useCart();
  const [product, setProduct] = useState(null);
  const [variant, setVariant] = useState('');
  useEffect(() => {
    api(`/api/products/${id}`).then((r) => {
      setProduct(r.product);
      const first = r.product.variants?.[0];
      setVariant(first ? String(first.id) : '');
    });
  }, [id]);
  if (!product) return <p>Loading...</p>;
  const selected = product.variants.find((v) => String(v.id) === variant) || product.variants[0];
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="aspect-square rounded-xl bg-slate-900" />
      <div>
        <h2 className="text-3xl font-bold">{product.name}</h2>
        <p className="mt-2 text-slate-300">{product.description}</p>
        <select className="mt-4 w-full rounded bg-slate-900 p-2" value={variant} onChange={(e) => setVariant(e.target.value)}>
          {product.variants.map((v) => (
            <option key={v.id} value={String(v.id)}>{v.size} / {v.color} - ${v.price} ({v.stock} left)</option>
          ))}
        </select>
        <button
          type="button"
          className="mt-4 rounded bg-amber-500 px-4 py-2 text-slate-900"
          onClick={() => add(product.id, selected.id, 1)}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
