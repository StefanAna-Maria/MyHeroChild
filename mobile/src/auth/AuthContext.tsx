import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getRoleFromToken, UserRole } from "./jwt";

type AuthState = {
  isReady: boolean;
  token: string | null;
  role: UserRole | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem("token");
      if (stored) {
        setToken(stored);
        setRole(getRoleFromToken(stored));
      }
      setIsReady(true);
    })();
  }, []);

  const login = async (newToken: string) => {
    await AsyncStorage.setItem("token", newToken);
    setToken(newToken);
    setRole(getRoleFromToken(newToken));
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setToken(null);
    setRole(null);
  };

  const value = useMemo(() => ({ isReady, token, role, login, logout }), [isReady, token, role]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}