import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'aurvex_access_token';

async function request(path, body, token) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.detail || payload.message || `Request failed (${response.status})`);
  return payload;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  const acceptSession = useCallback((result) => {
    if (!result.access_token) throw new Error('Authentication server did not return an access token.');
    sessionStorage.setItem(TOKEN_KEY, result.access_token);
    setToken(result.access_token);
    setUser(result.user || null);
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await request('/api/auth/login', { email, password });
    acceptSession(result);
    return result.user;
  }, [acceptSession]);

  const register = useCallback(async (name, email, password) => {
    const result = await request('/api/auth/register', { name, email, password });
    acceptSession(result);
    return result.user;
  }, [acceptSession]);

  const logout = useCallback(async () => {
    try { if (token) await request('/api/auth/logout', {}, token); } catch { /* local sign-out still proceeds */ }
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, [token]);

  useEffect(() => {
    let active = true;
    if (!token) { setLoading(false); setUser(null); return undefined; }
    request('/api/auth/me', undefined, token)
      .then((result) => { if (active) setUser(result.user || result); })
      .catch(() => { if (active) { sessionStorage.removeItem(TOKEN_KEY); setToken(null); setUser(null); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  const value = useMemo(() => ({ user, token, loading, isAuthenticated: Boolean(token && user), login, register, logout }), [user, token, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
