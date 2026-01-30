"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User } from "@/lib/types";
import { api, clearToken, getToken, setToken } from "@/lib/api";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (phoneOrEmail: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMe = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.me(token);
      setUser(res.user);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = useCallback(async (phoneOrEmail: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.login({ phone_or_email: phoneOrEmail, password });
      setToken(res.token);
      setUser(res.user);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erreur de connexion";
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const token = getToken();
    try {
      await api.logout(token);
    } catch {
      // Ignore logout API errors
    } finally {
      clearToken();
      setUser(null);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value: AuthContextValue = {
    user,
    loading,
    error,
    login,
    logout,
    fetchMe,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
