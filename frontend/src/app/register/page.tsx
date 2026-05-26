"use client";

import { ArrowRight, Lock, Mail, Scale, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError, apiErrorMessage } from "@/lib/api/client";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres");
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password);
      router.push("/");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 409) {
        setError("Este e-mail já está cadastrado");
      } else if (requestError instanceof ApiError && requestError.status === 422) {
        setError("Informe nome, e-mail e uma senha válida.");
      } else {
        setError(
          apiErrorMessage(
            requestError,
            "Não foi possível criar a conta. Tente novamente.",
          ),
        );
      }
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-145px)] items-center justify-center bg-slate-50 px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-[#1e3a5f] shadow-lg">
            <Scale className="size-7 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-800">Criar Conta</h1>
          <p className="mt-2 text-sm text-slate-500">
            Acesse o monitoramento legislativo com IA
          </p>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Nome de Usuário
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="seu_usuario"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#1e3a5f] focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#1e3a5f] focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#1e3a5f] focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#1e3a5f] focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e3a5f] py-3.5 font-bold text-white shadow-lg transition-all hover:bg-[#2d5a8c] disabled:opacity-60"
            >
              {loading ? (
                <span className="animate-pulse">Criando conta...</span>
              ) : (
                <>
                  Criar Conta
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-6 text-center">
            <p className="text-sm text-slate-500">
              Já tem uma conta?{" "}
              <Link href="/login" className="font-bold text-[#1e3a5f] hover:underline">
                Faça login aqui
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
