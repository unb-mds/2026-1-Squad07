# Contracts: API e Tipos — Warnings Sidebar

**Spec**: [spec.md](spec.md)
**Plan**: [plan.md](plan.md)

## Contrato de API HTTP

### POST /api/v1/analysis/evaluate

Chamada assíncrona para analisar um texto legislativo com o LegalBERT-pt.

#### Requisição

```http
POST /api/v1/analysis/evaluate HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "text": "Art. 1º. Esta lei estabelece o regime especial de apoio.",
  "type": "bill",
  "lawId": 42
}
```

**Campos**:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `text` | string | ✓ | Texto legislativo a analisar (mínimo 1 caractere). |
| `type` | enum | ✓ | Tipo de documento: `"bill"` (projeto de lei) ou `"amendment"` (emenda). |
| `lawId` | integer | ✗ | ID da lei no banco. Quando informado, resultado é persistido. |

#### Resposta do Backend (200 OK)

> [!NOTE]
> **Divisão de Responsabilidade (Snippet Derivation)**:
> O backend do CrivoAI retorna a lista de alertas (`warnings`) sem o campo `snippet`. O campo `snippet` é derivado e injetado localmente pelo frontend (dentro do hook `useAnalysis`) a partir do texto original usando heurísticas de palavras-chave, atendendo ao contrato do componente visual. Os campos `text` e `type` na resposta do backend também são opcionais.

```json
{
  "analysis_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "score": 0.68,
  "cached": false,
  "metrics": {
    "ambiguidade": 0.92,
    "vagueza": 0.45,
    "falta_referencia": 0.78,
    "inconsistencia": 0.22
  },
  "warnings": [
    {
      "code": "ambiguidade",
      "message": "Termo 'regime especial' não é definido no artigo.",
      "confidence": 0.92
    },
    {
      "code": "falta_referencia",
      "message": "Referência cruzada incompleta ou não especificada.",
      "confidence": 0.78
    }
  ],
  "model_version": "legal-bert-pt@v0.1.0"
}
```

**Campos da resposta do Backend**:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `analysis_id` | UUID | ID único da análise. |
| `status` | string | Estado da análise (`"pending"`, `"completed"`, `"failed"`). |
| `score` | float (0.0–1.0) | Score geral de qualidade. |
| `cached` | boolean | Indica se resultado veio do cache. |
| `metrics` | object | Probabilidade por categoria: `{ "ambiguidade": 0.92, ... }`. |
| `warnings` | array | Array de problemas encontrados no backend (sem snippet). |
| `model_version` | string | Versão do modelo classificador utilizado. |
| `text` | string (opcional) | Texto legislativo analisado. |
| `type` | enum (opcional) | Tipo de documento legislativo. |

**Estrutura de Warning do Backend**:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `code` | string | Código único do problema (`"ambiguidade"`, `"vagueza"`, `"falta_referencia"`, `"inconsistencia"`). |
| `message` | string | Descrição legível do problema. |
| `confidence` | float (0.0–1.0) | Confiança da predição (ex: 0.92 = 92%). |
| *`snippet`* | *string* | **Não retornado pelo Backend**. Injetado localmente pelo Frontend no mapeamento de tipos. |

#### Respostas de Erro

**422 Unprocessable Entity** (validação):

```json
{
  "detail": [
    {
      "loc": ["body", "text"],
      "msg": "ensure this value has at least 1 characters",
      "type": "value_error.string.too_short"
    }
  ]
}
```

**500 Internal Server Error** (erro no modelo):

```json
{
  "detail": "Erro ao executar classificador: [mensagem de erro]"
}
```

---

## Tipos TypeScript

### Para uso no Frontend

