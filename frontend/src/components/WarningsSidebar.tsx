import React from "react";
import type { WarningsSidebarProps } from "@/types/analysis";
import { WarningCard } from "./WarningCard";
import { AlertCircle, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";

export const WarningsSidebar: React.FC<WarningsSidebarProps> = ({
  warnings,
  textContent,
  isLoading = false,
  error = null,
  onWarningClick,
  onWarningHover,
}) => {
  return (
    <aside className="w-full h-full flex flex-col border border-slate-200 rounded-2xl bg-slate-50 overflow-hidden shadow-sm">
      {/* Header do Sidebar */}
      <div className="p-5 border-b border-slate-200 bg-white">
        <h3 className="flex items-center gap-2 text-md font-bold text-slate-800">
          <ShieldAlert className="size-5 text-[#1e3a5f]" />
          Análise de Qualidade
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Identificação de problemas técnicos no texto da proposição.
        </p>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[600px] lg:max-h-none">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="size-8 text-[#1e3a5f] animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-700">Analisando texto legislativo...</p>
            <p className="text-xs text-slate-400 mt-1">Isso pode levar alguns segundos.</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-4 py-8 rounded-xl border border-red-200 bg-red-50 text-center">
            <AlertCircle className="size-10 text-red-500 mb-3" />
            <p className="text-sm font-bold text-slate-800">Falha ao analisar qualidade</p>
            <p className="text-xs text-red-600 mt-1.5 break-words max-w-xs">{error}</p>
          </div>
        ) : warnings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 rounded-xl border border-dashed border-slate-300 bg-white text-center">
            <CheckCircle2 className="size-12 text-green-500 mb-3 animate-pulse" />
            <p className="text-sm font-bold text-slate-800">Nenhum problema identificado</p>
            <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
              O texto legislativo está em conformidade com as diretrizes de qualidade.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-1">
              <span>{warnings.length} {warnings.length === 1 ? "problema identificado" : "problemas identificados"}</span>
            </div>
            {warnings.map((warning, index) => (
              <WarningCard
                key={`${warning.code}-${index}`}
                warning={warning}
                onSelect={(w) => onWarningClick?.(w)}
                onHover={(w) => onWarningHover?.(w)}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
