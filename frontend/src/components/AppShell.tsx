"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GitBranch,
  LogIn,
  LogOut,
  Scale,
  User,
  UserPlus,
} from "lucide-react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/search", label: "Buscar Leis" },
];

function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8c] text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <span className="flex size-12 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
            <Scale className="size-7" />
          </span>
          <span>
            <span className="block text-xl font-black leading-none tracking-tight">
              CrivoAI
            </span>
            <span className="mt-1 block text-[10px] font-medium uppercase tracking-wide text-blue-200">
              Monitoramento Legislativo
            </span>
          </span>
        </Link>

        {!isAuthPage && (
          <nav className="flex items-center gap-3 sm:gap-6" aria-label="Principal">
            <div className="hidden items-center gap-6 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`border-b-2 pb-0.5 text-sm font-semibold transition-colors ${
                    pathname === item.href
                      ? "border-white text-white"
                      : "border-transparent text-blue-200 hover:border-blue-300 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white sm:flex">
                  <User className="size-4" />
                  {user.username}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/20"
                >
                  <LogOut className="size-4" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/20"
                >
                  <LogIn className="size-4" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#1e3a5f] shadow-md transition-colors hover:bg-gray-50"
                >
                  <UserPlus className="size-4" />
                  <span className="hidden sm:inline">Registro</span>
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-slate-500 sm:flex-row">
        <div className="flex items-center gap-2">
          <Scale className="size-4 text-[#1e3a5f]" />
          <span className="font-semibold text-[#1e3a5f]">CrivoAI</span>
          <span>Analise de Qualidade Legislativa</span>
        </div>
        <div className="flex items-center gap-4">
          <span>2026 Projeto UnB Gama</span>
          <span className="flex items-center gap-1">
            <GitBranch className="size-4" />
            GitHub
          </span>
        </div>
      </div>
    </footer>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
