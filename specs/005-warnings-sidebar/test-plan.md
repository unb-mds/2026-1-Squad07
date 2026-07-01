# Test Plan: Sidebar de Warnings — R1 Demonstrável

**Spec**: [spec.md](spec.md)
**Data**: 2026-06-30

## Objetivo do Teste

Validar que o componente `WarningsSidebar` renderiza corretamente warnings do LegalBERT-pt, trata estados vazios, responde a cliques com highlighting de trechos no texto principal, e falhas de API são tratadas graciosamente.

## Estratégia TDD

1. **Fase RED**: Escrever testes unitários (Jest) e de integração (React Testing Library) antes de programar.
2. **Fase GREEN**: Implementar `WarningsSidebar`, hook de highlight e integração em `LawDetail` para passar nos testes.
3. **Fase REFACTOR**: Otimizar componente, garantir acessibilidade e cobertura ≥ 85%.

## Casos de Teste Unitários

### Área 1: Renderização de Cards

**TDD-001 (Happy Path)**:
- *Tipo*: Unitário (Jest + React Testing Library)
- *Componente*: `WarningsSidebar`
- *Setup*: Passar props com 3 warnings:
  ```javascript
  warnings: [
    { code: "ambiguidade", message: "Termo não definido", snippet: "Art. 1º...", confidence: 0.92 },
    { code: "vagueza", message: "Descrição vaga", snippet: "regime especial", confidence: 0.65 },
    { code: "falta_referencia", message: "Ref. incompleta", snippet: "Lei 123/2020", confidence: 0.78 }
  ]
  ```
- *Procedimento*: Renderizar componente e buscar elementos DOM.
- *Resultado esperado*:
  - 3 cards visíveis (seletor `.warning-card`).
  - Cada card contém: código (ex: "ambiguidade"), mensagem, snippet e confiança formatada como "%".
  - Confiança exibida como "92%" (confidence \* 100).

**TDD-002 (Bad Path - dados malformados)**:
- *Tipo*: Unitário
- *Procedimento*: Passar warnings com campos ausentes (ex: sem `message` ou com `confidence` inválido).
- *Resultado esperado*: Componente renderiza sem quebrar, exibindo valores padrão ou vazios para campos ausentes.

### Área 2: Estado Vazio

**TDD-003 (Happy Path)**:
- *Tipo*: Unitário
- *Procedimento*: Renderizar com `warnings: []`.
- *Resultado esperado*:
  - Mensagem "Nenhum problema identificado" exibida (seletor `.empty-state`).
  - Cards não renderizados.
  - Ícone ou visual diferenciado (ex: checkmark).

**TDD-004 (Bad Path - undefined)**:
- *Tipo*: Unitário
- *Procedimento*: Renderizar sem passar prop `warnings` (undefined).
- *Resultado esperado*: Componente renderiza estado vazio ou mensagem padrão sem erro de runtime.

### Área 3: Hook de Highlight

**TDD-005 (Happy Path)**:
- *Tipo*: Unitário (hook `useTextHighlight`)
- *Procedimento*: Chamar `useTextHighlight("Art. 1º...", "Art. 1º")` em um componente de teste.
- *Resultado esperado*: Hook retorna funções `{ highlightText, clearHighlight }` e state `{ isHighlighted }`.

**TDD-006 (Search e Find)**:
- *Tipo*: Unitário
- *Procedimento*: Chamar `highlightText("Art. 1º...", "Art.")` com texto no DOM (input ou div).
- *Resultado esperado*:
  - Texto encontrado e envolvido em `<mark>` ou classe CSS `.highlight`.
  - Função retorna `true` (sucesso).

**TDD-007 (Clear Highlight)**:
- *Tipo*: Unitário
- *Procedimento*: Após highlight, chamar `clearHighlight()`.
- *Resultado esperado*:
  - `<mark>` ou `.highlight` removido do DOM.
  - `isHighlighted` volta para `false`.

### Área 4: Scroll

**TDD-008 (Scroll até Elemento)**:
- *Tipo*: Unitário (mock `scrollIntoView`)
- *Procedimento*: Chamar função `scrollToElement(element)`.
- *Resultado esperado*: `element.scrollIntoView({ behavior: "smooth" })` é chamado.

## Casos de Teste de Integração

### Área 5: Integração com LawDetail e API

**TDD-009 (Happy Path - Fetch e Renderização)**:
- *Tipo*: Integração (React Testing Library + MSW mock API)
- *Setup*:
  - Mock de `POST /api/v1/analysis/evaluate` retornando:
    ```json
    {
      "analysis_id": "uuid-1",
      "warnings": [
        { "code": "ambiguidade", "message": "...", "snippet": "Art. 1º...", "confidence": 0.92 }
      ]
    }
    ```
  - Renderizar página `/law/1` com componente `LawDetail`.
