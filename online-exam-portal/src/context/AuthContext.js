import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/authApi';
import config from '../config';
import {
  clearAuth,
  getToken,
  getUser,
  setSession,
  setToken,
  setUser,
} from '../utils/storage';

const AuthContext = createContext(null);

const BYPASS_TOKEN = 'bypass-token';

export const AuthProvider = ({ children }) => {
  const bypass = config.authBypass;
  const [user, setUserState] = useState(() => (bypass ? config.bypassUser : getUser()));
  const [token, setTokenState] = useState(() => (bypass ? BYPASS_TOKEN : getToken()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hydrate the user from /me whenever the token changes (no-op in bypass mode).
  useEffect(() => {
    if (bypass) return undefined;

    let cancelled = false;
    if (!token) {
      setUserState(null);
      return undefined;
    }
    (async () => {
      try {
        const res = await authApi.me();
        if (!cancelled) {
          setUserState(res.user);
          setUser(res.user);
        }
      } catch (err) {
        if (!cancelled) {
          clearAuth();
          setUserState(null);
          setTokenState(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, bypass]);

  const login = useCallback(
    async ({ email, password }) => {
      if (bypass) {
        setUserState(config.bypassUser);
        setTokenState(BYPASS_TOKEN);
        return { token: BYPASS_TOKEN, user: config.bypassUser };
      }

      setLoading(true);
      setError(null);
      try {
        const res = await authApi.login({ email, password });
        setToken(res.token);
        setUser(res.user);
        setTokenState(res.token);
        setUserState(res.user);
        return res;
      } catch (err) {
        setError(err.message || 'Unable to log in');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [bypass],
  );

  const register = useCallback(
    async ({ email, password, name }) => {
      if (bypass) return login({ email, password });
      setLoading(true);
      setError(null);
      try {
        await authApi.register({ email, password, name });
        return await login({ email, password });
      } finally {
        setLoading(false);
      }
    },
    [login, bypass],
  );

  const logout = useCallback(() => {
    if (bypass) {
      // Bypass mode is "always logged in" - we just refresh the fake user.
      setUserState(config.bypassUser);
      setTokenState(BYPASS_TOKEN);
      return;
    }
    clearAuth();
    setUserState(null);
    setTokenState(null);
    setSession(null);
  }, [bypass]);

  const value = useMemo(
    () => ({ user, token, loading, error, login, register, logout, bypass }),
    [user, token, loading, error, login, register, logout, bypass],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
