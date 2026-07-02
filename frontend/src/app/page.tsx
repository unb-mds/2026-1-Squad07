"use client";

import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { RadialProgress } from "@/components/RadialProgress";
import { apiErrorMessage } from "@/lib/api/client";
import { listLawSubmissions, getLawStatistics, type LawSubmissionListItem, type LawStatistics } from "@/lib/api/laws";
import { useAuth } from "@/contexts/AuthContext";

function formattedDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

function getScoreColorClass(score: number): string {
  if (score >= 85) return "bg-green-50 text-green-700";
  if (score >= 70) return "bg-yellow-50 text-yellow-700";
  return "bg-red-50 text-red-700";
}

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [submissions, setSubmissions] = useState<LawSubmissionListItem[]>([]);
  const [statistics, setStatistics] = useState<LawStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [lawsData, statsData] = await Promise.all([
        listLawSubmissions(),
        getLawStatistics(),
      ]);
      setSubmissions(lawsData);
      setStatistics(statsData);
    } catch (requestError) {
      setError(
        apiErrorMessage(
          requestError,
          "Não foi possível carregar os registros persistidos.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSubmissions();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadSubmissions]);

  function handleSearch() {
    const term = inputRef.current?.value.trim();
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6">
      <section className="space-y-2 text-center">
        <h1 className="text-4xl font-black tracking-tight text-slate-800">
          Análise de Qualidade Legislativa
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-500">
          Registre proposições e apresente indicadores de qualidade do protótipo.
        </p>
      </section>

      <section className="mx-auto max-w-4xl space-y-5">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
          Indicadores de Qualidade Legislativa
        </p>
        <article className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-md sm:flex-row sm:p-8 sm:text-left">
          <RadialProgress value={statistics ? Math.round(statistics.averageScore * 100) : 0} size={168} strokeWidth={14} />
          <div className="max-w-md">
            <div className="mb-3 flex items-center justify-center gap-2 text-slate-700 sm:justify-start">
              <TrendingUp className="size-5 text-[#1e3a5f]" />
              <h2 className="text-xl font-bold">Média Geral das Leis</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
              Base real de {statistics?.analyzedLaws ?? 0} textos legislativos analisados.
            </p>
          </div>
        </article>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
            <p className="text-3xl font-black text-slate-800">{statistics?.analyzedLaws ?? 0}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">Leis Analisadas</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
            <p className="text-3xl font-black text-red-600">{statistics?.criticalLaws ?? 0}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">Leis Críticas</p>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8c] p-6 text-white shadow-xl sm:p-8">
        <h2 className="text-center text-2xl font-bold">Consulte uma Submissão</h2>
        <p className="mb-6 mt-2 text-center text-sm text-blue-200">
          Busque por título ou trecho do texto armazenado.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Ex: transparência ou projeto de lei..."
              className="w-full rounded-xl border-2 border-transparent bg-white py-4 pl-12 pr-4 text-sm text-slate-800 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-300/20"
              onKeyDown={(event) => event.key === "Enter" && handleSearch()}
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="rounded-xl bg-white px-6 py-4 text-sm font-bold text-[#1e3a5f] shadow-lg transition-all hover:bg-gray-50"
          >
            Pesquisar
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-md ${user ? "lg:col-span-2" : "lg:col-span-3"}`}>
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <BookOpen className="size-5 text-[#1e3a5f]" />
              Submissões Recentes
            </h2>
            {!loading && !error && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-[#1e3a5f]">
                {submissions.length} registro{submissions.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {loading ? (
            <p className="flex items-center gap-2 py-8 text-sm text-slate-500">
              <Loader2 className="size-4 animate-spin" />
              Carregando registros...
            </p>
          ) : error ? (
            <div className="py-4 text-sm text-red-700">
              <p className="flex items-center gap-2">
                <AlertCircle className="size-4" />
                {error}
              </p>
              <button
                type="button"
                onClick={() => void loadSubmissions()}
                className="mt-4 flex items-center gap-2 font-semibold text-[#1e3a5f]"
              >
                <RefreshCw className="size-4" />
                Tentar novamente
              </button>
            </div>
          ) : submissions.length === 0 ? (
            <p className="py-8 text-sm text-slate-500">
              Ainda não há submissões. Registre o primeiro texto legislativo.
            </p>
          ) : (
            <div className="space-y-3">
              {submissions.slice(0, 3).map((law) => (
                <button
                  key={law.id}
                  type="button"
                  onClick={() => router.push(`/law/${law.id}`)}
                  className="flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-slate-50"
                >
                  <FileText className="mt-0.5 size-5 shrink-0 text-[#1e3a5f]" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-700">
                      {law.title}
                    </span>
                    <span className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <CalendarDays className="size-3.5" />
                      Registrada em {formattedDate(law.createdAt)}
                    </span>
                  </span>
                  {law.score !== undefined && law.score !== null && (
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-black ${getScoreColorClass(Math.round(law.score * 100))}`}
                    >
                      {Math.round(law.score * 100)}%
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </article>

        {user && (
          <article className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-md">
            <div className="rounded-2xl bg-slate-100 p-4">
              <FileText className="size-10 text-[#1e3a5f]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Submeter Nova Lei</h2>
              <p className="mt-1 text-sm text-slate-500">
                Envie ou cole um texto legislativo para persistir no banco.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/upload")}
              className="w-full rounded-xl bg-[#1e3a5f] py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-[#2d5a8c]"
            >
              Registrar Texto
            </button>
          </article>
        )}
      </section>
    </div>
  );
}