- *Procedimento*: Aguardar renderização da página.
- *Resultado esperado*:
  - Requisição POST é disparada com `{ text: "...", type: "bill", lawId: 1 }`.
  - WarningsSidebar renderiza com o warning retornado.
  - Card exibido com código, mensagem, snippet e confiança.

**TDD-010 (Clique em Card - Scroll + Highlight)**:
- *Tipo*: Integração
- *Procedimento*:
  1. Renderizar página com warnings.
  2. Clicar em um card (seletor `.warning-card:first-child`).
- *Resultado esperado*:
  1. Função de scroll é chamada (mock verificado).
  2. Trecho é destacado no texto principal.
  3. Classe `.highlight` aplicada ao elemento contendo o snippet.
  4. Após 2s, `.highlight` é removido (testar com `jest.useFakeTimers()`).

**TDD-011 (Erro de API - 5xx)**:
- *Tipo*: Integração
- *Setup*: Mock de `POST /api/v1/analysis/evaluate` retornando erro 500.
- *Procedimento*: Renderizar página.
- *Resultado esperado*:
  - WarningsSidebar exibe mensagem de erro (ex: "Erro ao carregar análise").
  - Nenhum card renderizado.
  - Usuário não vê quebra visual ou erro de runtime.

**TDD-012 (Timeout de API)**:
- *Tipo*: Integração
- *Setup*: Mock de `POST /api/v1/analysis/evaluate` com delay > 10s.
- *Procedimento*: Renderizar página e aguardar timeout.
- *Resultado esperado*:
  - Requisição é abortada ou com timeout explícito.
  - WarningsSidebar exibe fallback (ex: "Análise não disponível no momento").

### Área 6: Responsividade

**TDD-013 (Mobile - Sidebar transformado em Modal)**:
- *Tipo*: Integração
- *Setup*: Viewport reduzido para 320px (mobile).
- *Procedimento*: Renderizar página com warnings.
- *Resultado esperado*:
  - Sidebar não exibido fixo (ou oculto em mobile).
  - Ao clicar no ícone/botão de warnings, modal/drawer abre com cards.

## Amostras de Lei Real para Validação

### Lei 1: Complexidade Baixa

```text
Art. 1º. Fica instituído o regime especial de apoio.
Art. 2º. Aplicam-se as disposições desta lei a todas as instituições.
```

**Análise esperada**:
- Poucos warnings (ex: 1-2, apenas "vagueza" ou "ambiguidade" leve).
- Score alto (~0.8+).

### Lei 2: Complexidade Alta

```text
Art. 1º. O sistema de compensação de que trata esta lei observará os procedimentos estabelecidos pelo órgão regulador, sendo vedado o exercício de atividades incompatíveis com as funções de gestor.

Art. 2º. Sem prejuízo do disposto no artigo anterior, as disposições desta lei aplicam-se, subsidiariamente, aos casos não abrangidos pela regulamentação específica.
```

**Análise esperada**:
- 3+ warnings (ambiguidade, falta de referência, inconsistência).
- Score médio (~0.6).

## Validação Manual

- [ ] Executar `npm run dev` no frontend.
- [ ] Acessar `/law/1` (ou criar uma lei antes).
- [ ] Verificar se sidebar carrega com warnings da API em < 5s.
- [ ] Clicar em um card: verificar scroll suave + highlight.
- [ ] Aguardar 2s: verificar fade-out do highlight.
- [ ] Desabilitar network (F12 Network): verificar fallback de erro no sidebar.
- [ ] Redimensionar janela para mobile: verificar responsividade.

## Validação Automatizada

### Executar Testes Unitários

```bash
cd frontend
npm test -- WarningsSidebar.test.tsx --coverage
```

**Resultado esperado**: Cobertura ≥ 85%, todos os testes passando.

### Executar Testes de Integração

```bash
npm test -- LawDetail.integration.test.tsx --coverage
```

**Resultado esperado**: Testes de API mock, scroll, highlight, erro passando.

### Executar Lint

```bash
npm run lint
```

**Resultado esperado**: Sem erros de linting.

### Executar Build

```bash
npm run build
```

**Resultado esperado**: Build sem warnings críticos.

## Evidências Esperadas

- [ ] Saída do `npm test` com ✓ em todos os casos TDD.
- [ ] Coverage report mostrando ≥ 85% de cobertura.
- [ ] Saída do `npm run lint` sem erros.
- [ ] Build gerado sem erros.
- [ ] Validação manual concluída: screenshots ou log.

## Notas

- **Mocking de API**: Usar MSW (Mock Service Worker) para mockar `POST /api/v1/analysis/evaluate`.
- **Timing**: Usar `jest.useFakeTimers()` para testar o timeout de 2s do highlight sem aguardar realmente.
- **Acessibilidade**: Cada card DEVE ter atributo `role="button"` ou ser um `<button>` real.
- **Snapshot Testing**: Não recomendado para este componente (warnings variam); prefira asserções específicas.
