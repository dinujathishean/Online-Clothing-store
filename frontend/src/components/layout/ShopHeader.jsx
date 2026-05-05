import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, ShoppingBagIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { fetchCategories } from '../../services/productService.js';

const CAT_FALLBACK = [
  { name: 'New Arrivals', href: '/products?sort=newest' },
  { name: 'Best Sellers', href: '/products' },
  { name: 'Oversized', href: '/products?category=Oversized' },
  { name: 'Casual', href: '/products?category=Casual' },
  { name: 'Offers', href: '/products?sort=price_asc' },
];

export default function ShopHeader() {
  const nav = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const count = (cart?.items || []).reduce((n, i) => n + (i.quantity || 0), 0);
  const [q, setQ] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories()
      .then((r) => setCategories(r.categories ?? []))
      .catch(() => setCategories([]));
  }, []);

  function onSearch(e) {
    e.preventDefault();
    const term = q.trim();
    nav(term ? `/products?q=${encodeURIComponent(term)}` : '/products');
    setMobileOpen(false);
  }

  const catLinks =
    categories.length > 0
      ? categories.slice(0, 8).map((c) => ({
          name: c.name,
          href: `/products?category=${encodeURIComponent(c.name)}`,
        }))
      : CAT_FALLBACK;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-md">
      <div className="container-app">
        <div className="flex h-14 items-center gap-4 md:h-16">
          <button
            type="button"
            className="rounded-lg p-2 text-neutral-700 md:hidden"
            aria-label="Menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>

          <Link to="/" className="font-display text-xl font-bold tracking-tight text-neutral-900 md:text-2xl">
            Threaded<span className="text-amber-600">LK</span>
          </Link>

          <form className="mx-auto hidden max-w-xl flex-1 md:flex" onSubmit={onSearch}>
            <div className="relative flex w-full">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search tees, colours, fits…"
                className="w-full rounded-full border border-neutral-200 bg-neutral-50 py-2 pl-10 pr-4 text-sm outline-none ring-neutral-900 focus:border-neutral-900 focus:ring-1"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            <Link
              to="/cart"
              className="relative flex items-center rounded-full p-2 text-neutral-800 hover:bg-neutral-100"
              aria-label="Shopping bag"
            >
              <ShoppingBagIcon className="h-6 w-6" />
              {count > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-bold text-white">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
            {user ? (
              <>
                <NavLink to="/orders" className="hidden rounded-full px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 sm:inline-block">
                  Orders
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin" className="hidden rounded-full px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 sm:inline-block">
                    Admin
                  </NavLink>
                )}
                <button type="button" className="rounded-full px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100" onClick={logout}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="rounded-full px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-100">
                  Sign in
                </NavLink>
                <NavLink
                  to="/register"
                  className="hidden rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 sm:inline-block"
                >
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>

        <form className="pb-3 md:hidden" onSubmit={onSearch}>
          <div className="relative flex w-full">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-full border border-neutral-200 bg-neutral-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            />
          </div>
        </form>

        <nav
          className={`flex flex-wrap gap-2 border-t border-neutral-100 py-3 md:flex-nowrap md:gap-6 md:border-t-0 md:pb-4 ${
            mobileOpen ? 'flex' : 'hidden md:flex'
          }`}
        >
          <NavLink to="/products" className="text-xs font-semibold uppercase tracking-wider text-neutral-600 hover:text-neutral-900">
            All
          </NavLink>
          {catLinks.map((c) => (
            <Link
              key={c.href}
              to={c.href}
              className="text-xs font-semibold uppercase tracking-wider text-neutral-600 hover:text-neutral-900"
              onClick={() => setMobileOpen(false)}
            >
              {c.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
