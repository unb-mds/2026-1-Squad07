"use client";

import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  FileText,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiErrorMessage } from "@/lib/api/client";
import {
  listLawSubmissions,
  type LawSubmissionListItem,
} from "@/lib/api/laws";

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
        <h1 className="text-4xl font-black tracking-tight text-slate-800">
          Monitoramento Legislativo
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-500">
          Registre e consulte textos legislativos persistidos no sistema.
        </p>
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
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md lg:col-span-2">
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
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-700">
                      {law.title}
                    </span>
                    <span className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <CalendarDays className="size-3.5" />
                      Registrada em {formattedDate(law.createdAt)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </article>

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
      </section>
    </div>
  );
}
