'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: string, username?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SEEDED_DEMO_ACCOUNTS = [
  { role: 'OWNER', label: 'Owner / Admin (Rajesh Sharma)', username: 'admin', email: 'admin@estatevo.io' },
  { role: 'MANAGER', label: 'Sales Manager (Ananya Verma)', username: 'manager', email: 'manager@estatevo.io' },
  { role: 'EXECUTIVE', label: 'Sr. Relationship Mgr (Sarah Jenkins)', username: 'sarah.agent', email: 'sarah.agent@estatevo.io' },
  { role: 'EXECUTIVE', label: 'Luxury Consultant (Vikram Malhotra)', username: 'vikram.agent', email: 'vikram.agent@estatevo.io' },
  { role: 'EXECUTIVE', label: 'Commercial Advisor (Priya Patel)', username: 'priya.agent', email: 'priya.agent@estatevo.io' },
  { role: 'EXECUTIVE', label: 'Senior Sales Specialist (Varun Kapoor)', username: 'varun.agent', email: 'varun.agent@estatevo.io' },
  { role: 'EXECUTIVE', label: 'HNI Client Advisor (Sneha Nowlak)', username: 'sneha.agent', email: 'sneha.agent@estatevo.io' },
  { role: 'EXECUTIVE', label: 'Project Specialist (Amitav Sen)', username: 'amitav.agent', email: 'amitav.agent@estatevo.io' },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const initAuth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const storedToken = localStorage.getItem('estatevo_token') || localStorage.getItem('estateflow_token');
      if (storedToken) {
        setToken(storedToken);
        const meRes = await api.getMe();
        setUser(meRes.user);
      } else {
        // Auto-seed login for seamless demo experience
        try {
          let loginRes;
          try {
            loginRes = await api.login('admin@estatevo.io', 'EstateFlow@2026');
          } catch {
            loginRes = await api.login('admin@estateflow.io', 'EstateFlow@2026');
          }
          setToken(loginRes.token);
          setUser(loginRes.user);
          localStorage.setItem('estatevo_token', loginRes.token);
          localStorage.setItem('estatevo_user', JSON.stringify(loginRes.user));
          localStorage.setItem('estateflow_token', loginRes.token);
        } catch {
          // Backend might not be reached or seeded yet
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
      localStorage.removeItem('estatevo_token');
      localStorage.removeItem('estatevo_user');
      localStorage.removeItem('estateflow_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (username: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.login(username, pass);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('estatevo_token', res.token);
      localStorage.setItem('estatevo_user', JSON.stringify(res.user));
      localStorage.setItem('estateflow_token', res.token);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore
    } finally {
      localStorage.removeItem('estatevo_token');
      localStorage.removeItem('estatevo_user');
      localStorage.removeItem('estateflow_token');
      localStorage.removeItem('estateflow_user');
      setToken(null);
      setUser(null);
    }
  };

  const switchDemoRole = async (role: string, username?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.switchDemoRole({ role, username });
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('estatevo_token', res.token);
      localStorage.setItem('estatevo_user', JSON.stringify(res.user));
      localStorage.setItem('estateflow_token', res.token);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const meRes = await api.getMe();
      setUser(meRes.user);
    } catch {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        login,
        logout,
        switchDemoRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
