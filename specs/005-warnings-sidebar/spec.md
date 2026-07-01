# Feature Specification: Sidebar de Warnings — R1 Demonstrável

**Branch**: `feat/issue-137-warnings-sidebar`
**Criado em**: 2026-06-30
**Status**: Draft
**Issue**: #137
**Depende de**: Implementação do Agente LegalBERT-pt (#114) e Endpoint `POST /api/v1/analysis/evaluate` (#106)

## Objetivo

Implementar a exibição de **problemas técnicos identificados** pelo classificador LegalBERT-pt em uma **coluna lateral (sidebar)** na página de análise de lei (`/law/[id]`). Cada problema é exibido em um card com trecho, categoria e confiança, permitindo ao usuário clicar e destacar o trecho no texto principal.

## Contexto

A Release 1 é **demonstrável**. O sistema já submete leis, lista e visualiza. Falta fechar o fluxo de análise de qualidade:

1. **Backend** (#114): LegalBERT-pt classifica textos legislativos e retorna `warnings` (problemas técnicos).
2. **API** (#106): Endpoint `POST /api/v1/analysis/evaluate` centraliza o contrato de análise.
3. **Frontend** (esta issue): Exibir os warnings em sidebar, permitindo navegação visual entre problemas e texto.

## Público-Target

- **Usuários da plataforma**: avaliar rapidamente os problemas técnicos de um texto legal.
- **Desenvolvedores Frontend**: implementar componentes reutilizáveis de warnings e highlighting.

## Escopo

### Incluído (R1 Demonstrável)

- Componente React `WarningsSidebar` em `frontend/src/components/WarningsSidebar.tsx`.
- Integração na página `/law/[id]` (componente `LawDetail`).
- Chamada a `POST /api/v1/analysis/evaluate` ao carregar a página (após armazenar a lei).
- Cards com: trecho problematico, categoria do problema, nivel de confianca.
- Estado vazio: mensagem "Nenhum problema identificado" quando `warnings` está vazio.
- Clique no card: **scroll + highlight temporário** (fade-out em 2s) do trecho no texto principal.
- Suite de testes: componente com warnings, sem warnings, erro de API, clique destaca.
- CI/CD verde (testes e lint passando).

### Fora de Escopo (R2+)

- Persistência de análise por lei (será tratada em specs posteriores de histórico).
- Integração com usuários autenticados (mantém análise anônima em R1).
- Exportação ou download de relatório de análise.
- Análise assíncrona com status polling (implementação de `202 Accepted` será em specs posteriores).
- Refatoração ou integração com score de legibilidade na mesma página (spec `004-readability-score` é independente).

## Requisitos

### Requisitos Funcionais

- **REQ-001**: O sidebar DEVE exibir uma lista de cards, cada um representando um `warning` retornado pela API.
- **REQ-002**: Cada card DEVE mostrar:
  - Trecho problematico (substring limitada a 100 caracteres ou até quebra natural).
  - Categoria/código do problema (ex: `ambiguidade`, `vagueza`).
  - Nível de confiança como porcentagem (0–100%).
- **REQ-003**: Quando `warnings` está vazio, o sidebar DEVE exibir a mensagem `"Nenhum problema identificado"`.
- **REQ-004**: Ao clicar em um card, o texto no corpo principal DEVE:
  - Fazer scroll até o trecho.
  - Aplicar highlight temporário (fundo com cor, ex: amarelo).
  - Remover o highlight após 2 segundos (fade-out suave).
- **REQ-005**: A chamada a `POST /api/v1/analysis/evaluate` DEVE ocorrer automaticamente ao renderizar a página, passando `text` e opcionalmente `lawId`.
- **REQ-006**: Erros de API (timeout, 5xx) DEVE exibir fallback de erro no sidebar (ex: `"Erro ao carregar análise"`).
- **REQ-007**: O sidebar DEVE ocupar espaço definido no layout (ex: 25–30% da página) e ser responsivo em dispositivos menores.

### Requisitos Não-Funcionais

- **REQ-NF-001**: Componente DEVE ter cobertura de testes unitários ≥ 85%.
- **REQ-NF-002**: Highlight e scroll DEVEM ser suaves (duração < 500ms).
- **REQ-NF-003**: Requisição à API DEVE ter timeout ≤ 10s.

## Cenários e Testes

### Cenário 1: Carregamento de Warnings (Prioridade: P1)

**Como** usuário legislativo, **quero** visualizar os problemas técnicos de uma lei, **para** entender o que precisa ser melhorado.

**Critérios de aceite**:

1. **Dado** que a API retorna `{ warnings: [{ code: "ambiguidade", message: "Art. 1º ambíguo", confidence: 0.92 }, ...] }`,
   **quando** a página `/law/[id]` carrega,
   **então** cada warning é renderizado em um card com código, mensagem e confiança.

### Cenário 2: Estado Vazio (Prioridade: P1)

**Como** usuário, **quero** saber quando não há problemas, **para** confirmar que o texto está bem redigido.

**Critérios de aceite**:

1. **Dado** que a API retorna `{ warnings: [] }`,
   **quando** a página carrega,
   **então** o sidebar exibe `"Nenhum problema identificado"` com visual diferenciado (ex: ícone de checkmark).

### Cenário 3: Navegação via Clique (Prioridade: P1)

**Como** usuário, **quero** clicar num card de problema, **para** localizar rapidamente o trecho no texto.

**Critérios de aceite**:

1. **Dado** que um card é exibido com trecho `"Art. 1º estabelece..."`,
   **quando** clico no card,
   **então**: 
   - A página faz scroll até o trecho.
   - O trecho é destacado com cor de fundo (ex: amarelo).
   - O highlight desaparece após 2 segundos.

### Cenário 4: Erro de API (Prioridade: P2)

**Como** sistema, **quero** reagir a falhas de API, **para** não quebrar a experiência do usuário.

**Critérios de aceite**:

1. **Dado** que `POST /api/v1/analysis/evaluate` falha (5xx, timeout),
   **quando** a página carrega,
   **então** o sidebar exibe mensagem de erro (ex: `"Erro ao carregar análise"`) sem quebrar o layout.

## Contrato de API

### Entrada: POST /api/v1/analysis/evaluate

```json
{
  "text": "Art. 1º. Esta lei estabelece...",
  "type": "bill",
  "lawId": 42  // opcional; relaciona análise a uma lei existente
}
```

### Saída (200 OK)

```json
{
  "analysis_id": "uuid-12345",
  "text": "Art. 1º...",
  "type": "bill",
  "score": 0.65,
  "cached": false,
  "metrics": {
    "ambiguidade": 0.92,
    "vagueza": 0.45,
    "falta_referencia": 0.78,
    "inconsistencia": 0.55
  },
  "warnings": [
    {
      "code": "ambiguidade",
      "message": "Termo 'regime especial' não é definido no artigo.",
      "snippet": "Art. 1º estabelece o regime especial...",
      "confidence": 0.92
    },
    {
      "code": "falta_referencia",
      "message": "Referência cruzada incompleta.",
      "snippet": "Conforme Lei 123/2020, inciso II.",
      "confidence": 0.78
    }
  ]
}
```

### Saída (422 Unprocessable Entity)

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

## Dados de Entrada e Saída

**Amostra de Lei Real para Validação**:

```
Art. 1º. Fica instituído o regime especial de apoio ao desenvolvimento científico.

Art. 2º. Conforme Lei 123/2020, as instituições participantes receberão fomento.

Art. 3º. O termo "regime especial" refere-se às condições previstas no inciso anterior.
```

**Análise esperada**:

- `warnings[0]`: "ambiguidade" (~0.92) — "regime especial" sem definição clara no Art. 1º.
- `warnings[1]`: "falta_referencia" (~0.78) — Lei 123/2020 sem descrição completa.
- `score`: ~0.72 (qualidade média-alta).

## Critérios de Aceite Finais

- [ ] Componente `WarningsSidebar` criado com suporte a estado vazio.
- [ ] Integração em `LawDetail` (`/law/[id]`): chamada ao endpoint ao renderizar.
- [ ] Cards renderizados corretamente (trecho, categoria, confiança).
- [ ] Clique em card faz scroll + highlight com fade-out em 2s.
- [ ] Erro de API tratado com fallback visual.
- [ ] Testes unitários cobrindo happy path, estado vazio, erro, clique.
- [ ] Cobertura ≥ 85%.
- [ ] CI/CD verde (testes + lint).

## Notas de Implementação

1. **Componente de Highlight**: Recomenda-se usar um hook customizado (ex: `useTextHighlight`) para gerenciar a lógica de busca e highlight, separando-a da renderização.
2. **Layout Responsivo**: Em mobile (< 768px), considerar exibir warnings em modal ou drawer ao invés de sidebar fixa.
3. **Debounce de Clique**: Implementar debounce para evitar múltiplos cliques gerarem múltiplas requisições de scroll/highlight.
4. **Acessibilidade**: Cards DEVEM ter atributos ARIA (`aria-label`, `role`).

## Status e Próximos Passos

- [x] Spec criada em draft.
- [ ] Clarificações resolvidas (se houver `NEEDS CLARIFICATION`).
- [ ] `test-plan.md` criado.
- [ ] `plan.md` criado com decisões arquiteturais.
- [ ] `tasks.md` gerado com tarefas em ordem de dependência.
- [ ] Implementação iniciada.
