"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  loginUser,
  registerUser,
  type AuthSession,
  type AuthUser,
} from "@/lib/api/auth";

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const SESSION_KEY = "crivoai_session";
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedSession = window.localStorage.getItem(SESSION_KEY);
      if (!savedSession) {
        return;
      }

      try {
        setSession(JSON.parse(savedSession) as AuthSession);
      } catch {
        window.localStorage.removeItem(SESSION_KEY);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function saveSession(nextSession: AuthSession) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  }

  async function register(name: string, email: string, password: string) {
    saveSession(await registerUser(name, email, password));
  }

  async function login(email: string, password: string) {
    saveSession(await loginUser(email, password));
  }

  const logout = () => {
    window.localStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        token: session?.accessToken ?? null,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
