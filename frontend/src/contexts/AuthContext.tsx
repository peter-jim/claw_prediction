import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { api } from '../services/api';
import { AuthContext, type User } from './authContextDef';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(() => {
    return !!localStorage.getItem('token');
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.auth.me()
        .then(userData => setUser(userData))
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setIsLoading(false));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login(email, password);
    localStorage.setItem('token', res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const res = await api.auth.register(email, password);
    localStorage.setItem('token', res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const updateBalance = useCallback((balance: number) => {
    setUser(prev => prev ? { ...prev, balance } : null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateBalance }}>
      {children}
    </AuthContext.Provider>
  );
}
