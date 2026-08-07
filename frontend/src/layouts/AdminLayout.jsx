import { NavLink, Outlet } from 'react-router-dom';
import AurvexaLogo from '../components/brand/AurvexaLogo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const linkCls = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-amber-500/15 text-amber-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
  }`;

export default function AdminLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900/80">
        <div className="container-app flex h-14 items-center justify-between">
          <NavLink to="/admin" className="inline-flex items-end gap-2 no-underline" aria-label="AURVEXA Admin">
            <AurvexaLogo size="sm" alt="" />
            <span className="pb-0.5 text-sm font-semibold text-amber-400">Admin</span>
          </NavLink>
          <div className="flex items-center gap-4 text-sm">
            <NavLink to="/" className="text-slate-500 hover:text-white">
              View storefront
            </NavLink>
            <span className="hidden text-slate-600 sm:inline">{user?.email}</span>
            <button type="button" className="text-slate-400 hover:text-white" onClick={logout}>
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="container-app flex gap-8 py-8">
        <aside className="hidden w-48 shrink-0 flex-col gap-1 md:flex">
          <NavLink to="/admin" end className={linkCls}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/products" className={linkCls}>
            Products
          </NavLink>
          <NavLink to="/admin/orders" className={linkCls}>
            Orders
          </NavLink>
        </aside>

        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
