# Catálogo de Specs

## Objetivo

Este catálogo lista as specs SDD/TDD criadas para o projeto e indica o status de cada uma.

## Specs atuais

| Spec | Status | Objetivo | Relação |
| --- | --- | --- | --- |
| `000-documentacao-do-projeto` | Em revisão | Definir padrão de qualidade documental, SDD, TDD, AGENTS e skills. | Issue #86 |

## Ciclo de Vida de uma Spec

| Status | Significado |
| --- | --- |
| `Draft` | A spec ainda está sendo escrita e pode conter ambiguidades. |
| `Em revisão` | A spec já possui estrutura mínima e está pronta para revisão do time. |
| `Ativa` | A spec foi aprovada e pode orientar implementação ou manutenção. |
| `Implementada` | A funcionalidade ou processo descrito foi entregue e validado. |
| `Obsoleta` | A spec foi substituída ou não representa mais a decisão atual do projeto. |

Toda mudança de status deve ser feita por PR ou registrada em uma issue relacionada, para manter rastreabilidade.

## Próximas specs planejadas

As specs abaixo serão criadas em etapas futuras, usando o padrão definido pela spec de documentação:

| Spec planejada | Objetivo |
| --- | --- |
| `001-submissao-texto-legislativo` | Definir o fluxo de submissão de proposição legislativa. |
| `002-persistencia-submissao` | Definir como a submissão será registrada e recuperada. |
| `003-listagem-submissoes` | Definir listagem de submissões cadastradas. |
| `004-visualizacao-detalhes-submissao` | Definir detalhes de uma submissão e resultado associado. |
| `005-analise-demonstrativa-score` | Definir análise demonstrativa e evolução para score de qualidade legislativa. |

## Critério para adicionar uma spec ao catálogo

Uma spec só deve entrar como ativa quando possuir:

- `spec.md`;
- `plan.md`;
- `test-plan.md`;
- `tasks.md`;
- `quickstart.md`;
- status claro;
- issue relacionada.

Specs ligadas a issues, requisitos, arquitetura, sprint, release ou decisões do time devem ser versionadas no repositório.
