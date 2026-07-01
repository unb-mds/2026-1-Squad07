# Implementation Plan: Sidebar de Warnings — R1

**Spec**: [spec.md](spec.md)
**Data**: 2026-06-30

## Objetivo do Plano

Estruturar a implementação do componente `WarningsSidebar`, definir arquitetura, identificar reutilização de código e estabelecer ordem de execução das tarefas.

## Decisões Arquiteturais

### D1: Separação de Responsabilidades (SoC)

**Decisão**: Criar componentes e hooks separados:

1. **`WarningsSidebar.tsx`**: Componente de apresentação (renderiza lista de cards).
2. **`WarningCard.tsx`**: Card individual (reutilizável).
3. **`useTextHighlight.ts`**: Hook customizado para buscar e destacar trechos no DOM.
4. **`useAnalysis.ts`**: Hook para chamar `POST /api/v1/analysis/evaluate` e gerenciar estado.

**Justificativa**: 
- Cada componente tem uma responsabilidade clara.
- Hooks reutilizáveis em outras partes do app (ex: diff de leis).
- Facilita testes isolados.

### D2: Estado Global vs Local

**Decisão**: Estado local para warnings + API. Sem Redux/Zustand na R1.

**Justificativa**:
- Sidebar é isolado na página `/law/[id]`.
- Dados não são compartilhados com outras páginas.
- React hooks suficientes para R1.
- Se necessário escalabilidade em R2, migrar para Context ou Redux.

### D3: Chamada à API

**Decisão**: Chamar `POST /api/v1/analysis/evaluate` no `useEffect` de `LawDetail`.

**Justificativa**:
- Análise deve ser feita uma vez ao carregar a página.
- Evita requisições duplicadas com `useCallback` e dependência no array.
- Se `lawId` está disponível, incluir no payload para persistência (REQ-005).

### D4: Highlight Temporário

**Decisão**: Usar `setTimeout` + classe CSS `.highlight` para highlight de 2s com fade-out.

**Justificativa**:
- Simples, sem dependências adicionais.
- Controle fino via CSS (transição `opacity`).
- Testável com `jest.useFakeTimers()`.

Alternativa rejeitada: Usar library de highlight (ex: `react-highlight-words`) — complexa demais para R1.

### D5: Responsividade

**Decisão**: 
- Desktop (≥ 1024px): Sidebar fixo na lateral (30% de largura).
- Tablet (768px–1023px): Sidebar reduzido (20%) ou em drawer.
- Mobile (< 768px): Drawer/modal com botão toggle.

**Justificativa**:
- Sidebar fixo é padrão em análise legislativa.
- Mobile com drawer evita overflow de conteúdo.
- Usar Tailwind breakpoints existentes no projeto.

## Estrutura de Pastas

```
frontend/src/
├── components/
│   ├── WarningsSidebar.tsx          # Componente principal
│   ├── WarningCard.tsx              # Card individual
│   └── __tests__/
│       ├── WarningsSidebar.test.tsx
│       ├── WarningCard.test.tsx
│       └── useTextHighlight.test.ts
├── hooks/
│   ├── useTextHighlight.ts          # Hook de highlight
│   ├── useAnalysis.ts               # Hook de API
│   └── __tests__/
│       └── useAnalysis.test.ts
├── app/
│   └── law/
│       └── [id]/
│           └── page.tsx             # Integração em LawDetail
```

## Fluxo de Dados

```
┌─────────────────────────────────────────────────────────┐
│ page.tsx (/law/[id])                                    │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ useEffect → POST /api/v1/analysis/evaluate          │ │
│ │ (chamar useAnalysis hook)                           │ │
│ └─────────────────────────────────────────────────────┘ │
│            ↓ { warnings, error, loading }               │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ <WarningsSidebar warnings={warnings} />             │ │
│ │                                                     │ │
│ │ Renderiza: [Card 1] [Card 2] [Card 3]             │ │
│ │           ou "Nenhum problema identificado"         │ │
│ │           ou "Erro ao carregar análise"             │ │
│ └─────────────────────────────────────────────────────┘ │
│            ↓ onClick card                                │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ useTextHighlight (hook)                             │ │
│ │ - Scroll até snippet                                │ │
│ │ - Highlight por 2s                                 │ │
│ │ - Fade-out automático                              │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Componentes e Interfaces

### WarningsSidebar.tsx

```typescript
interface Warning {
  code: string;           // ex: "ambiguidade"
  message: string;        // ex: "Termo não definido"
  snippet: string;        // Trecho problematico
  confidence: number;     // 0.0–1.0
}

interface WarningsSidebarProps {
  warnings: Warning[];
  isLoading?: boolean;
  error?: string | null;
  onWarningClick?: (warning: Warning) => void;
  textContent: string;    // Texto completo para busca
}

