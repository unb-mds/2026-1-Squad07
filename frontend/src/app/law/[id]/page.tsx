"use client";

import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  BookOpen,
  Brain,
  FileWarning,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { RadialProgress } from "@/components/RadialProgress";
import { defaultAnalysis, getLawById } from "@/lib/mock-laws";
import type { IssueItem } from "@/types/law";

const issueStyles: Record<string, { box: string; title: string; text: string }> = {
  "Ambiguidade Detectada": {
    box: "border-red-400 from-red-50 to-rose-50",
    title: "text-red-800",
    text: "text-red-700",
  },
  "Complexidade Sintatica": {
    box: "border-amber-400 from-amber-50 to-yellow-50",
    title: "text-amber-800",
    text: "text-amber-700",
  },
  "Termo Tecnico Nao Definido": {
    box: "border-orange-400 from-orange-50 to-amber-50",
    title: "text-orange-800",
    text: "text-orange-700",
  },
};

function IssueCard({ item }: { item: IssueItem }) {
  const style = issueStyles[item.type] ?? {
    box: "border-slate-300 from-slate-50 to-white",
    title: "text-slate-800",
    text: "text-slate-700",
  };

  return (
    <article className={`rounded-xl border-l-4 bg-gradient-to-br p-4 shadow-sm ${style.box}`}>
      <div className="mb-2 flex items-center gap-2">
        <FileWarning className="size-4 shrink-0 opacity-70" />
        <h3 className={`text-sm font-bold ${style.title}`}>{item.type}</h3>
      </div>
      <blockquote className="mb-2 rounded-lg border-l-2 border-slate-300 bg-white/70 p-3 font-serif text-sm italic text-slate-700">
        &quot;{item.excerpt}&quot;
      </blockquote>
      <p className={`text-xs font-medium leading-relaxed ${style.text}`}>{item.issue}</p>
    </article>
  );
}

function barColor(value: number) {
  if (value >= 85) return "bg-green-500";
  if (value >= 70) return "bg-yellow-500";
  return "bg-red-500";
}

export default function LawDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const law = getLawById(params.id);
  const analysis = {
    ...defaultAnalysis,
    overallScore: law.score,
    metrics: {
      readability: law.readability,
      ambiguity: law.ambiguity,
      technicalConformity: law.technicalConformity,
    },
  };

  const overallColor = barColor(analysis.overallScore);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800"
      >
        <ArrowLeft className="size-4" />
        Voltar aos Resultados
      </button>

      <section className="rounded-2xl bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8c] p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-200">
              Analise Legislativa - CrivoAI
            </p>
            <h1 className="text-xl font-bold leading-snug">{law.title}</h1>
          </div>
          <span className="w-fit rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-blue-100">
            {law.category}
          </span>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-slate-800">
              <BookOpen className="size-5 text-[#1e3a5f]" />
              Texto Legal
            </h2>
            <div className="space-y-4 whitespace-pre-wrap font-serif text-[15px] leading-loose text-slate-700">
              {analysis.legalText.split("\n\n").map((block) => (
                <p
                  key={block}
                  className={block.startsWith("CAPITULO") ? "font-bold tracking-wide text-slate-900" : ""}
                >
                  {block}
                </p>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-800">
              <BarChart3 className="size-5 text-[#1e3a5f]" />
              Metricas de Qualidade
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <RadialProgress value={analysis.metrics.readability} label="Legibilidade" />
              <RadialProgress value={analysis.metrics.ambiguity} label="Ausencia de Ambiguidade" />
              <RadialProgress
                value={analysis.metrics.technicalConformity}
                label="Conformidade Tecnica"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
              <Brain className="size-5 text-[#1e3a5f]" />
              Analise da IA
            </h2>
            <p className="text-sm leading-relaxed text-slate-700">{analysis.aiSummary}</p>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-md">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
              Pontuacao Geral
            </p>
            <div className="relative inline-flex items-center justify-center">
              <div className={`flex size-36 items-center justify-center rounded-full ${overallColor} shadow-xl`}>
                <span className="text-5xl font-black text-white">
                  {analysis.overallScore}
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 rounded-full bg-white px-3 py-1 shadow-md">
                <span className="text-sm font-bold text-slate-700">/100</span>
              </div>
            </div>
            <p className="mt-5 text-sm text-slate-500">
              {analysis.overallScore >= 85
                ? "Qualidade alta - lei bem redigida"
                : analysis.overallScore >= 70
                  ? "Qualidade media - melhorias recomendadas"
                  : "Qualidade baixa - revisao necessaria"}
            </p>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
            <h2 className="text-sm font-bold text-slate-700">Detalhamento</h2>
            {[
              { label: "Legibilidade", value: analysis.metrics.readability },
              { label: "Ambiguidade", value: analysis.metrics.ambiguity },
              { label: "Conformidade", value: analysis.metrics.technicalConformity },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-medium text-slate-600">{label}</span>
                  <span className="font-bold text-slate-800">{value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${barColor(value)}`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-800">
              <AlertTriangle className="size-5 text-amber-500" />
              Problemas Detectados ({analysis.issues.length})
            </h2>
            <div className="space-y-3">
              {analysis.issues.map((issue) => (
                <IssueCard key={`${issue.type}-${issue.excerpt}`} item={issue} />
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
