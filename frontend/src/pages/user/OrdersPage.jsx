import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../services/api.js';
import { formatLKR } from '../../components/product/productUtils.js';

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/orders/mine')
      .then((r) => setOrders(r.orders ?? []))
      .catch((e) => toast.error(e.message || 'Could not load orders'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-app py-10">
      <h1 className="font-display text-3xl font-bold text-neutral-900">My orders</h1>
      {loading ? (
        <p className="mt-6 text-neutral-500">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="mt-6 text-neutral-600">No orders yet.</p>
      ) : (
        <div className="mt-8 space-y-3">
          {orders.map((o) => {
            const id = o.id ?? o._id;
            return (
              <Link
                key={id}
                to={`/orders/${id}`}
                className="block rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-neutral-400"
              >
                <p className="font-semibold text-neutral-900">{o.orderNumber}</p>
                <p className="mt-1 text-sm text-neutral-600">
                  {o.status} · {formatLKR(o.total)}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api(`/api/orders/${encodeURIComponent(id)}`)
      .then((r) => {
        if (!cancelled) setOrder(r.order);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Could not load order');
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="container-app py-10">
        <p className="text-red-600">{error}</p>
        <Link to="/orders" className="mt-4 inline-block font-semibold text-neutral-900 underline">
          Back to orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-app py-10">
        <p className="text-neutral-500">Loading…</p>
      </div>
    );
  }

  const addr = order.shippingAddress || {};

  return (
    <div className="container-app py-10">
      <Link to="/orders" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
        ← My orders
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold text-neutral-900">Order {order.orderNumber}</h1>
      <p className="mt-2 text-neutral-600">
        Status: <span className="font-semibold capitalize text-neutral-900">{order.status}</span>
      </p>
      <p className="mt-1 text-lg font-semibold text-neutral-900">Total: {formatLKR(order.total)}</p>

      <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-neutral-900">Ship to</h2>
        <p className="mt-2 text-sm text-neutral-700">
          {addr.line1}
          <br />
          {addr.city} {addr.postalCode}
          <br />
          {addr.country}
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-neutral-900">Items</h2>
        <ul className="mt-4 divide-y divide-neutral-100">
          {(order.items || []).map((line) => (
            <li key={line.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
              <span>
                <span className="font-medium text-neutral-900">{line.productName}</span>
                <span className="block text-neutral-500">
                  {line.size} · {line.color}
                  {line.sku ? (
                    <>
                      {' '}
                      · <span className="font-mono">{line.sku}</span>
                    </>
                  ) : null}{' '}
                  × {line.quantity}
                </span>
              </span>
              <span className="font-medium text-neutral-900">{formatLKR(Number(line.unitPrice) * line.quantity)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
