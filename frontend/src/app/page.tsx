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
import {
  listLawSubmissions,
  type LawSubmissionListItem,
} from "@/lib/api/laws";
import {
  demoAnalyses,
  demoDashboard,
  scoreClass,
} from "@/lib/demo-analysis";

function formattedDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export default function Home() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [submissions, setSubmissions] = useState<LawSubmissionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setSubmissions(await listLawSubmissions());
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
        <h1 className="text-4xl font-black tracking-tight text-foreground">
          Análise de Qualidade Legislativa
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Registre proposições e apresente indicadores de qualidade do protótipo.
        </p>
      </section>

      <section className="mx-auto max-w-4xl space-y-5">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Indicadores simulados para demonstração
        </p>
        <article className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-border bg-card p-6 text-center shadow-md sm:flex-row sm:p-8 sm:text-left">
          <RadialProgress value={demoDashboard.averageScore} size={168} strokeWidth={14} />
          <div className="max-w-md">
            <div className="mb-3 flex items-center justify-center gap-2 text-foreground sm:justify-start">
              <TrendingUp className="size-5 text-primary" />
              <h2 className="text-xl font-bold">Média Geral das Leis</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Base demonstrativa de {demoDashboard.analyzedLaws} textos legislativos brasileiros.
            </p>
          </div>
        </article>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-6 shadow-md">
            <p className="text-3xl font-black text-foreground">{demoDashboard.analyzedLaws}</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">Leis Analisadas</p>
          </article>
          <article className="rounded-2xl border border-border bg-card p-6 shadow-md">
            <p className="text-3xl font-black text-destructive">{demoDashboard.criticalLaws}</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">Leis Críticas</p>
          </article>
        </div>
      </section>

      {/* ALTERADO: Adicionado 'dark:bg-none dark:bg-card dark:border dark:border-border' para se adaptar à nova cor */}
      <section className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8c] dark:bg-none dark:bg-card dark:border dark:border-border p-6 text-white shadow-xl sm:p-8 transition-colors">
        <h2 className="text-center text-2xl font-bold dark:text-foreground">Consulte uma Submissão</h2>
        <p className="mb-6 mt-2 text-center text-sm text-blue-200 dark:text-muted-foreground">
          Busque por título ou trecho do texto armazenado.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400 dark:text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Ex: transparência ou projeto de lei..."
              className="w-full rounded-xl border-2 border-transparent bg-white dark:bg-muted py-4 pl-12 pr-4 text-sm text-slate-800 dark:text-foreground outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-300/20"
              onKeyDown={(event) => event.key === "Enter" && handleSearch()}
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="rounded-xl bg-white dark:bg-primary dark:text-primary-foreground px-6 py-4 text-sm font-bold text-[#1e3a5f] shadow-lg transition-all hover:bg-gray-50 dark:hover:opacity-90"
          >
            Pesquisar
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className="rounded-2xl border border-border bg-card p-6 shadow-md lg:col-span-2">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <BookOpen className="size-5 text-primary" />
              Submissões Recentes
            </h2>
            {!loading && !error && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                {submissions.length} registro{submissions.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {loading ? (
            <p className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Carregando registros...
            </p>
          ) : error ? (
            <div className="py-4 text-sm text-destructive">
              <p className="flex items-center gap-2">
                <AlertCircle className="size-4" />
                {error}
              </p>
              <button
                type="button"
                onClick={() => void loadSubmissions()}
                className="mt-4 flex items-center gap-2 font-semibold text-primary"
              >
                <RefreshCw className="size-4" />
                Tentar novamente
              </button>
            </div>
          ) : submissions.length === 0 ? (
            <p className="py-8 text-sm text-muted-foreground">
              Ainda não há submissões. Registre o primeiro texto legislativo.
            </p>
          ) : (
            <div className="space-y-3">
              {submissions.slice(0, 3).map((law) => (
                <button
                  key={law.id}
                  type="button"
                  onClick={() => router.push(`/law/${law.id}`)}
                  className="flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-muted"
                >
                  <FileText className="mt-0.5 size-5 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">
                      {law.title}
                    </span>
                    <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5" />
                      Registrada em {formattedDate(law.createdAt)}
                    </span>
                  </span>
                  {demoAnalyses[law.id] && (
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-black ${scoreClass(demoAnalyses[law.id].score)}`}
                    >
                      {demoAnalyses[law.id].score}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </article>

        <article className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-6 text-center shadow-md">
          <div className="rounded-2xl bg-muted p-4">
            <FileText className="size-10 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Submeter Nova Lei</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Envie ou cole um texto legislativo para persistir no banco.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/upload")}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md transition-colors hover:opacity-90"
          >
            Registrar Texto
          </button>
        </article>
      </section>
    </div>
  );
}