```typescript
/**
 * Código do problema identificado
 */
export type WarningCode = "ambiguidade" | "vagueza" | "falta_referencia" | "inconsistencia";

/**
 * Tipo de documento legislativo
 */
export type DocumentType = "bill" | "amendment";

/**
 * Um problema identificado no texto
 */
export interface Warning {
  /** Código único do problema */
  code: WarningCode;

  /** Descrição legível do problema */
  message: string;

  /** Trecho do texto onde o problema foi encontrado */
  snippet: string;

  /** Confiança da predição (0.0 a 1.0) */
  confidence: number;
}

/**
 * Entrada para POST /api/v1/analysis/evaluate
 */
export interface AnalysisRequest {
  /** Texto legislativo a analisar */
  text: string;

  /** Tipo de documento */
  type: DocumentType;

  /** (Opcional) ID da lei no banco para persistência */
  lawId?: number;
}

/**
 * Saída de POST /api/v1/analysis/evaluate
 */
export interface AnalysisResponse {
  /** ID único da análise */
  analysis_id: string;

  /** Texto submetido (echo) */
  text: string;

  /** Tipo submetido (echo) */
  type: DocumentType;

  /** Score geral de qualidade (0.0 a 1.0) */
  score: number;

  /** Indica se resultado veio do cache */
  cached: boolean;

  /** Probabilidade por categoria */
  metrics: Record<WarningCode, number>;

  /** Array de problemas encontrados */
  warnings: Warning[];
}

/**
 * Estado do hook useAnalysis
 */
export interface UseAnalysisState {
  data: AnalysisResponse | null;
  loading: boolean;
  error: string | null;
  analyze: (text: string, type: DocumentType) => Promise<void>;
}

/**
 * Props do componente WarningsSidebar
 */
export interface WarningsSidebarProps {
  /** Array de warnings a exibir */
  warnings: Warning[];

  /** Texto completo para busca e highlighting */
  textContent: string;

  /** Indica se está carregando a análise */
  isLoading?: boolean;

  /** Mensagem de erro (se houver) */
  error?: string | null;

  /** Callback disparado ao clicar em um card */
  onWarningClick?: (warning: Warning) => void;

  /** ID do container contendo o texto (padrão: "law-content") */
  contentContainerId?: string;
}

/**
 * Props do componente WarningCard
 */
export interface WarningCardProps {
  /** Warning a renderizar */
  warning: Warning;

  /** Callback ao clicar no card */
  onSelect: (warning: Warning) => void;
}

/**
 * Estado do hook useTextHighlight
 */
export interface UseTextHighlightState {
  /** Função para destacar texto no DOM */
  highlightText: (text: string, containerId?: string) => boolean;

  /** Função para remover highlight */
  clearHighlight: () => void;

  /** Indica se há highlight ativo */
  isHighlighted: boolean;
}
```

### Exportar em `frontend/src/types/analysis.ts`

```typescript
// Re-export de tipos para uso centralizado
export type {
  Warning,
  WarningCode,
  DocumentType,
  AnalysisRequest,
  AnalysisResponse,
  UseAnalysisState,
  WarningsSidebarProps,
  WarningCardProps,
  UseTextHighlightState,
};
```

---

## Exemplos de Uso

### Uso do Hook useAnalysis

```typescript
import { useAnalysis } from "@/hooks/useAnalysis";

export function MyComponent() {
  const lawId = 42;
  const { data, loading, error, analyze } = useAnalysis(lawId);

  useEffect(() => {
    analyze(
      "Art. 1º. Esta lei estabelece o regime especial.",
      "bill"
    );
  }, [analyze]);

  if (loading) return <p>Analisando...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <div>
      <h2>Score: {data?.score.toFixed(2)}</h2>
      <ul>
        {data?.warnings.map((w) => (
          <li key={w.code}>{w.message}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Uso do Hook useTextHighlight

```typescript
import { useTextHighlight } from "@/hooks/useTextHighlight";

export function HighlightExample() {
  const { highlightText, clearHighlight } = useTextHighlight();

  const handleClick = () => {
    const found = highlightText("regime especial", "law-content");
    if (found) {
      setTimeout(() => clearHighlight(), 2000);
    }
  };

  return (
    <>
      <button onClick={handleClick}>Destacar "regime especial"</button>
      <div id="law-content">
        Art. 1º. Esta lei estabelece o regime especial de apoio.
      </div>
    </>
  );
}
```

### Uso do Componente WarningsSidebar

```typescript
import { WarningsSidebar } from "@/components/WarningsSidebar";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useTextHighlight } from "@/hooks/useTextHighlight";

export function LawAnalysisPage() {
  const lawId = 42;
  const lawContent = "Art. 1º. Esta lei estabelece...";

  const { data, loading, error, analyze } = useAnalysis(lawId);
  const { highlightText, clearHighlight } = useTextHighlight();

  useEffect(() => {
    analyze(lawContent, "bill");
  }, [analyze]);

  const handleWarningClick = (warning) => {
    const found = highlightText(warning.snippet, "law-content");
    if (found) {
      document.getElementById("law-content")?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => clearHighlight(), 2000);
    }
  };

  return (
    <div className="flex gap-4">
      <WarningsSidebar
        warnings={data?.warnings || []}
        textContent={lawContent}
        isLoading={loading}
        error={error}
        onWarningClick={handleWarningClick}
        contentContainerId="law-content"
      />
      <main id="law-content" className="flex-1">
        <h1>Lei</h1>
        <p>{lawContent}</p>
      </main>
    </div>
  );
}
```

---

## Status de Implementação

- [ ] Tipos TypeScript criados e validados.
- [ ] Componente WarningsSidebar integrado.
- [ ] Hooks implementados.
- [ ] Testes passando.
- [ ] Documentação em sincronia.
