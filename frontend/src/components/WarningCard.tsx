import React from "react";
import type { WarningCardProps } from "@/types/analysis";
import { AlertTriangle, HelpCircle, Link2, AlertOctagon } from "lucide-react";

const getCategoryDetails = (code: string) => {
  switch (code) {
    case "ambiguidade":
      return {
        label: "Ambiguidade",
        icon: AlertTriangle,
        badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200",
      };
    case "vagueza":
      return {
        label: "Vagueza",
        icon: HelpCircle,
        badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-200",
      };
    case "falta_referencia":
      return {
        label: "Falta de Referência",
        icon: Link2,
        badgeClass: "bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-200",
      };
    case "inconsistencia":
      return {
        label: "Inconsistência",
        icon: AlertOctagon,
        badgeClass: "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-200",
      };
    default:
      return {
        label: code.charAt(0).toUpperCase() + code.slice(1),
        icon: AlertTriangle,
        badgeClass: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
      };
  }
};

export const WarningCard: React.FC<WarningCardProps> = ({ warning, onSelect, onHover }) => {
  const { code, message, snippet, confidence } = warning;
  const details = getCategoryDetails(code);
  const IconComponent = details.icon;

  const truncateSnippet = (text: string, maxLength = 100) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const confidencePercentage = confidence ? Math.round(confidence * 100) : 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(warning)}
      onMouseEnter={() => onHover?.(warning)}
      onMouseLeave={() => onHover?.(null)}
      className="w-full text-left flex flex-col gap-2 p-4 rounded-xl border border-border bg-card transition-all duration-200 hover:bg-muted/30 hover:shadow-md focus:outline-hidden focus:ring-2 focus:ring-primary/40 cursor-pointer"
      aria-label={`Problema de qualidade: ${details.label}. Descrição: ${message}. Confiança: ${confidencePercentage}%. Trecho afetado: ${snippet}`}
    >
      <div className="flex items-center justify-between w-full">
        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold ${details.badgeClass}`}>
          <IconComponent className="size-3.5" />
          {details.label}
        </span>
        <span className="text-xs font-bold text-foreground">{confidencePercentage}%</span>
      </div>

      {message && <p className="text-sm font-semibold text-foreground leading-snug">{message}</p>}

      {snippet && (
        <div className="w-full bg-muted/60 border-l-2 border-border p-2 rounded-r-md">
          <p className="text-xs font-serif italic text-muted-foreground leading-relaxed whitespace-pre-wrap">
            &quot;{truncateSnippet(snippet)}&quot;
          </p>
        </div>
      )}
    </button>
  );
};