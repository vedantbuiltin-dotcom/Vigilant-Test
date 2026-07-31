const TOKEN_KEY = 'oep:token';
const USER_KEY = 'oep:user';
const SESSION_KEY = 'oep:session';

const safe = (fn, fallback = null) => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

export const getToken = () => safe(() => localStorage.getItem(TOKEN_KEY));

export const setToken = (token) =>
  safe(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  });

export const getUser = () =>
  safe(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }, null);

export const setUser = (user) =>
  safe(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  });

export const getSession = () =>
  safe(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }, null);

export const setSession = (session) =>
  safe(() => {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  });

export const clearAuth = () => {
  setToken(null);
  setUser(null);
  setSession(null);
};
