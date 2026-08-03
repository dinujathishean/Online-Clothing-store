import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function RequireAuth({ children }) {
  const { user, authReady } = useAuth();
  const location = useLocation();
  if (!authReady) {
    return <p className="p-6 text-center text-sm text-neutral-500">Checking session…</p>;
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

/** Admin-only routes — customers are sent back to the storefront. */
export function RequireAdmin({ children }) {
  const { user, isAdmin, authReady } = useAuth();
  if (!authReady) {
    return <p className="p-6 text-center text-sm text-slate-400">Checking session…</p>;
  }
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}
