"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type User = {
  username: string;
  email: string;
};

type StoredUser = User & {
  password: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (username: string, email: string, password: string) => boolean;
  logout: () => void;
};

const USERS_KEY = "crivoai_users";
const CURRENT_USER_KEY = "crivoai_current_user";
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedUser = window.localStorage.getItem(CURRENT_USER_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser) as User);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const register = (username: string, email: string, password: string) => {
    const users = JSON.parse(
      window.localStorage.getItem(USERS_KEY) || "[]",
    ) as StoredUser[];

    if (users.some((storedUser) => storedUser.email === email)) {
      return false;
    }

    const newUser = { username, email, password };
    const currentUser = { username, email };

    window.localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    setUser(currentUser);
    return true;
  };

  const login = (email: string, password: string) => {
    const users = JSON.parse(
      window.localStorage.getItem(USERS_KEY) || "[]",
    ) as StoredUser[];
    const foundUser = users.find(
      (storedUser) =>
        storedUser.email === email && storedUser.password === password,
    );

    if (!foundUser) {
      return false;
    }

    const currentUser = {
      username: foundUser.username,
      email: foundUser.email,
    };

    window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    setUser(currentUser);
    return true;
  };

  const logout = () => {
    window.localStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
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
