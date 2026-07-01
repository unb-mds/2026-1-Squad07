import React from "react";
import type { WarningCardProps } from "@/types/analysis";
import { AlertTriangle, HelpCircle, Link2, AlertOctagon } from "lucide-react";

const getCategoryDetails = (code: string) => {
  switch (code) {
    case "ambiguidade":
      return {
        label: "Ambiguidade",
        icon: AlertTriangle,
        colorClass: "text-amber-500 bg-amber-50 border-amber-200",
        badgeClass: "bg-amber-100 text-amber-800",
      };
    case "vagueza":
      return {
        label: "Vagueza",
        icon: HelpCircle,
        colorClass: "text-blue-500 bg-blue-50 border-blue-200",
        badgeClass: "bg-blue-100 text-blue-800",
      };
    case "falta_referencia":
      return {
        label: "Falta de Referência",
        icon: Link2,
        colorClass: "text-purple-500 bg-purple-50 border-purple-200",
        badgeClass: "bg-purple-100 text-purple-800",
      };
    case "inconsistencia":
      return {
        label: "Inconsistência",
        icon: AlertOctagon,
        colorClass: "text-red-500 bg-red-50 border-red-200",
        badgeClass: "bg-red-100 text-red-800",
      };
    default:
      return {
        label: code.charAt(0).toUpperCase() + code.slice(1),
        icon: AlertTriangle,
        colorClass: "text-slate-500 bg-slate-50 border-slate-200",
        badgeClass: "bg-slate-100 text-slate-800",
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
      className="w-full text-left flex flex-col gap-2 p-4 rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:border-slate-400 hover:shadow-md focus:outline-hidden focus:ring-2 focus:ring-[#1e3a5f]/50 cursor-pointer"
      aria-label={`Problema de qualidade: ${details.label}. Descrição: ${message}. Confiança: ${confidencePercentage}%. Trecho afetado: ${snippet}`}
    >
      <div className="flex items-center justify-between w-full">
        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold ${details.badgeClass}`}>
          <IconComponent className="size-3.5" />
          {details.label}
        </span>
        <span className="text-xs font-bold text-slate-500">{confidencePercentage}%</span>
      </div>

      {message && <p className="text-sm font-semibold text-slate-800 leading-snug">{message}</p>}

      {snippet && (
        <div className="w-full bg-slate-50 border-l-2 border-slate-300 p-2 rounded-r-md">
          <p className="text-xs font-serif italic text-slate-600 leading-relaxed whitespace-pre-wrap">
            &quot;{truncateSnippet(snippet)}&quot;
          </p>
        </div>
      )}
    </button>
  );
};
