"use client";

import { ArrowRight, Lock, Mail, Scale } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError, apiErrorMessage } from "@/lib/api/client";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        setError("E-mail ou senha incorretos");
      } else {
        setError(
          apiErrorMessage(requestError, "Não foi possível entrar. Tente novamente."),
        );
      }
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-145px)] items-center justify-center bg-background px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Scale className="size-7" />
          </div>
          <h1 className="text-3xl font-black text-foreground">
            Bem-vindo de volta
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Acesse sua conta no CrivoAI</p>
        </div>

        <section className="rounded-2xl border border-border bg-card p-8 shadow-xl">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-bold text-foreground">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full rounded-xl border-2 border-border bg-muted py-3 pl-11 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-foreground">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="w-full rounded-xl border-2 border-border bg-muted py-3 pl-11 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-[var(--error)]/20 bg-[var(--error)]/10 px-4 py-3 text-sm font-semibold text-[var(--error)]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-bold text-primary-foreground shadow-lg transition-all hover:opacity-90 disabled:opacity-60"
            >
              {loading ? (
                <span className="animate-pulse">Entrando...</span>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-border pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Link href="/register" className="font-bold text-primary hover:underline">
                Registre-se gratuitamente
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}