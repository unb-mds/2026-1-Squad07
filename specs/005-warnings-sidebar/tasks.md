# Tasks: Sidebar de Warnings — R1

**Spec**: [spec.md](spec.md)  
**Plan**: [plan.md](plan.md)  
**Test Plan**: [test-plan.md](test-plan.md)  
**Data**: 2026-06-30

## Visão Geral

Tarefas ordenadas por dependência para implementar a sidebar de warnings. Testes devem ser escritos **antes** da implementação (TDD).

## Ordem de Execução

```
T001 (Setup Foundation)
  ↓
T002 (useTextHighlight - Tests)
  ↓
T003 (useTextHighlight - Impl)
  ↓
T004 (useAnalysis - Tests)
  ↓
T005 (useAnalysis - Impl)
  ↓
T006 (WarningCard - Tests)
  ↓
T007 (WarningCard - Impl)
  ↓
T008 (WarningsSidebar - Tests)
  ↓
T009 (WarningsSidebar - Impl)
  ↓
T010 (Integration Tests)
  ↓
T011 (Integration in LawDetail)
  ↓
T012 (CSS Responsivo)
  ↓
T013 (Validação Manual)
  ↓
T014 (PR e Review)
```

---

## Tarefas Detalhadas

### T001: Setup e Estrutura de Pastas

**Tipo**: Setup  
**Dependência**: Nenhuma  
**Prioridade**: P0  
**Esforço**: 0.5h  
**Descrição**: Criar estrutura de pastas e arquivos iniciais.

**Tarefas**:
- [ ] Criar pasta `frontend/src/hooks/` (se não existir).
- [ ] Criar pasta `frontend/src/hooks/__tests__/` (se não existir).
- [ ] Criar pasta `frontend/src/components/__tests__/` (se não existir).
- [ ] Criar branch `feat/issue-137-warnings-sidebar` e fazer commit inicial.
- [ ] Verificar que o projeto compila sem erros (`npm run build`).

**Critério de Aceite**:
- [ ] Branch criada e nenhum arquivo deletado.
- [ ] `npm run build` passa.

---

### T002: Testes do Hook useTextHighlight

**Tipo**: Teste (RED phase)  
**Dependência**: T001  
**Prioridade**: P1  
**Esforço**: 1.5h  
**Descrição**: Escrever testes unitários para o hook `useTextHighlight` antes de implementar.

**Arquivo**: `frontend/src/hooks/__tests__/useTextHighlight.test.ts`

**Testes a implementar** (referência: `test-plan.md` TDD-005 a TDD-008):

```typescript
describe("useTextHighlight", () => {
  // TDD-005: Happy path - hook retorna funções
  test("should return highlight and clear functions", () => {
    // Verificar que hook retorna { highlightText, clearHighlight, isHighlighted }
  });

  // TDD-006: Buscar e encontrar texto
  test("should find and highlight text in DOM", () => {
    // Setup: div com texto "Art. 1º..."
    // Chamar highlightText("Art.")
    // Verificar que <mark class="highlight"> é aplicado
  });

  // TDD-007: Limpar highlight
  test("should clear highlight after calling clearHighlight", () => {
    // Setup: após highlight aplicado
    // Chamar clearHighlight()
    // Verificar que <mark> é removido
  });

  // Teste adicional: texto não encontrado
  test("should return false if text is not found", () => {
    // Setup: div com "Art. 1º"
    // Chamar highlightText("§ 2º")
    // Verificar que retorna false
  });
});
```

**Critério de Aceite**:
- [ ] Arquivo criado e todos os testes falham (RED).
- [ ] Nenhuma implementação de `useTextHighlight` ainda.

---

### T003: Implementação do Hook useTextHighlight

**Tipo**: Implementação (GREEN + REFACTOR phases)  
**Dependência**: T002  
**Prioridade**: P1  
**Esforço**: 1.5h  
**Descrição**: Implementar `useTextHighlight` para passar nos testes.

**Arquivo**: `frontend/src/hooks/useTextHighlight.ts`

**Assinatura esperada**:
```typescript
export const useTextHighlight = () => {
  // ... implementação
  return {
    highlightText: (text: string, containerId?: string) => boolean,
    clearHighlight: () => void,
    isHighlighted: boolean,
  };
};
```

**Requisitos de implementação**:
- [ ] Usar `document.getElementById()` para acessar container.
- [ ] Usar regex com escape para buscar texto (evitar injeção).
- [ ] Aplicar classe CSS `.highlight` a textos encontrados.
- [ ] Gerenciar estado `isHighlighted` com `useState`.
- [ ] Usar `useCallback` para otimizar re-renders.
- [ ] Comentários explicando lógica de busca e replace.

