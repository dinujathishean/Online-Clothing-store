import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserCircleIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext.jsx';

/** Customer login — full-screen layout at `/login`. */
export default function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('rememberEmail');
    if (saved) setEmail(saved);
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      if (remember) localStorage.setItem('rememberEmail', email);
      else localStorage.removeItem('rememberEmail');
      toast.success('Welcome back');
      nav('/', { replace: true });
    } catch (err) {
      const msg = err?.message || 'Login failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-purple-200 via-violet-100 to-cyan-100 px-6 py-10">
      <div className="w-full max-w-[340px]">
        <div className="flex flex-col items-center">
          <UserCircleIcon className="h-[72px] w-[72px] text-white drop-shadow-md" strokeWidth={1} aria-hidden />
          <h1 className="mt-4 text-4xl font-extralight tracking-wide text-white drop-shadow-sm">
            User Login
          </h1>
        </div>

        {error && (
          <p className="mt-6 rounded-md bg-red-500/15 px-3 py-2 text-center text-sm text-red-800" role="alert">
            {error}
          </p>
        )}

        <form className="mt-10 space-y-8" onSubmit={onSubmit}>
          <div className="flex items-end gap-3 border-b-2 border-[#1e3a5f] pb-2 focus-within:border-[#2d4a6f]">
            <EnvelopeIcon className="mb-0.5 h-6 w-6 shrink-0 text-[#1e3a5f]" aria-hidden />
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-0 bg-transparent pb-0.5 text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-0"
            />
          </div>

          <div className="flex items-end gap-3 border-b-2 border-[#1e3a5f] pb-2 focus-within:border-[#2d4a6f]">
            <LockClosedIcon className="mb-0.5 h-6 w-6 shrink-0 text-[#1e3a5f]" aria-hidden />
            <input
              required
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-0 bg-transparent pb-0.5 text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-0"
            />
          </div>

          <div className="flex items-center justify-between gap-4 text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-[#2563eb]">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-400 text-[#2563eb] focus:ring-[#2563eb]"
              />
              <span className="select-none">Remember me</span>
            </label>
            <button
              type="button"
              className="text-[#2563eb] hover:underline"
              onClick={() => toast('Password reset is not configured yet.', { icon: 'ℹ️' })}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2d4a6f] py-3.5 text-sm font-bold tracking-[0.25em] text-white shadow-md transition hover:bg-[#3b5d8f] disabled:opacity-60"
          >
            {loading ? 'PLEASE WAIT…' : 'LOGIN'}
          </button>
        </form>

        <p className="mt-10 text-center text-sm text-slate-600">
          New user?{' '}
          <Link to="/register" className="font-medium text-[#2563eb] hover:underline">
            Register
          </Link>
        </p>
        <p className="mt-3 text-center text-sm text-slate-600">
          Staff?{' '}
          <Link to="/admin/login" className="font-medium text-[#2563eb] hover:underline">
            Admin login
          </Link>
        </p>
        <p className="mt-4 text-center text-sm">
          <Link to="/" className="text-slate-600 hover:text-slate-900 hover:underline">
            Continue shopping without signing in
          </Link>
        </p>
      </div>
    </div>
  );
}