export const WarningsSidebar: React.FC<WarningsSidebarProps> = ({ ... }) => {
  return (
    <aside className="warnings-sidebar">
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!isLoading && !error && warnings.length === 0 && <EmptyState />}
      {!isLoading && !error && warnings.length > 0 && (
        <div className="warnings-list">
          {warnings.map((w) => (
            <WarningCard key={w.code} warning={w} onSelect={onWarningClick} />
          ))}
        </div>
      )}
    </aside>
  );
};
```

### WarningCard.tsx

```typescript
interface WarningCardProps {
  warning: Warning;
  onSelect: (warning: Warning) => void;
}

export const WarningCard: React.FC<WarningCardProps> = ({ warning, onSelect }) => {
  return (
    <button
      className="warning-card"
      onClick={() => onSelect(warning)}
      aria-label={`Problema: ${warning.code} - ${warning.message}`}
    >
      <h4 className="card-code">{warning.code}</h4>
      <p className="card-message">{warning.message}</p>
      <p className="card-snippet">{truncate(warning.snippet, 100)}</p>
      <span className="card-confidence">{Math.round(warning.confidence * 100)}%</span>
    </button>
  );
};
```

### useTextHighlight.ts

```typescript
export const useTextHighlight = () => {
  const [isHighlighted, setIsHighlighted] = useState(false);

  const highlightText = useCallback((text: string, containerId: string = "law-content") => {
    const container = document.getElementById(containerId);
    if (!container) return false;

    const regex = new RegExp(`(${escapeRegex(text)})`, "gi");
    const content = container.textContent || "";

    if (!content.includes(text)) return false;

    const span = container.querySelector("span");
    if (span) {
      span.innerHTML = content.replace(regex, "<mark class='highlight'>$1</mark>");
    }

    setIsHighlighted(true);
    return true;
  }, []);

  const clearHighlight = useCallback(() => {
    const marks = document.querySelectorAll("mark.highlight");
    marks.forEach((mark) => {
      const parent = mark.parentElement;
      if (parent) {
        parent.innerHTML = mark.textContent || "";
      }
    });
    setIsHighlighted(false);
  }, []);

  return { highlightText, clearHighlight, isHighlighted };
};
```

### useAnalysis.ts

```typescript
interface AnalysisResponse {
  analysis_id: string;
  warnings: Warning[];
  score: number;
  cached: boolean;
  metrics: Record<string, number>;
}

export const useAnalysis = (lawId?: number) => {
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (text: string, type: "bill" | "amendment") => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/analysis/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, type, ...(lawId && { lawId }) }),
        signal: AbortSignal.timeout(10000), // 10s timeout
      });

      if (!response.ok) throw new Error(`Análise falhou: ${response.status}`);

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [lawId]);

  return { data, loading, error, analyze };
};
```

## Integração em LawDetail

Modificar `frontend/src/app/law/[id]/page.tsx`:

```typescript
export default function LawDetailPage({ params }: { params: { id: string } }) {
  const { data: law } = useLaw(parseInt(params.id));
  const { data: analysis, loading, error, analyze } = useAnalysis(law?.id);

  useEffect(() => {
    if (law?.content) {
      analyze(law.content, "bill");
    }
  }, [law?.id, law?.content, analyze]);

  if (!law) return <div>Lei não encontrada</div>;

  return (
    <div className="law-detail-container">
      <WarningsSidebar
        warnings={analysis?.warnings || []}
        isLoading={loading}
        error={error}
        textContent={law.content}
        onWarningClick={(warning) => {
          // Chamar scroll + highlight aqui
        }}
      />
      <main id="law-content" className="law-content">
        <h1>{law.title}</h1>
        <p>{law.content}</p>
      </main>
    </div>
  );
}
```

## Dependências

**Adições necessárias** (já existem no projeto):
- React (existing)
- React Testing Library (existing)
- Jest (existing)
- Tailwind CSS (existing)

**Sem novas dependências externas** na R1.

## Ordem de Implementação

1. **Criar `useTextHighlight.ts` + testes** (foundation).
2. **Criar `useAnalysis.ts` + testes** (foundation).
3. **Criar `WarningCard.tsx` + testes** (building block).
4. **Criar `WarningsSidebar.tsx` + testes** (componente principal).
5. **Integrar em `LawDetail`** (page.tsx).
6. **Testes de integração** (ponta-a-ponta).
7. **CSS responsivo** (Tailwind breakpoints).
8. **Validação manual** (navegação, highlighting, responsividade).
9. **PR e review**.

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|-------------|--------|-----------|
| API retorna schema diferente | Média | Alto | Validar schema em `useAnalysis` com Zod/TypeScript; adicionar fallback. |
| Highlight falha em HTML complexo | Média | Médio | Usar regex com escape; testar com textos reais legislativos. |
| Performance em textos muito longos | Baixa | Médio | Implementar virtualização em sidebar se warnings > 50 (R2). |
| Mobile responsividade quebrada | Média | Médio | Testar em breakpoints Tailwind durante desenvolvimento. |

## Status

- [x] Plano criado.
- [ ] Implementação iniciada (começar com testes unitários).
- [ ] PR aberto.
- [ ] Review e merge.
