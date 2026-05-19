import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { AuthUser } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  deleteAccount: (skipConfirm?: boolean) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'debrief_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  // On app load: if token exists, GET /auth/me
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      api.get('/auth/me')
        .then(res => {
          // Fallback depending on how the backend returns user data
          setUser(res.data.user || res.data);
        })
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
        })
        .finally(() => {
          setIsReady(true);
        });
    } else {
      setIsReady(true);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data;
      localStorage.setItem(TOKEN_KEY, token);
      setUser(user);
      return true;
    } catch (error) {
      console.error('Login failed', error);
      return false;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { user, token } = res.data;
      localStorage.setItem(TOKEN_KEY, token);
      setUser(user);
      return true;
    } catch (error) {
      console.error('Registration failed', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    // Redirect if needed
    window.location.href = '/login';
  }, []);

  const deleteAccount = useCallback(async (skipConfirm: boolean = false): Promise<boolean> => {
    if (!skipConfirm && !window.confirm('Are you sure you want to delete your account? This action cannot be undone and will delete all your personal data.')) {
      return false;
    }
    try {
      await api.delete('/auth/me');
      logout();
      return true;
    } catch (error) {
      console.error('Failed to delete account', error);
      alert('Failed to delete account. Please try again later.');
      return false;
    }
  }, [logout]);

  if (!isReady) {
    return null; // Wait until initial auth check finishes before rendering app
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
