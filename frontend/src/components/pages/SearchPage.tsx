"use client";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  FileText,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiErrorMessage } from "@/lib/api/client";
import {
  listLawSubmissions,
  type LawSubmissionListItem,
} from "@/lib/api/laws";

function formattedDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function SubmissionCard({ law }: { law: LawSubmissionListItem }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md sm:p-6">
      <div className="flex items-start gap-4">
        <span className="rounded-xl bg-blue-50 p-3 text-[#1e3a5f]">
          <FileText className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold leading-snug text-slate-800">
            {law.title}
          </h2>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
            {law.textExcerpt}
            {law.textExcerpt.length >= 120 ? "..." : ""}
          </p>
          <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <CalendarDays className="size-4" />
            Submetida em {formattedDate(law.createdAt)}
          </p>
        </div>
      </div>
    </article>
  );
}

export function SearchPage() {
  const router = useRouter();
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  const [localQuery, setLocalQuery] = useState(query);
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
          "Não foi possível carregar as submissões. Tente novamente.",
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

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return submissions;
    }

    return submissions.filter((law) =>
      `${law.title} ${law.textExcerpt}`.toLowerCase().includes(term),
    );
  }, [query, submissions]);

  function handleSearch() {
    const term = localQuery.trim();
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex shrink-0 items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </button>
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={localQuery}
              onChange={(event) => setLocalQuery(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleSearch()}
              placeholder="Filtrar submissões por título ou texto..."
              className="w-full rounded-xl border-2 border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-[#2d5a8c] focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="rounded-xl bg-[#1e3a5f] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#2d5a8c]"
          >
            Buscar
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
        <h1 className="text-xl font-bold text-slate-800">
          {query ? (
            <>
              Submissões com <span className="text-[#1e3a5f]">&quot;{query}&quot;</span>
            </>
          ) : (
            "Submissões legislativas registradas"
          )}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Dados persistidos pelo backend. A análise de qualidade ainda é demonstrativa.
        </p>
        {!loading && !error && (
          <p className="mt-3 text-sm font-semibold text-slate-600">
            {results.length} resultado{results.length !== 1 ? "s" : ""} encontrado
            {results.length !== 1 ? "s" : ""}
          </p>
        )}
      </section>

      {loading ? (
        <section className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-16 text-sm font-semibold text-slate-600 shadow-md">
          <Loader2 className="size-5 animate-spin text-[#1e3a5f]" />
          Carregando submissões...
        </section>
      ) : error ? (
        <section className="rounded-2xl border border-red-200 bg-white py-14 text-center shadow-md">
          <AlertCircle className="mx-auto mb-4 size-12 text-red-400" />
          <h2 className="text-lg font-bold text-slate-700">
            Falha ao consultar submissões
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">{error}</p>
          <button
            type="button"
            onClick={() => void loadSubmissions()}
            className="mx-auto mt-5 flex items-center gap-2 rounded-xl bg-[#1e3a5f] px-5 py-3 text-sm font-bold text-white"
          >
            <RefreshCw className="size-4" />
            Tentar novamente
          </button>
        </section>
      ) : results.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white py-20 text-center shadow-md">
          <FileText className="mx-auto mb-4 size-12 text-slate-300" />
          <h2 className="mb-2 text-lg font-bold text-slate-600">
            {query ? "Nenhuma submissão encontrada" : "Nenhuma submissão registrada"}
          </h2>
          <p className="text-sm text-slate-500">
            {query
              ? "Tente outro termo ou limpe o filtro."
              : "Use a opção Avaliar Nova Lei para registrar o primeiro texto."}
          </p>
        </section>
      ) : (
        <div className="space-y-4">
          {results.map((law) => (
            <SubmissionCard key={law.id} law={law} />
          ))}
        </div>
      )}
    </div>
  );
}
