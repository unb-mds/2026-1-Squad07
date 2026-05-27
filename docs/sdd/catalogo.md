# Catálogo de Specs

## Objetivo

Este catálogo lista as specs SDD/TDD criadas para o projeto e indica o status de cada uma.

## Specs atuais

| Spec | Status | Objetivo | Relação |
| --- | --- | --- | --- |
| `000-documentacao-do-projeto` | Implementada/Ativa | Definir padrão de qualidade documental, SDD, TDD, AGENTS e skills. | Issue #86 |
| `001-integracao-frontend-backend` | Implementada | Definir integração entre frontend, backend, autenticação, submissão, listagem, detalhe e validação da demo da R1. | Issues #93, #94, #95 e #96 |

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

As specs abaixo permanecem como próximas evoluções ou refinamentos específicos. A spec `001-integracao-frontend-backend` consolidou parte do fluxo que antes estava dividido em specs menores planejadas.

| Spec planejada | Objetivo |
| --- | --- |
| `002-analise-qualidade-legislativa` | Definir análise real de qualidade legislativa para a R2. |
| `003-score-qualidade-legislativa` | Definir cálculo real do score e critérios de ponderação. |
| `004-agente-ia-juridico` | Definir o agente de IA de apoio à interpretação e revisão legislativa. |
| `005-dashboard-qualidade-legislativa` | Definir painel analítico real de qualidade das submissões. |

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
