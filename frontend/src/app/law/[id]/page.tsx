"use client";

import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  BookOpen,
  Brain,
  CalendarDays,
  FileText,
  Hash,
  Loader2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RadialProgress } from "@/components/RadialProgress";
import { apiErrorMessage } from "@/lib/api/client";
import { getLaw, type CreatedLaw } from "@/lib/api/laws";
import { getDemoAnalysis, scoreClass } from "@/lib/demo-analysis";

function formattedDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function LawDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [law, setLaw] = useState<CreatedLaw | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const analysis = getDemoAnalysis(params.id);

  useEffect(() => {
    let active = true;

    async function loadLaw() {
      setLoading(true);
      setError("");

      try {
        const persistedLaw = await getLaw(params.id);
        if (active) {
          setLaw(persistedLaw);
        }
      } catch (requestError) {
        if (active) {
          setError(
            apiErrorMessage(
              requestError,
              "Não foi possível carregar esta submissão.",
            ),
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadLaw();
    return () => {
      active = false;
    };
  }, [params.id]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800"
      >
        <ArrowLeft className="size-4" />
        Voltar às submissões
      </button>

      {loading ? (
        <section className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-20 text-sm font-semibold text-slate-600 shadow-md">
          <Loader2 className="size-5 animate-spin text-[#1e3a5f]" />
          Carregando submissão persistida...
        </section>
      ) : error || !law ? (
        <section className="rounded-2xl border border-red-200 bg-white py-20 text-center shadow-md">
          <AlertCircle className="mx-auto mb-4 size-12 text-red-400" />
          <h1 className="text-lg font-bold text-slate-700">Falha ao consultar submissão</h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">{error}</p>
        </section>
      ) : (
        <>
          <section className="rounded-2xl bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8c] p-6 text-white shadow-lg">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-200">
              Submissão Persistida
            </p>
            <h1 className="text-2xl font-bold leading-snug">{law.title}</h1>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-blue-100">
              {law.lawNumber && (
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
                  <Hash className="size-4" />
                  {law.lawNumber}
                </span>
              )}
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
                <CalendarDays className="size-4" />
                Registrada em {formattedDate(law.createdAt)}
              </span>
              {analysis && (
                <span className="rounded-full bg-white/15 px-3 py-1.5 font-bold">
                  Score demonstrativo: {analysis.score}/100
                </span>
              )}
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
                <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-slate-800">
                  <BookOpen className="size-5 text-[#1e3a5f]" />
                  Texto Armazenado
                </h2>
                <div className="whitespace-pre-wrap font-serif text-[15px] leading-loose text-slate-700">
                  {law.text}
                </div>
              </section>

              {analysis && (
                <>
                  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
                    <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-800">
                      <BarChart3 className="size-5 text-[#1e3a5f]" />
                      Métricas de Qualidade
                    </h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      <RadialProgress value={analysis.readability} label="Legibilidade" />
                      <RadialProgress value={analysis.ambiguity} label="Ausência de Ambiguidade" />
                      <RadialProgress
                        value={analysis.technicalConformity}
                        label="Conformidade Técnica"
                      />
                    </div>
                  </section>
                  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
                      <Brain className="size-5 text-[#1e3a5f]" />
                      Análise Demonstrativa
                    </h2>
                    <p className="text-sm leading-relaxed text-slate-700">{analysis.summary}</p>
                  </section>
                </>
              )}
            </div>

            <aside className="space-y-6">
              {analysis ? (
                <>
                  <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-md">
                    <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                      Pontuação Simulada
                    </p>
                    <span
                      className={`inline-block rounded-full px-8 py-7 text-5xl font-black ${scoreClass(analysis.score)}`}
                    >
                      {analysis.score}
                    </span>
                    <p className="mt-4 text-xs text-slate-500">
                      Indicador visual para apresentação do protótipo.
                    </p>
                  </section>
                  <section>
                    <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-800">
                      <AlertTriangle className="size-5 text-amber-500" />
                      Pontos Observados
                    </h2>
                    <div className="space-y-3">
                      {analysis.issues.map((issue) => (
                        <article
                          key={issue.type}
                          className="rounded-xl border-l-4 border-amber-400 bg-amber-50 p-4 shadow-sm"
                        >
                          <h3 className="text-sm font-bold text-amber-800">{issue.type}</h3>
                          <p className="my-2 text-sm italic text-slate-700">
                            &quot;{issue.excerpt}&quot;
                          </p>
                          <p className="text-xs leading-relaxed text-amber-800">{issue.issue}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                </>
              ) : (
                <section className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-slate-700">
                  <FileText className="mt-0.5 size-5 shrink-0 text-[#1e3a5f]" />
                  Este detalhe apresenta somente os dados persistidos no sistema.
                </section>
              )}
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
