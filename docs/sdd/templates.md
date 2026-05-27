# Templates SDD/TDD

## Objetivo

Esta página explica como usar os templates do Spec Kit adaptados ao Squad 07.

Os templates ficam em `.specify/templates/` e servem como base para novas specs em `specs/`.

Eles devem ser escritos de forma independente de ferramenta. A integração inicial do Spec Kit foi configurada para Codex, mas o conteúdo dos templates, AGENTS e specs deve orientar qualquer agente de IA que auxilie o projeto.

## Arquivos principais

| Arquivo | Função |
| --- | --- |
| `spec-template.md` | Define problema, objetivo, escopo, R1/R2, cenários, requisitos, entradas, saídas, regras de negócio e casos de erro. |
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

## Checklist para criar uma spec

1. Confirme a issue ou decisão que justifica a spec.
2. Crie uma branch fora da `main`, preferencialmente usando o padrão do Squad com issue, como `docs/issue-86-sdd-documentacao`.
3. Crie a pasta em `specs/` com número e nome curto.
4. Preencha `spec.md` com objetivo, contexto, escopo, cenários, requisitos, entradas, saídas, regras de negócio e casos de erro.
5. Preencha `plan.md` com abordagem técnica ou documental.
6. Preencha `test-plan.md` antes de transformar a spec em tarefas.
7. Crie `tasks.md` com validações antes das tarefas de implementação.
8. Crie `quickstart.md` quando a spec precisar orientar execução, revisão ou demonstração.
9. Atualize o catálogo de specs quando a spec entrar em revisão.
10. Abra PR para revisão do time.

## Como SDD vira implementação

No fluxo do Squad 07, a issue registra a demanda e a spec transforma essa demanda em comportamento verificável. O `test-plan.md` define como a entrega será validada, e o `tasks.md` quebra o trabalho em passos executáveis.

A implementação só deve começar quando:

- a spec não possui ambiguidades centrais;
- os critérios de aceite são verificáveis;
- entradas, saídas, regras de negócio e erros esperados estão claros;
- o plano de TDD ou validação está escrito;
- as tarefas estão rastreáveis à issue e à spec.

Toda spec ligada a issue, requisito, arquitetura, sprint, release ou decisão do time deve ser versionada no repositório.

## Padrões de branch aceitos pelos scripts

Os scripts PowerShell do Spec Kit aceitam dois grupos de branch:

- padrão numerado do Spec Kit, como `001-submissao-texto-legislativo` ou `20260319-143022-feature-name`;
- padrão do Squad 07 com issue no nome, como `docs/issue-86-sdd-documentacao`, `codex/issue-72-metricas-dashboard` ou `feat/issue-90-endpoint-submissao`.

Quando a branch contém `issue-N`, os scripts procuram em `specs/` uma spec cujo `spec.md` declare `Issue: #N`. Se exatamente uma spec for encontrada, ela será usada como diretório da feature.

Branches fora da `main` continuam válidas para trabalho comum do projeto, mas o uso dos scripts do Spec Kit exige branch numerada/timestamp ou branch com `issue-N`.

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
