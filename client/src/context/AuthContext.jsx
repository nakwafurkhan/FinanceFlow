/**
 * context/AuthContext.jsx
 * --------------------------------------------
 * Global auth state — user, token, login(), register(), logout().
 *
 * We persist both the token AND the user object in localStorage so
 * the app rehydrates instantly on a page refresh.
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/endpoints';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount — restore user from localStorage and verify the token still works
  useEffect(() => {
    const init = async () => {
      const stored = localStorage.getItem('financeflow_user');
      const token = localStorage.getItem('financeflow_token');
      if (stored && token) {
        setUser(JSON.parse(stored));
        try {
          const res = await authApi.me();
          setUser(res.data.user);
          localStorage.setItem('financeflow_user', JSON.stringify(res.data.user));
        } catch {
          localStorage.removeItem('financeflow_user');
          localStorage.removeItem('financeflow_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('financeflow_token', res.data.token);
    localStorage.setItem('financeflow_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (name, email, password) => {
    const res = await authApi.register({ name, email, password });
    localStorage.setItem('financeflow_token', res.data.token);
    localStorage.setItem('financeflow_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('financeflow_token');
    localStorage.removeItem('financeflow_user');
    setUser(null);
  };

  const updateUser = (next) => {
    setUser(next);
    localStorage.setItem('financeflow_user', JSON.stringify(next));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
