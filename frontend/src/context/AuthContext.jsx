import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as authService from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const r = await authService.fetchMe();
      setUser(r.user);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const onAuthChanged = () => refreshUser();
    window.addEventListener('auth-changed', onAuthChanged);
    window.addEventListener('storage', onAuthChanged);
    return () => {
      window.removeEventListener('auth-changed', onAuthChanged);
      window.removeEventListener('storage', onAuthChanged);
    };
  }, [refreshUser]);

  const applyAuthResponse = useCallback((r) => {
    localStorage.setItem('token', r.token);
    setUser(r.user);
    window.dispatchEvent(new Event('auth-changed'));
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAdmin: user?.role === 'ADMIN' || user?.role === 'admin',
      refreshUser,
      applyAuthResponse,
      async login(email, password) {
        const r = await authService.login(email, password);
        const role = r.user?.role;
        if (role === 'ADMIN' || role === 'admin') {
          // Customer login page must not accept staff accounts.
          throw new Error('This is a staff account. Please use Admin login.');
        }
        applyAuthResponse(r);
        return r;
      },
      async register(name, email, password) {
        const r = await authService.register(name, email, password);
        // Public register is customers only — never treat as admin even if API misconfigured.
        if (r.user?.role === 'ADMIN' || r.user?.role === 'admin') {
          localStorage.removeItem('token');
          throw new Error('Registration cannot create admin accounts.');
        }
        applyAuthResponse(r);
        return r;
      },
      logout() {
        localStorage.removeItem('token');
        setUser(null);
        window.dispatchEvent(new Event('auth-changed'));
      },
    }),
    [user, refreshUser, applyAuthResponse]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
