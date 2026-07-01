export type WarningCode = "ambiguidade" | "vagueza" | "falta_referencia" | "inconsistencia";
export type DocumentType = "bill" | "amendment";

export interface Warning {
  code: WarningCode;
  message: string;
  snippet: string;
  confidence: number;
}

export interface AnalysisResponse {
  analysis_id: string;
  text: string;
  type: DocumentType;
  score: number;
  cached: boolean;
  metrics: Record<WarningCode, number>;
  warnings: Warning[];
  model_version: string;
}

export interface UseAnalysisState {
  data: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
  analyze: (text: string, type: DocumentType) => Promise<void>;
}

export interface WarningsSidebarProps {
  warnings: Warning[];
  isLoading?: boolean;
  error?: string | null;
  onWarningClick?: (warning: Warning) => void;
  onWarningHover?: (warning: Warning | null) => void;
  contentContainerId?: string;
}

export interface WarningCardProps {
  warning: Warning;
  onSelect: (warning: Warning) => void;
  onHover?: (warning: Warning | null) => void;
}

export interface UseTextHighlightState {
  highlightText: (text: string, containerId?: string, preventScroll?: boolean, preventFadeOut?: boolean) => boolean;
  clearHighlight: () => void;
  isHighlighted: boolean;
}