**Teste após implementação**:
```bash
npm test -- useTextHighlight.test.ts
```

**Critério de Aceite**:
- [ ] Todos os testes passam (GREEN).
- [ ] Cobertura ≥ 90% do hook.
- [ ] Código refatorado e limpo (REFACTOR).

---

### T004: Testes do Hook useAnalysis

**Tipo**: Teste (RED phase)  
**Dependência**: T001  
**Prioridade**: P1  
**Esforço**: 2h  
**Descrição**: Escrever testes unitários para o hook `useAnalysis` (API mock com MSW).

**Arquivo**: `frontend/src/hooks/__tests__/useAnalysis.test.ts`

**Testes a implementar** (referência: `test-plan.md` TDD-009, TDD-011, TDD-012):

```typescript
describe("useAnalysis", () => {
  // Setup MSW server antes de cada teste
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  // TDD-009: Happy path - fetch bem-sucedido
  test("should fetch warnings successfully", async () => {
    // Mock POST /api/v1/analysis/evaluate com warnings
    // Renderizar hook com renderHook(useAnalysis)
    // Chamar analyze(text, type)
    // Verificar que data contém warnings
  });

  // TDD-011: Erro 500
  test("should handle API error gracefully", async () => {
    // Mock POST retornando 500
    // Chamar analyze()
    // Verificar que error está preenchido
    // Verificar que data é null
  });

  // TDD-012: Timeout
  test("should handle timeout", async () => {
    // Mock POST com delay > 10s
    // Chamar analyze()
    // Verificar que erro de timeout é tratado
  });

  // Teste adicional: validação de entrada
  test("should reject empty text", async () => {
    // Chamar analyze("", "bill")\n    // Verificar comportamento
  });
});
```

**Critério de Aceite**:
- [ ] Arquivo criado com MSW setup.
- [ ] Todos os testes falham (RED).
- [ ] MSW mock endpoint configurado e funcionando.

---

### T005: Implementação do Hook useAnalysis

**Tipo**: Implementação (GREEN + REFACTOR phases)  
**Dependência**: T004  
**Prioridade**: P1  
**Esforço**: 1.5h  
**Descrição**: Implementar `useAnalysis` para passar nos testes.

**Arquivo**: `frontend/src/hooks/useAnalysis.ts`

**Assinatura esperada**:
```typescript
export const useAnalysis = (lawId?: number) => {
  // ... implementação
  return {
    data: AnalysisResponse | null,
    loading: boolean,
    error: string | null,
    analyze: (text: string, type: "bill" | "amendment") => Promise<void>,
  };
};
```

**Requisitos de implementação**:
- [ ] Usar `fetch` com `AbortSignal.timeout(10000)` para timeout.
- [ ] Gerenciar estado com `useState` (data, loading, error).
- [ ] Usar `useCallback` para memorizar função `analyze`.
- [ ] Validar payload antes de enviar (ex: texto não vazio).
- [ ] Incluir `lawId` no payload quando disponível (REQ-005).
- [ ] Tratamento de erro para 4xx e 5xx.
- [ ] Comentários explicando fluxo de erro e timeout.

**Teste após implementação**:
```bash
npm test -- useAnalysis.test.ts
```

**Critério de Aceite**:
- [ ] Todos os testes passam (GREEN).
- [ ] Cobertura ≥ 85% do hook.
- [ ] TypeScript sem erros (`npm run lint`).

---

### T006: Testes do Componente WarningCard

**Tipo**: Teste (RED phase)  
**Dependência**: T001  
**Prioridade**: P1  
**Esforço**: 1h  
**Descrição**: Escrever testes para o componente `WarningCard`.

**Arquivo**: `frontend/src/components/__tests__/WarningCard.test.tsx`

**Testes a implementar** (referência: `test-plan.md` TDD-001, TDD-002):

