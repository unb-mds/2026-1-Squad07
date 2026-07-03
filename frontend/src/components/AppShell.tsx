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
import { Toaster } from "./ui/sonner";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle"; // Importando o componente criado

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/search", label: "Submissões" },
];

// AppShell.tsx

function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8c] dark:bg-none dark:bg-card text-white shadow-lg dark:border-b dark:border-border transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-4 py-4 sm:px-6">
        
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          
          <span className="flex size-12 items-center justify-center rounded-lg bg-white/10 dark:bg-white/5 backdrop-blur-sm">
            <Scale className="size-7" />
          </span>
          <span>
            <span className="block text-xl font-black leading-none tracking-tight">
              CrivoAI
            </span>
            <span className="mt-1 block text-[10px] font-medium uppercase tracking-wide text-blue-200 dark:text-muted-foreground">
              Monitoramento Legislativo
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-4" aria-label="Principal">
          <div className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`border-b-2 pb-0.5 text-sm font-semibold transition-colors ${
                  pathname === item.href
                    ? "border-white text-white"
                    : "border-transparent text-blue-200 dark:text-muted-foreground hover:border-blue-300 dark:hover:text-white hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <DarkModeToggle />

            {user ? (
              <>
                <Link
                  href="/profile"
                  className="hidden items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20 sm:flex"
                >
                  <User className="size-4" />
                  {user.name}
                </Link>
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
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    // Atualizado com tokens semânticos do Tailwind configurados em globals.css
    <footer className="mt-auto border-t border-border bg-card text-muted-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm sm:flex-row">
        <div className="flex items-center gap-2">
          {/* O texto e o ícone passam a herdar a cor ou usar a primária dependendo da visibilidade */}
          <Scale className="size-4 text-primary" />
          <span className="font-semibold text-primary">CrivoAI</span>
          <span>Análise de Qualidade Legislativa</span>
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
      <Toaster />
    </AuthProvider>
  );
}