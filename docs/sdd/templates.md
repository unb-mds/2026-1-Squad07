# Templates SDD/TDD

## Objetivo

Esta página explica como usar os templates do Spec Kit adaptados ao Squad 07.

Os templates ficam em `.specify/templates/` e servem como base para novas specs em `specs/`.

Eles devem ser escritos de forma independente de ferramenta. A integração inicial do Spec Kit foi configurada para Codex, mas o conteúdo dos templates, AGENTS e specs deve orientar qualquer agente de IA que auxilie o projeto.

## Arquivos principais

| Arquivo | Função |
| --- | --- |
| `spec-template.md` | Define problema, objetivo, escopo, R1/R2, cenários e requisitos. |
| `plan-template.md` | Define abordagem técnica ou documental. |
| `test-plan-template.md` | Define TDD, validações e evidências esperadas. |
| `tasks-template.md` | Define tarefas derivadas da spec, com testes antes da implementação. |

## Componentes de Apoio

| Componente | Função no projeto |
| --- | --- |
| `AGENTS.md` | Define regras gerais para pessoas e agentes de IA atuarem no repositório. |
| `docs/AGENTS.md` | Define regras específicas para documentação, MkDocs, PT-BR e revisão visual com `mkdocs serve`. |
| `specs/AGENTS.md` | Define como criar e manter specs SDD/TDD. |
| `.specify/` | Guarda constituição, templates e scripts do Spec Kit. |
| `.agents/skills/` | Guarda skills reutilizáveis para orientar agentes de IA em tarefas recorrentes. |
| `specs/` | Guarda as specs que conectam issue, comportamento esperado, TDD e tarefas. |

## Ordem obrigatória

1. `spec.md`
2. `plan.md`
3. `test-plan.md`
4. `tasks.md`
5. `quickstart.md`

O `test-plan.md` deve existir antes da spec ser considerada pronta para implementação.

## Como abrir uma nova spec

Crie uma pasta dentro de `specs/` usando número e nome curto:

```text
specs/001-submissao-texto-legislativo/
```

Depois preencha os arquivos mínimos:

```text
spec.md
plan.md
test-plan.md
tasks.md
quickstart.md
```

Use `contracts/` quando houver contrato de API, interface ou qualidade. Use `data-model.md` quando houver entidade, persistência ou vocabulário importante.

## TDD por tipo de entrega

| Tipo | Validação esperada |
| --- | --- |
| Backend | Testes com `pytest`, contratos de rota e cenários de erro. |
| Frontend | Validação manual na R1 e planejamento futuro com Vitest/React Testing Library para R2. |
| Documentação | TDD documental com checklist de qualidade, navegação e contexto. |
| Métricas | Validação do JSON, renderização do painel e coerência semântica das métricas. |

## Quando marcar `NEEDS CLARIFICATION`

Use `NEEDS CLARIFICATION` quando faltar decisão sobre:

- comportamento esperado;
- regra de negócio;
- contrato de API;
- persistência;
- prioridade R1/R2;
- fonte de dados;
- critério de aceite.

Uma spec com ambiguidades centrais não deve avançar para implementação.