```typescript
describe("WarningCard", () => {
  const mockWarning = {
    code: "ambiguidade",
    message: "Termo não definido",
    snippet: "Art. 1º estabelece...",
    confidence: 0.92,
  };

  // TDD-001: Renderização básica
  test("should render warning card with all fields", () => {
    const onSelect = jest.fn();
    render(<WarningCard warning={mockWarning} onSelect={onSelect} />);

    expect(screen.getByText("ambiguidade")).toBeInTheDocument();
    expect(screen.getByText("Termo não definido")).toBeInTheDocument();
    expect(screen.getByText("92%")).toBeInTheDocument();
  });

  // Clique dispara callback
  test("should call onSelect when clicked", () => {
    const onSelect = jest.fn();
    const { container } = render(<WarningCard warning={mockWarning} onSelect={onSelect} />);
    
    container.querySelector("button")?.click();
    expect(onSelect).toHaveBeenCalledWith(mockWarning);
  });

  // TDD-002: Dados malformados
  test("should render safely with missing fields", () => {
    const incomplete = { code: "vagueza", message: "", snippet: "", confidence: 0 };
    render(<WarningCard warning={incomplete} onSelect={jest.fn()} />);
    // Não deve quebrar
  });
});
```

**Critério de Aceite**:
- [ ] Arquivo criado com testes falhos (RED).
- [ ] Nenhuma implementação de `WarningCard` ainda.

---

### T007: Implementação do Componente WarningCard

**Tipo**: Implementação (GREEN + REFACTOR phases)  
**Dependência**: T006  
**Prioridade**: P1  
**Esforço**: 1h  
**Descrição**: Implementar `WarningCard` para passar nos testes.

**Arquivo**: `frontend/src/components/WarningCard.tsx`

**Requisitos de implementação**:
- [ ] Renderizar como `<button>` para acessibilidade.
- [ ] Exibir: código, mensagem, snippet (truncado a 100 chars), confiança como "%".
- [ ] Usar classes Tailwind para estilo (card, padding, hover effects).
- [ ] Chamar `onSelect` ao clicar.
- [ ] Atributo `aria-label` descrevendo o warning.
- [ ] Snippet truncado com "..." se necessário.
- [ ] Confiança formatada como "XX%" (ex: "92%").

**Teste após implementação**:
```bash
npm test -- WarningCard.test.tsx
```

**Critério de Aceite**:
- [ ] Todos os testes passam (GREEN).
- [ ] Cobertura ≥ 85%.
- [ ] Lint sem erros.

---

### T008: Testes do Componente WarningsSidebar

**Tipo**: Teste (RED phase)  
**Dependência**: T001  
**Prioridade**: P1  
**Esforço**: 2h  
**Descrição**: Escrever testes para o componente principal `WarningsSidebar`.

**Arquivo**: `frontend/src/components/__tests__/WarningsSidebar.test.tsx`

**Testes a implementar** (referência: `test-plan.md` TDD-001, TDD-003, TDD-004):

```typescript
describe("WarningsSidebar", () => {
  // TDD-001: Renderização de múltiplos cards
  test("should render multiple warning cards", () => {
    const warnings = [
      { code: "ambiguidade", message: "...", snippet: "...", confidence: 0.92 },
      { code: "vagueza", message: "...", snippet: "...", confidence: 0.65 },
    ];
    render(<WarningsSidebar warnings={warnings} isLoading={false} textContent="" onWarningClick={jest.fn()} />);

    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  // TDD-003: Estado vazio
  test("should show empty state message when no warnings", () => {
    render(<WarningsSidebar warnings={[]} isLoading={false} textContent="" onWarningClick={jest.fn()} />);

    expect(screen.getByText("Nenhum problema identificado")).toBeInTheDocument();
  });

  // TDD-004: Loading state
  test("should show loading spinner while loading", () => {
    render(<WarningsSidebar warnings={[]} isLoading={true} textContent="" onWarningClick={jest.fn()} />);

    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
  });

  // Error state
  test("should show error message on API error", () => {
    render(<WarningsSidebar warnings={[]} isLoading={false} error="Erro ao carregar análise" textContent="" onWarningClick={jest.fn()} />);

    expect(screen.getByText("Erro ao carregar análise")).toBeInTheDocument();
  });
});
```

**Critério de Aceite**:
- [ ] Arquivo criado com testes falhos (RED).
- [ ] MSW ou mock de contexto pronto se necessário.

---

### T009: Implementação do Componente WarningsSidebar

**Tipo**: Implementação (GREEN + REFACTOR phases)  
**Dependência**: T008, T007  
**Prioridade**: P1  
**Esforço**: 1.5h  
**Descrição**: Implementar `WarningsSidebar` para passar nos testes.

**Arquivo**: `frontend/src/components/WarningsSidebar.tsx`

