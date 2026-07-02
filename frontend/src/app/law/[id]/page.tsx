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
  Sparkles,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { RadialProgress } from "@/components/RadialProgress";
import { apiErrorMessage } from "@/lib/api/client";
import {
  getLaw,
  getLawSummary,
  type AnalysisWarning,
  type CreatedLaw,
} from "@/lib/api/laws";
import { WarningsSidebar } from "@/components/WarningsSidebar";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useTextHighlight } from "@/hooks/useTextHighlight";
import type { Warning } from "@/types/analysis";

function formattedDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getScoreColorClass(score: number): string {
  if (score >= 70) return "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/30";
  if (score >= 40) return "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/30";
  return "bg-[var(--error)]/10 text-[var(--error)] border-[var(--error)]/30";
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
  const id = params?.id ?? "";
  const [law, setLaw] = useState<CreatedLaw | null>(null);
  const [loadingLaw, setLoadingLaw] = useState(true);
  const [errorLaw, setErrorLaw] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [errorSummary, setErrorSummary] = useState("");
  const { data: analysis, loading: loadingAnalysis, error: errorAnalysis, analyze } = useAnalysis(params.id);
  const { highlightText, clearHighlight } = useTextHighlight();
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleWarningClick = (warning: Warning) => {
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }
    const success = highlightText(warning.snippet, "law-content");
    if (success) {
      highlightTimeoutRef.current = setTimeout(() => {
        clearHighlight();
        highlightTimeoutRef.current = null;
      }, 2000);
    }
  };

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const handleWarningHover = (warning: Warning | null) => {
    if (warning) {
      highlightText(warning.snippet, "law-content", true, true);
    } else {
      clearHighlight();
    }
  };

  useEffect(() => {
    let active = true;

    async function loadLaw() {
      setLoadingLaw(true);
      setErrorLaw("");
      try {
        const persistedLaw = await getLaw(id);
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
  }, [id]);

  useEffect(() => {
    if (!law) return;

    let active = true;

    async function fetchSummary() {
      setLoadingSummary(true);
      setErrorSummary("");
      setSummary(null);
      try {
        const persistedSummary = await getLawSummary(id);
        if (active) {
          setSummary(persistedSummary);
        }
      } catch (requestError) {
        if (active) {
          setErrorSummary(
            apiErrorMessage(
              requestError,
              "Não foi possível carregar o resumo explicativo no momento.",
            ),
          );
        }
      } finally {
        if (active) {
          setLoadingSummary(false);
        }
      }
    }

    void fetchSummary();
    return () => {
      active = false;
    };
  }, [law, id]);

  const scorePercent = scoreToPercent(analysis?.score ?? null);
  const metrics = analysis ? Object.entries(analysis.metrics) : [];
  const summaryToShow = analysis?.summary || summary;

  useEffect(() => {
    if (!law) return;
    void analyze(law.text, "bill");
  }, [law, analyze]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar às submissões
      </button>

      {loadingLaw ? (
        <section className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-card py-20 text-sm font-semibold text-muted-foreground shadow-md">
          <Loader2 className="size-5 animate-spin text-primary" />
          Carregando submissão persistida...
        </section>
      ) : errorLaw || !law ? (
        <section className="rounded-2xl border border-destructive/30 bg-card py-20 text-center shadow-md">
          <AlertCircle className="mx-auto mb-4 size-12 text-destructive" />
          <h1 className="text-lg font-bold text-foreground">Falha ao consultar submissão</h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">{errorLaw}</p>
        </section>
      ) : (
        <>
          <section className="rounded-2xl bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8c] dark:bg-none dark:bg-card dark:border dark:border-border p-6 text-white shadow-lg">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-200 dark:text-muted-foreground">
              Submissão Persistida
            </p>
            <h1 className="text-2xl font-bold leading-snug dark:text-foreground">{law.title}</h1>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-blue-100 dark:text-muted-foreground">
              {law.lawNumber && (
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 dark:bg-muted px-3 py-1.5">
                  <Hash className="size-4" />
                  {law.lawNumber}
                </span>
              )}
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 dark:bg-muted px-3 py-1.5">
                <CalendarDays className="size-4" />
                Registrada em {formattedDate(law.createdAt)}
              </span>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="rounded-2xl border border-border bg-card p-6 shadow-md">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                  <Sparkles className="size-5 text-purple-500" />
                  Resumo Explicativo por IA
                </h2>
                {loadingSummary ? (
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-muted p-4 text-sm font-semibold text-muted-foreground">
                    <Loader2 className="size-4 animate-spin text-purple-500" />
                    Gerando resumo explicativo...
                  </div>
                ) : errorSummary ? (
                  <div className="rounded-xl border border-[var(--warning)]/20 bg-[var(--warning)]/10 p-4">
                    <p className="text-sm font-semibold text-[var(--warning)]">
                      Resumo indisponível no momento.
                    </p>
                    <p className="mt-1 text-sm text-[var(--warning)]/80">{errorSummary}</p>
                  </div>
                ) : !summaryToShow ? (
                  <div className="rounded-xl border border-[var(--warning)]/20 bg-[var(--warning)]/10 p-4">
                    <p className="text-sm text-[var(--warning)]">
                      Resumo indisponível ou ainda não processado para este documento legislativo.
                    </p>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-muted-foreground">
                    {summaryToShow}
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-border bg-card p-6 shadow-md">
                <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-foreground">
                  <BookOpen className="size-5 text-primary" />
                  Texto Armazenado
                </h2>
                <div id="law-content" className="whitespace-pre-wrap font-serif text-[15px] leading-loose text-foreground/90">
                  {law.text}
                </div>
              </section>

              {loadingAnalysis ? (
                <section className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-card py-12 text-sm font-semibold text-muted-foreground shadow-md">
                  <Loader2 className="size-5 animate-spin text-primary" />
                  Analisando qualidade legislativa do text...
                </section>
              ) : errorAnalysis ? (
                <section className="rounded-2xl border border-[var(--warning)]/20 bg-[var(--warning)]/10 p-6 shadow-sm">
                  <div className="mb-1 flex items-center gap-2 font-bold text-[var(--warning)]">
                    <AlertTriangle className="size-5" />
                    <h3>Análise de Qualidade Indisponível</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{errorAnalysis}</p>
                </section>
              ) : analysis ? (
                <section className="rounded-2xl border border-border bg-card p-6 shadow-md">
                  <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-foreground">
                    <BarChart3 className="size-5 text-primary" />
                    Análise de Qualidade Legislativa
                  </h2>
                  <div className="mb-6 flex flex-col items-center justify-center gap-6 border-b border-border pb-6 sm:flex-row sm:justify-around">
                    <RadialProgress value={scorePercent} label="Score de Qualidade" />
                    <div className="text-center sm:text-left">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Classificação</p>
                      <p className="mt-1 text-xl font-bold text-foreground">
                        {classifyScore(analysis.score)}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Modelo {analysis.model_version}
                        {analysis.cached ? " - resultado em cache" : ""}
                      </p>
                    </div>
                  </div>
                  <p className="mb-3 text-xs text-muted-foreground">
                    As métricas indicam a probabilidade de problema detectado em cada categoria.
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {metrics.length > 0 ? (
                      metrics.map(([code, value]) => (
                        <div key={code} className="rounded-xl border border-border bg-muted p-4">
                          <p className="text-xs font-semibold uppercase text-muted-foreground">
                            {formatMetricName(code)}
                          </p>
                          <p className="mt-2 text-2xl font-bold text-foreground">
                            {formatProbability(value)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-xl border border-border bg-muted p-4 text-sm text-muted-foreground sm:col-span-2">
                        Nenhuma métrica detalhada foi retornada para esta análise.
                      </p>
                    )}
                  </div>
                  <div className="mt-6 space-y-3">
                    <h3 className="text-sm font-bold uppercase text-muted-foreground">Alertas</h3>
                    {analysis.warnings.length > 0 ? (
                      analysis.warnings.map((warning) => (
                        <div
                          key={warningKey(warning)}
                          className="rounded-xl border border-[var(--warning)]/20 bg-[var(--warning)]/10 p-4 text-sm text-foreground/90"
                        >
                          <p className="font-semibold text-[var(--warning)]">
                            {formatMetricName(warning.code)} - {formatProbability(warning.confidence)}
                          </p>
                          <p className="mt-1">{warning.message}</p>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-xl border border-[var(--success)]/20 bg-[var(--success)]/10 p-4 text-sm text-[var(--success)]">
                        Nenhum alerta acima do limiar foi identificado.
                      </p>
                    )}
                  </div>
                </section>
              ) : null}
            </div>

            <aside className="space-y-6">
              {analysis && !loadingAnalysis && !errorAnalysis ? (
                <section className="rounded-2xl border border-border bg-card p-6 text-center shadow-md">
                  <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Pontuação Obtida
                  </p>
                  <span
                    className={`inline-block rounded-full border-2 px-8 py-7 text-5xl font-black ${getScoreColorClass(scorePercent)}`}
                  >
                    {scorePercent}
                  </span>
                  <p className="mt-4 text-xs text-muted-foreground">
                    A cor reflete a qualidade estimada pelo classificador.
                  </p>
                </section>
              ) : (
                <section className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
                  <FileText className="mt-0.5 size-5 shrink-0 text-primary" />
                  Aguardando o processamento dos indicadores de qualidade do documento.
                </section>
              )}

              {law && (
                <WarningsSidebar
                  warnings={analysis?.warnings || []}
                  isLoading={loadingAnalysis}
                  error={errorAnalysis}
                  onWarningClick={handleWarningClick}
                  onWarningHover={handleWarningHover}
                />
              )}
            </aside>
          </div>
        </>
      )}
    </div>
  );
}