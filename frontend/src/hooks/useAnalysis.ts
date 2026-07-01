import { useState, useCallback } from "react";
import { apiRequest, apiErrorMessage } from "@/lib/api/client";
import type { AnalysisResponse, DocumentType, Warning, WarningCode } from "@/types/analysis";

const KEYWORDS_BY_CODE: Record<WarningCode, string[]> = {
  ambiguidade: ["regime especial", "a critério", "julgar necessário", "cabíveis", "competente", "poderá", "regulamento"],
  vagueza: ["adequado", "razoável", "eficiente", "interesse público", "se necessário", "conveniente", "justo"],
  falta_referencia: ["lei", "decreto", "inciso anterior", "artigo anterior", "parágrafo único", "art.", "conforme"],
  inconsistencia: ["salvo", "exceto", "contrário", "não obstante", "no que couber", "todavia"],
};

function deriveSnippet(text: string, code: WarningCode): string {
  const keywords = KEYWORDS_BY_CODE[code] || [];
  for (const keyword of keywords) {
    const index = text.toLowerCase().indexOf(keyword.toLowerCase());
    if (index !== -1) {
      let start = Math.max(0, index - 15);
      let end = Math.min(text.length, index + keyword.length + 25);

      // Ajusta o início para não cortar palavras (retrocede até um espaço ou início do texto)
      while (start > 0 && text[start - 1] !== " " && text[start - 1] !== "\n") {
        start--;
      }

      // Ajusta o fim para não cortar palavras (avança até um espaço, pontuação ou fim do texto)
      while (end < text.length && text[end] !== " " && text[end] !== "\n" && text[end] !== "." && text[end] !== ",") {
        end++;
      }

      return text.substring(start, end).trim();
    }
  }
  
  // Fallback: pega os primeiros 50 caracteres sem cortar a última palavra
  let fallbackEnd = Math.min(text.length, 50);
  while (fallbackEnd < text.length && text[fallbackEnd] !== " " && text[fallbackEnd] !== "\n") {
    fallbackEnd++;
  }
  return text.substring(0, fallbackEnd).trim();
}

interface RawWarning {
  code: string;
  message: string;
  confidence: number;
  snippet?: string;
}

interface RawAnalysisResponse {
  analysis_id: string;
  text?: string;
  type?: string;
  score?: number;
  cached?: boolean;
  metrics?: Record<string, number>;
  warnings?: RawWarning[];
}

export const useAnalysis = (lawId?: string) => {
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (text: string, type: DocumentType) => {
    if (!text || text.trim().length === 0) {
      setError("Texto não pode ser vazio.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Faz chamada POST para /api/v1/analysis/evaluate
      const response = await apiRequest<RawAnalysisResponse>("/api/v1/analysis/evaluate", {
        method: "POST",
        body: JSON.stringify({
          text,
          type,
          ...(lawId && { lawId }),
        }),
      });

      // Se a resposta contiver warnings, garante que todos possuam o campo snippet
      const warnings: Warning[] = (response.warnings || []).map((w: RawWarning) => {
        const snippet = w.snippet || deriveSnippet(text, w.code as WarningCode);
        return {
          code: w.code as WarningCode,
          message: w.message,
          confidence: w.confidence,
          snippet,
        };
      });

      const updatedData: AnalysisResponse = {
        analysis_id: response.analysis_id,
        text: response.text || text,
        type: response.type || type,
        score: response.score ?? 0,
        cached: response.cached ?? false,
        metrics: response.metrics || {},
        warnings,
      };

      setData(updatedData);
    } catch (err) {
      setError(
        apiErrorMessage(
          err,
          "Não foi possível calcular as análises de qualidade no momento."
        )
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [lawId]);

  return { data, loading, error, analyze };
};