**Requisitos de implementação**:
- [ ] Renderizar lista de `WarningCard` para cada warning.
- [ ] Mostrar estado vazio: "Nenhum problema identificado" (com ícone).
- [ ] Mostrar estado loading com spinner.
- [ ] Mostrar estado erro com mensagem customizada.
- [ ] Passar `onWarningClick` para cada `WarningCard`.
- [ ] Layout: aside com scroll interno (max-height).
- [ ] Usar Tailwind para estylo.
- [ ] Comentários em seções principais.

**Teste após implementação**:
```bash
npm test -- WarningsSidebar.test.tsx
```

**Critério de Aceite**:
- [ ] Todos os testes passam (GREEN).
- [ ] Cobertura ≥ 85%.
- [ ] Componente renderizado sem erros.

---

### T010: Testes de Integração (Componente + Hooks)

**Tipo**: Teste (Integração)  
**Dependência**: T003, T005, T009  
**Prioridade**: P1  
**Esforço**: 2h  
**Descrição**: Escrever testes de integração: WarningsSidebar + useAnalysis + useTextHighlight.

**Arquivo**: `frontend/src/components/__tests__/WarningsSidebar.integration.test.tsx`

**Testes a implementar** (referência: `test-plan.md` TDD-010):

```typescript
describe("WarningsSidebar Integration", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  // TDD-010: Clique em card disparas scroll + highlight
  test("should scroll and highlight text when card is clicked", async () => {
    const textContent = "Art. 1º estabelece o regime. Art. 2º aplica-se a todos.";
    
    render(
      <div id="law-content">{textContent}</div>,
      <WarningsSidebar
        warnings={[{
          code: "ambiguidade",
          message: "Termo vago",
          snippet: "regime",
          confidence: 0.85,
        }]}
        textContent={textContent}
        onWarningClick={(warning) => {
          // Lógica de highlight aqui
        }}
      />
    );

    // Mock useTextHighlight
    const card = screen.getByRole("button");
    fireEvent.click(card);

    // Verificar que highlight foi aplicado
    expect(document.querySelector(".highlight")).toBeInTheDocument();
  });

  // TDD-012: Timeout de API
  test("should handle timeout gracefully", async () => {
    server.use(
      rest.post("/api/v1/analysis/evaluate", async (req, res, ctx) => {
        return new Promise(() => {}); // nunca resolve
      })
    );

    // Renderizar componente
    // Aguardar timeout
    // Verificar erro exibido
  });
});
```

**Critério de Aceite**:
- [ ] Testes de integração escritos e passando.
- [ ] MSW configurado corretamente.
- [ ] Tempo de execução < 10s.

---

### T011: Integração em LawDetail (page.tsx)

**Tipo**: Implementação  
**Dependência**: T009, T010  
**Prioridade**: P1  
**Esforço**: 1h  
**Descrição**: Integrar `WarningsSidebar` e hooks na página `/law/[id]`.

**Arquivo**: `frontend/src/app/law/[id]/page.tsx`

**Tarefas**:
- [ ] Importar `WarningsSidebar`, `useAnalysis`, `useTextHighlight`.
- [ ] Chamar `useAnalysis(law.id)` no `useEffect`.
- [ ] Passar warnings para `<WarningsSidebar>`.
- [ ] Implementar callback `onWarningClick` disparando scroll + highlight.
- [ ] Layout: coluna esquerda (sidebar, 30%), coluna direita (conteúdo, 70%).
- [ ] Usar grid Tailwind ou CSS flexbox.
- [ ] Teste de que a página renderiza sem erros.

**Teste após implementação**:
```bash
npm test -- page.test.tsx
npm run build
```

**Critério de Aceite**:
- [ ] Página compila sem erros.
- [ ] Sidebar e conteúdo renderizados lado a lado.
- [ ] Clique em card funciona.

---

### T012: CSS Responsivo

**Tipo**: Implementação (UI/UX)  
**Dependência**: T011  
**Prioridade**: P2  
**Esforço**: 1h  
**Descrição**: Implementar responsividade para mobile, tablet, desktop.

