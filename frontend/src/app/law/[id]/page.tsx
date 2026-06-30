"use client";

import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  BookOpen,
  CalendarDays,
  FileText,
  Hash,
  Loader2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RadialProgress } from "@/components/RadialProgress";
import { apiErrorMessage } from "@/lib/api/client";
import {
  analyzeLawQuality,
  getLaw,
  type AnalysisResponse,
  type AnalysisWarning,
  type CreatedLaw,
} from "@/lib/api/laws";

function formattedDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getScoreColorClass(score: number): string {
  if (score >= 70) return "bg-green-100 text-green-800 border-green-300";
  if (score >= 40) return "bg-amber-100 text-amber-800 border-amber-300";
  return "bg-red-100 text-red-800 border-red-300";
}

function scoreToPercent(score: number | null): number {
  return score === null ? 0 : Math.round(score * 100);
}

function classifyScore(score: number | null): string {
  if (score === null) return "Sem score calculado";

  const percent = scoreToPercent(score);
  if (percent >= 70) return "Boa qualidade legislativa";
  if (percent >= 40) return "Requer atenção";
  return "Revisão recomendada";
}

function formatMetricName(code: string): string {
  const labels: Record<string, string> = {
    ambiguity: "Ambiguidade",
    ambiguidade: "Ambiguidade",
    vagueness: "Vagueza",
    vagueza: "Vagueza",
    missing_reference: "Falta de referência",
    falta_referencia: "Falta de referência",
    inconsistency: "Inconsistência",
    inconsistencia: "Inconsistência",
  };

  return labels[code] ?? code.replace(/_/g, " ");
}

function formatProbability(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function warningKey(warning: AnalysisWarning) {
  return `${warning.code}-${warning.message}`;
}

export default function LawDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [law, setLaw] = useState<CreatedLaw | null>(null);
  const [loadingLaw, setLoadingLaw] = useState(true);
  const [errorLaw, setErrorLaw] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [errorAnalysis, setErrorAnalysis] = useState("");

  useEffect(() => {
    let active = true;

    async function loadLaw() {
      setLoadingLaw(true);
      setErrorLaw("");
      try {
        const persistedLaw = await getLaw(params.id);
        if (active) {
          setLaw(persistedLaw);
        }
      } catch (requestError) {
        if (active) {
          setErrorLaw(
            apiErrorMessage(
              requestError,
              "Não foi possível carregar esta submissão.",
            ),
          );
        }
      } finally {
        if (active) {
          setLoadingLaw(false);
        }
      }
    }

    void loadLaw();
    return () => {
      active = false;
    };
  }, [params.id]);

  useEffect(() => {
    if (!law) return;

    const currentText = law.text;
    let active = true;

    async function fetchAnalysis() {
      setLoadingAnalysis(true);
      setErrorAnalysis("");
      try {
        const data = await analyzeLawQuality({
          lawId: params.id,
          text: currentText,
          type: "bill",
        });
        if (active) {
          setAnalysis(data);
        }
      } catch (requestError) {
        if (active) {
          setErrorAnalysis(
            apiErrorMessage(
              requestError,
              "Não foi possível calcular as métricas de qualidade no momento.",
            ),
          );
        }
      } finally {
        if (active) {
          setLoadingAnalysis(false);
        }
      }
    }

    void fetchAnalysis();
    return () => {
      active = false;
    };
  }, [law, params.id]);

  const scorePercent = scoreToPercent(analysis?.score ?? null);
  const metrics = Object.entries(analysis?.metrics ?? {});

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

      {loadingLaw ? (
        <section className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-20 text-sm font-semibold text-slate-600 shadow-md">
          <Loader2 className="size-5 animate-spin text-[#1e3a5f]" />
          Carregando submissão persistida...
        </section>
      ) : errorLaw || !law ? (
        <section className="rounded-2xl border border-red-200 bg-white py-20 text-center shadow-md">
          <AlertCircle className="mx-auto mb-4 size-12 text-red-400" />
          <h1 className="text-lg font-bold text-slate-700">Falha ao consultar submissão</h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">{errorLaw}</p>
        </section>
      ) : (
        <>
          <section className="rounded-2xl bg-linear-to-r from-[#1e3a5f] to-[#2d5a8c] p-6 text-white shadow-lg">
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

              {loadingAnalysis ? (
                <section className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-12 text-sm font-semibold text-slate-600 shadow-md">
                  <Loader2 className="size-5 animate-spin text-[#1e3a5f]" />
                  Analisando qualidade legislativa do texto...
                </section>
              ) : errorAnalysis ? (
                <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
                  <div className="mb-1 flex items-center gap-2 font-bold text-amber-800">
                    <AlertTriangle className="size-5" />
                    <h3>Análise de Qualidade Indisponível</h3>
                  </div>
                  <p className="text-sm text-slate-600">{errorAnalysis}</p>
                </section>
              ) : analysis ? (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
                  <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-800">
                    <BarChart3 className="size-5 text-[#1e3a5f]" />
                    Análise de Qualidade Legislativa
                  </h2>
                  <div className="mb-6 flex flex-col items-center justify-center gap-6 border-b border-slate-100 pb-6 sm:flex-row sm:justify-around">
                    <RadialProgress value={scorePercent} label="Score de Qualidade" />
                    <div className="text-center sm:text-left">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Classificação</p>
                      <p className="mt-1 text-xl font-bold text-slate-800">
                        {classifyScore(analysis.score)}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Modelo {analysis.model_version}
                        {analysis.cached ? " - resultado em cache" : ""}
                      </p>
                    </div>
                  </div>
                  <p className="mb-3 text-xs text-slate-500">
                    As métricas indicam a probabilidade de problema detectado em cada categoria.
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {metrics.length > 0 ? (
                      metrics.map(([code, value]) => (
                        <div key={code} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase text-slate-500">
                            {formatMetricName(code)}
                          </p>
                          <p className="mt-2 text-2xl font-bold text-slate-800">
                            {formatProbability(value)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600 sm:col-span-2">
                        Nenhuma métrica detalhada foi retornada para esta análise.
                      </p>
                    )}
                  </div>
                  <div className="mt-6 space-y-3">
                    <h3 className="text-sm font-bold uppercase text-slate-500">Alertas</h3>
                    {analysis.warnings.length > 0 ? (
                      analysis.warnings.map((warning) => (
                        <div
                          key={warningKey(warning)}
                          className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700"
                        >
                          <p className="font-semibold text-amber-800">
                            {formatMetricName(warning.code)} - {formatProbability(warning.confidence)}
                          </p>
                          <p className="mt-1">{warning.message}</p>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                        Nenhum alerta acima do limiar foi identificado.
                      </p>
                    )}
                  </div>
                </section>
              ) : null}
            </div>

            <aside className="space-y-6">
              {analysis && !loadingAnalysis && !errorAnalysis ? (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-md">
                  <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                    Pontuação Obtida
                  </p>
                  <span
                    className={`inline-block rounded-full border-2 px-8 py-7 text-5xl font-black ${getScoreColorClass(scorePercent)}`}
                  >
                    {scorePercent}
                  </span>
                  <p className="mt-4 text-xs text-slate-500">
                    A cor reflete a qualidade estimada pelo classificador.
                  </p>
                </section>
              ) : (
                <section className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-slate-700">
                  <FileText className="mt-0.5 size-5 shrink-0 text-[#1e3a5f]" />
                  Aguardando o processamento dos indicadores de qualidade do documento.
                </section>
              )}
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
