import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 p-10">
      <p className="text-amber-400">Modern Apparel Management</p>
      <h1 className="mt-2 text-4xl font-bold">Grow your T-shirt business</h1>
      <p className="mt-3 max-w-2xl text-slate-300">Storefront + order management + admin analytics in one dashboard.</p>
      <Link to="/products" className="mt-6 inline-block rounded bg-amber-500 px-4 py-2 font-medium text-slate-950">Shop now</Link>
    </section>
  );
}