**Tarefas**:
- [ ] Desktop (≥ 1024px): Sidebar fixo 30%, conteúdo 70%.
- [ ] Tablet (768px–1023px): Sidebar 20%, conteúdo 80%.
- [ ] Mobile (< 768px): Sidebar em drawer/modal com toggle button.
- [ ] Usar Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`.
- [ ] Testar em DevTools (F12) redimensionando janela.
- [ ] Verificar que texto não quebra e cards são legíveis.

**Teste após implementação**:
```bash
# Testar em mobile
# Testar em tablet
# Testar em desktop
```

**Critério de Aceite**:
- [ ] Sidebar responsivo em todos os breakpoints.
- [ ] Sem overflow ou texto cortado.
- [ ] Drawer/modal funcionando em mobile.

---

### T013: Validação Manual

**Tipo**: QA  
**Dependência**: T012  
**Prioridade**: P1  
**Esforço**: 1.5h  
**Descrição**: Teste manual completo da feature.

**Tarefas**:
- [ ] Executar `npm run dev` no frontend.
- [ ] Criar uma lei (ou usar seed).
- [ ] Acessar `/law/[id]`.
- [ ] Verificar que sidebar carrega com warnings em < 5s.
- [ ] Clicar em cada card:
  - [ ] Página faz scroll.
  - [ ] Trecho é destacado (fundo amarelo).
  - [ ] Highlight desaparece em ~2s (fade-out suave).
- [ ] Testar estado vazio: criar lei simples com 0 warnings.
- [ ] Testar erro: desabilitar network (F12), tentar carregar warning, verificar mensagem de erro.
- [ ] Testar responsividade: redimensionar janela, verificar sidebar em mobile/tablet/desktop.
- [ ] Testar acessibilidade: usar screen reader (ex: NVDA) para verificar aria-labels.

**Documentação**:
- [ ] Screenshot: Desktop com warnings.
- [ ] Screenshot: Mobile com drawer.
- [ ] Screenshot: Estado vazio.
- [ ] Video ou GIF: Clique em card → scroll + highlight → fade-out.

**Critério de Aceite**:
- [ ] Todos os cenários validados manualmente.
- [ ] Screenshots/vídeo documentados.
- [ ] Nenhum erro em console.

---

### T014: PR, Review e Merge

**Tipo**: Processo  
**Dependência**: T013  
**Prioridade**: P0  
**Esforço**: 1h  
**Descrição**: Abrir Pull Request, solicitar review, resolver feedback, fazer merge.

**Tarefas**:
- [ ] Fazer commit de todos os arquivos (`git add .`).
- [ ] Escrever mensagem de commit clara:
  ```
  feat(issue-137): Adicionar sidebar de warnings em /law/[id]
  
  - Componente WarningsSidebar com cards de problemas
  - Hook useAnalysis para chamar POST /api/v1/analysis/evaluate
  - Hook useTextHighlight para destacar trechos no texto
  - Responsividade mobile/tablet/desktop
  - Testes unitários e integração (cobertura 85%)
  - Docs: specs/005-warnings-sidebar/
  
  Closes #137
  ```
- [ ] Push para branch `feat/issue-137-warnings-sidebar`.
- [ ] Abrir PR em `dev` (não `main`).
- [ ] Preencher template de PR com descrição, screenshots, checklist.
- [ ] Aguardar review e resolver comentários.
- [ ] Executar `npm run lint` e `npm test` localmente antes de resolver.
- [ ] Fazer merge após aprovação.

**CI/CD**:
- [ ] GitHub Actions roda `npm run lint`.
- [ ] GitHub Actions roda `npm test`.
- [ ] GitHub Actions roda `npm run build`.
- [ ] Todos os checks passando antes de merge.

**Critério de Aceite**:
- [ ] PR aberta e descrita.
- [ ] CI/CD verde.
- [ ] Review aprovado.
- [ ] Merge realizado para `dev`.

---

## Resumo de Horas

| Tarefa | Tipo | Esforço |
|--------|------|---------|
| T001 | Setup | 0.5h |
| T002 | Teste | 1.5h |
| T003 | Impl | 1.5h |
| T004 | Teste | 2h |
| T005 | Impl | 1.5h |
| T006 | Teste | 1h |
| T007 | Impl | 1h |
| T008 | Teste | 2h |
| T009 | Impl | 1.5h |
| T010 | Teste | 2h |
| T011 | Impl | 1h |
| T012 | UI/UX | 1h |
| T013 | QA | 1.5h |
| T014 | Processo | 1h |
| **TOTAL** | | **21h** |

---

## Observações

- **TDD First**: Sempre escrever testes antes de implementação.
- **Commits Frequentes**: Fazer commit a cada tarefa concluída (não esperar o final).
- **CI/CD**: Validar que testes passam localmente antes de push.
- **Documentação**: Manter `spec.md`, `plan.md`, `test-plan.md` e `tasks.md` em sincronia.
- **Dependências Bloqueadas**: Se API retornar schema diferente, atualizar mocks em testes + atualizar tipos TypeScript.
