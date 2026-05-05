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
        applyAuthResponse(r);
      },
      async register(name, email, password) {
        const r = await authService.register(name, email, password);
        applyAuthResponse(r);
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
