"use client";

import {
  AlertCircle,
  BookOpen,
  FileText,
  Search,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { RadialProgress } from "@/components/RadialProgress";
import { laws, quickSearches } from "@/lib/mock-laws";

const stats = [
  {
    label: "Leis Analisadas",
    value: "1.247",
    icon: BookOpen,
    color: "text-blue-600 bg-blue-50",
  },
  {
    label: "Leis Críticas",
    value: "23",
    icon: AlertCircle,
    color: "text-red-600 bg-red-50",
  },
];

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <article className="flex min-h-36 items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
      <div className={`rounded-xl p-3 ${color}`}>
        <Icon className="size-6" />
      </div>
      <div>
        <p className="text-3xl font-black text-slate-800">{value}</p>
        <p className="mt-0.5 text-sm font-medium text-slate-500">{label}</p>
      </div>
    </article>
  );
}

function scoreClass(score: number) {
  if (score >= 85) {
    return "bg-green-50 text-green-700";
  }

  if (score >= 70) {
    return "bg-yellow-50 text-yellow-700";
  }

  return "bg-red-50 text-red-700";
}

export default function Home() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch(query?: string) {
    const term = query ?? inputRef.current?.value.trim();
    if (term) {
      router.push(`/search?q=${encodeURIComponent(term)}`);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6">
      <section className="space-y-2 text-center">
        <h1 className="text-4xl font-black tracking-tight text-slate-800">
          Análise de Qualidade Legislativa
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-500">
          Inteligência Artificial e NLP para avaliar legibilidade e ambiguidade
          de textos legislativos brasileiros
        </p>
      </section>

      <section className="mx-auto max-w-4xl space-y-5">
        <article className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-md sm:flex-row sm:p-8 sm:text-left">
          <RadialProgress value={67} size={168} strokeWidth={14} />
          <div className="max-w-md">
            <div className="mb-3 flex items-center justify-center gap-2 text-slate-700 sm:justify-start">
              <TrendingUp className="size-5 text-[#1e3a5f]" />
              <h2 className="text-xl font-bold">Média Geral das Leis</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
              Baseado na análise de 1.247 textos legislativos brasileiros
            </p>
          </div>
        </article>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8c] p-6 text-white shadow-xl sm:p-8">
        <h2 className="text-center text-2xl font-bold">Pesquise uma Lei</h2>
        <p className="mb-6 mt-2 text-center text-sm text-blue-200">
          Digite o número, nome ou tema da lei para uma análise completa
        </p>

        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Ex: Lei 13.709/2018 ou proteção de dados..."
                className="w-full rounded-xl border-2 border-transparent bg-white py-4 pl-12 pr-4 text-sm text-slate-800 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-300/20"
                onKeyDown={(event) => event.key === "Enter" && handleSearch()}
              />
            </div>
            <button
              type="button"
              onClick={() => handleSearch()}
              className="rounded-xl bg-white px-6 py-4 text-sm font-bold text-[#1e3a5f] shadow-lg transition-all hover:bg-gray-50 sm:whitespace-nowrap"
            >
              Pesquisar
            </button>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {quickSearches.map((query) => (
              <button
                key={query}
                type="button"
                onClick={() => handleSearch(query)}
                className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100 transition-colors hover:bg-white/20 hover:text-white"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
            <BookOpen className="size-5 text-[#1e3a5f]" />
            Demonstração de Análise
          </h2>
          <p className="mb-4 text-sm text-slate-500">
            Exemplos visuais com score simulado. As submissões reais estão em Buscar Leis.
          </p>
          <div className="space-y-3">
            {laws.slice(0, 3).map((law) => (
              <button
                key={law.id}
                type="button"
                onClick={() => router.push(`/law/${law.id}`)}
                className="flex w-full items-center justify-between gap-4 rounded-xl p-3 text-left transition-colors hover:bg-slate-50"
              >
                <span>
                  <span className="block text-sm font-semibold text-slate-700">
                    {law.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {law.category}
                  </span>
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-black ${scoreClass(law.score)}`}
                >
                  {law.score}
                </span>
              </button>
            ))}
          </div>
        </article>

        <article className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-md">
          <div className="rounded-2xl bg-slate-100 p-4">
            <FileText className="size-10 text-[#1e3a5f]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Submeter Nova Lei</h2>
            <p className="mt-1 text-sm text-slate-500">
              Envie ou cole um texto legislativo para registrá-lo no sistema.
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
