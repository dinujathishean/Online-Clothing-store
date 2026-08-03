import { Link } from 'react-router-dom';

/**
 * Full-screen layout for auth screens (centered card, no main shop header).
 * Customer auth never shows Admin links — staff use /admin/login directly.
 */
export default function AuthLayout({ children, variant = 'user', title }) {
  const isAdmin = variant === 'admin';
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/25 via-slate-950 to-slate-950" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col px-4 py-10">
        <header className="mb-8 flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold tracking-tight text-amber-400">
            T-Shirt Shop
          </Link>
          {!isAdmin && (
            <Link to="/" className="text-sm text-slate-400 hover:text-white">
              Back to shop
            </Link>
          )}
          {isAdmin && (
            <Link to="/" className="text-sm text-slate-400 hover:text-white">
              View storefront
            </Link>
          )}
        </header>

        <div className="flex flex-1 flex-col justify-center">
          {title && (
            <p className="mb-2 text-center text-xs font-medium uppercase tracking-widest text-amber-500/90">
              {title}
            </p>
          )}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-8 shadow-2xl shadow-black/40 backdrop-blur-sm">
            {children}
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          Secure login · JWT session stored in your browser
        </p>
      </div>
    </div>
  );
}
