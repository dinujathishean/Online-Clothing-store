import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as authService from '../services/authService.js';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Admin sign-in uses the same JWT login API; only users with role ADMIN may proceed.
 * Backend identifies accounts by email (there is no separate username column).
 */
export default function AdminLoginPage() {
  const nav = useNavigate();
  const { applyAuthResponse } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    const email = identifier.trim();
    if (!email.includes('@')) {
      const msg = 'Please use your admin email address (the API does not use usernames yet).';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res.user?.role !== 'ADMIN') {
        localStorage.removeItem('token');
        const msg = 'This account is not an administrator.';
        setError(msg);
        toast.error(msg);
        return;
      }
      applyAuthResponse(res);
      toast.success('Signed in as admin');
      nav('/admin', { replace: true });
    } catch (err) {
      const msg = err?.message || 'Login failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-center text-2xl font-semibold text-white">Admin sign in</h1>
      <p className="mt-1 text-center text-sm text-slate-400">Staff dashboard access</p>

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200" role="alert">
          {error}
        </p>
      )}

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Email</label>
          <input
            required
            type="email"
            autoComplete="username"
            className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-white placeholder:text-slate-600 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
            placeholder="admin@tshirtshop.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <p className="mt-1 text-xs text-slate-500">Use the admin email registered in the database.</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Password</label>
          <input
            required
            type="password"
            autoComplete="current-password"
            className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-white placeholder:text-slate-600 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Admin sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        <Link to="/login" className="font-medium text-amber-400 hover:text-amber-300">
          Customer login
        </Link>
      </p>
    </div>
  );
}
