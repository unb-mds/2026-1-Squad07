"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { searchMockLaws } from "@/lib/mock-laws";
import type { LawResult } from "@/types/law";

type ScoreFilter = "all" | "high" | "medium" | "low";

const scoreFilters: { value: ScoreFilter; label: string; color: string }[] = [
  { value: "all", label: "Todos", color: "bg-slate-800 text-white" },
  { value: "high", label: "Alta (>=85)", color: "bg-green-600 text-white" },
  { value: "medium", label: "Media (70-84)", color: "bg-yellow-500 text-white" },
  { value: "low", label: "Baixa (<70)", color: "bg-red-500 text-white" },
];

function MetricPill({ label, value }: { label: string; value: number }) {
  const color =
    value >= 85
      ? "border-green-200 bg-green-50 text-green-700"
      : value >= 70
        ? "border-yellow-200 bg-yellow-50 text-yellow-700"
        : "border-red-200 bg-red-50 text-red-700";

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${color}`}>
      {label}: {value}
    </span>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const bg = score >= 85 ? "bg-green-500" : score >= 70 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        Pontuacao
      </p>
      <div className={`relative flex size-20 items-center justify-center rounded-full ${bg} shadow-lg`}>
        <span className="text-2xl font-black text-white">{score}</span>
        <span className="absolute -bottom-1.5 -right-1.5 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-700 shadow">
          /100
        </span>
      </div>
    </div>
  );
}

function ResultCard({ law }: { law: LawResult }) {
  const router = useRouter();
  const accentColor =
    law.score >= 85
      ? "from-green-500 to-emerald-400"
      : law.score >= 70
        ? "from-yellow-500 to-amber-400"
        : "from-red-500 to-rose-400";

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition-shadow hover:shadow-lg">
      <div className={`h-1.5 bg-gradient-to-r ${accentColor}`} />
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {law.category}
              </span>
              <span className="text-slate-300">-</span>
              <span className="text-xs text-slate-400">{law.year}</span>
            </div>

            <h2 className="mb-3 text-lg font-bold leading-snug text-slate-800">
              {law.title}
            </h2>

            <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                Resumo gerado por IA
              </p>
              <p className="text-sm leading-relaxed text-slate-700">{law.summary}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <MetricPill label="Legibilidade" value={law.readability} />
              <MetricPill label="Ambiguidade" value={law.ambiguity} />
              <MetricPill label="Conformidade" value={law.technicalConformity} />
            </div>

            <div className="mt-3 flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={`size-4 ${
                    index < Math.round(law.score / 20)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-slate-200"
                  }`}
                />
              ))}
              <span className="ml-1 text-xs text-slate-500">
                {(law.score / 20).toFixed(1)} de 5.0
              </span>
            </div>
          </div>

          <div className="flex min-w-32 flex-row items-center justify-between gap-4 md:flex-col">
            <ScoreBadge score={law.score} />
            <button
              type="button"
              onClick={() => router.push(`/law/${law.id}`)}
              className="rounded-xl bg-[#1e3a5f] px-4 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-[#2d5a8c] md:w-full"
            >
              Ver Detalhes
            </button>
          </div>
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
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");
  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(() => searchMockLaws(query), [query]);
  const filtered = results.filter((law) => {
    if (scoreFilter === "high") return law.score >= 85;
    if (scoreFilter === "medium") return law.score >= 70 && law.score < 85;
    if (scoreFilter === "low") return law.score < 70;
    return true;
  });

  function handleSearch() {
    const term = localQuery.trim();
    if (term) {
      router.push(`/search?q=${encodeURIComponent(term)}`);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
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
              placeholder="Pesquisar outra lei..."
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {query ? (
                <>
                  Resultados para <span className="text-[#1e3a5f]">&quot;{query}&quot;</span>
                </>
              ) : (
                "Buscar Leis"
              )}
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} encontrado
              {filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
          >
            <SlidersHorizontal className="size-4" />
            Filtrar por Pontuacao
            {showFilters ? <X className="size-4" /> : null}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            {scoreFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => {
                  setScoreFilter(filter.value);
                  setShowFilters(false);
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  scoreFilter === filter.value
                    ? `${filter.color} scale-105 shadow-md`
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {scoreFilter === filter.value && (
                  <CheckCircle className="mr-1.5 inline size-3.5" />
                )}
                {filter.label}
              </button>
            ))}
          </div>
        )}
      </section>

      {filtered.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white py-20 text-center shadow-md">
          <AlertCircle className="mx-auto mb-4 size-12 text-slate-300" />
          <h2 className="mb-2 text-lg font-bold text-slate-600">
            Nenhum resultado encontrado
          </h2>
          <p className="text-sm text-slate-500">
            Tente ajustar os filtros ou pesquisar outro termo.
          </p>
        </section>
      ) : (
        <div className="space-y-4">
          {filtered.map((law) => (
            <ResultCard key={law.id} law={law} />
          ))}
        </div>
      )}
    </div>
  );
}
