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
import { getLaw, type CreatedLaw } from "@/lib/api/laws";

// Interface baseada nos requisitos da issue para o endpoint de legibilidade
interface ReadabilityResponse {
  score: number;          // 0-100
  classification: string;  // Classificação textual
  wordsCount: number;      // Número de palavras
  sentencesCount: number;  // Número de frases
  averageSyllables: number;// Sílabas médias
}

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

export default function LawDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  
  // Estados da Lei Persistida
  const [law, setLaw] = useState<CreatedLaw | null>(null);
  const [loadingLaw, setLoadingLaw] = useState(true);
  const [errorLaw, setErrorLaw] = useState("");

  // Estados do Endpoint de Legibilidade
  const [readability, setReadability] = useState<ReadabilityResponse | null>(null);
  const [loadingReadability, setLoadingReadability] = useState(false);
  const [errorReadability, setErrorReadability] = useState("");

  // Efeito 1: Carregar dados básicos da lei
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

  // Efeito 2: Chamar o endpoint de legibilidade ao carregar os dados da lei
  useEffect(() => {
    if (!law) return;
    
    // CORREÇÃO TS(18047): Armazena o texto numa constante local para garantir o narrowing do tipo
    const currentText = law.text;
    let active = true;

    async function fetchReadability() {
      setLoadingReadability(true);
      setErrorReadability("");

      try {
        // Chamada real para o endpoint especificado: POST /api/v1/laws/readability
        const response = await fetch("/api/v1/laws/readability", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ lawId: params.id, text: currentText }),
        });

        if (!response.ok) {
          throw new Error("Erro na resposta do servidor de análise.");
        }

        const data: ReadabilityResponse = await response.json();

        if (active) {
          setReadability(data);
        }
      } catch (requestError) {
        if (active) {
          setErrorReadability(
            apiErrorMessage(
              requestError,
              "Não foi possível calcular as métricas de legibilidade no momento.",
            ),
          );
        }
      } finally {
        if (active) {
          setLoadingReadability(false);
        }
      }
    }

    void fetchReadability();
    return () => {
      active = false;
    };
  }, [law, params.id]);

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
          {/* Cabeçalho da Lei - CORREÇÃO TAILWIND V4 (bg-linear-to-r) */}
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
            {/* Coluna Principal: Conteúdo da lei */}
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

              {/* Seção Dinâmica de Análise de Legibilidade (Issue #136) */}
              {loadingReadability ? (
                <section className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-12 text-sm font-semibold text-slate-600 shadow-md">
                  <Loader2 className="size-5 animate-spin text-[#1e3a5f]" />
                  Analisando legibilidade do texto...
                </section>
              ) : errorReadability ? (
                <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
                  <div className="flex gap-2 items-center text-amber-800 font-bold mb-1">
                    <AlertTriangle className="size-5" />
                    <h3>Análise de Legibilidade Indisponível</h3>
                  </div>
                  <p className="text-sm text-slate-600">{errorReadability}</p>
                </section>
              ) : readability ? (
                <>
                  {/* Métricas e Barra Visual */}
                  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
                    <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-800">
                      <BarChart3 className="size-5 text-[#1e3a5f]" />
                      Métricas de Legibilidade Real
                    </h2>
                    
                    <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:justify-around border-b border-slate-100 pb-6 mb-6">
                      {/* Barra visual de progresso (RadialProgress) */}
                      <RadialProgress value={readability.score} label="Score de Legibilidade" />
                      
                      <div className="text-center sm:text-left">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Classificação</p>
                        <p className="text-xl font-bold text-slate-800 mt-1">{readability.classification}</p>
                      </div>
                    </div>

                    {/* Breakdown em Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Palavras</p>
                        <p className="mt-2 text-2xl font-bold text-slate-800">{readability.wordsCount}</p>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Frases</p>
                        <p className="mt-2 text-2xl font-bold text-slate-800">{readability.sentencesCount}</p>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Sílabas Médias</p>
                        <p className="mt-2 text-2xl font-bold text-slate-800">
                          {readability.averageSyllables.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </section>
                </>
              ) : null}
            </div>

            {/* Lateral (Aside): Score Destacado por faixa de cor */}
            <aside className="space-y-6">
              {readability && !loadingReadability && !errorReadability ? (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-md">
                  <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                    Pontuação Obtida
                  </p>
                  <span
                    className={`inline-block rounded-full px-8 py-7 text-5xl font-black border-2 ${getScoreColorClass(readability.score)}`}
                  >
                    {readability.score}
                  </span>
                  <p className="mt-4 text-xs text-slate-500">
                    A cor reflete o nível de complexidade textual analisado.
                  </p>
                </section>
              ) : (
                <section className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-slate-700">
                  <FileText className="mt-0.5 size-5 shrink-0 text-[#1e3a5f]" />
                  Aguardando o processamento dos indicadores de legibilidade do documento.
                </section>
              )}
            </aside>
          </div>
        </>
      )}
    </div>
  );
}