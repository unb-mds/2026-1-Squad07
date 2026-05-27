# Matriz de Rastreabilidade

## Objetivo

Esta matriz relaciona requisitos, issues, specs, áreas do projeto e prioridade para a Release 1. O objetivo é permitir que a equipe acompanhe quais requisitos estão cobertos por tarefas reais, quais foram integrados na R1 e quais itens ficam planejados para versões futuras.

O estado atual considera a `dev` após a rodada de integração da R1: autenticação básica, submissão, listagem, detalhe e validação integrada foram tratados como parte do fluxo mínimo funcional do **CrivoAI**. Indicadores de IA, score e análise legislativa seguem demonstrativos na R1.

## Rastreabilidade dos requisitos funcionais

| Requisito | Descrição resumida | Issues relacionadas | Prioridade R1 | Área principal |
| --- | --- | --- | --- | --- |
| RF00 | Autenticação básica | [`#36`](https://github.com/unb-mds/2026-1-Squad07/issues/36), [`#37`](https://github.com/unb-mds/2026-1-Squad07/issues/37), [`#38`](https://github.com/unb-mds/2026-1-Squad07/issues/38), [`#92`](https://github.com/unb-mds/2026-1-Squad07/issues/92), [`#93`](https://github.com/unb-mds/2026-1-Squad07/issues/93) | Must have | Frontend/API/Backend |
| RF01 | Submeter texto legislativo | [`#40`](https://github.com/unb-mds/2026-1-Squad07/issues/40), [`#75`](https://github.com/unb-mds/2026-1-Squad07/issues/75), [`#95`](https://github.com/unb-mds/2026-1-Squad07/issues/95) | Must have | Frontend/API |
| RF02 | Receber submissão via API | [`#40`](https://github.com/unb-mds/2026-1-Squad07/issues/40), [`#95`](https://github.com/unb-mds/2026-1-Squad07/issues/95) | Must have | Backend/API |
| RF03 | Persistir submissão legislativa | [`#29`](https://github.com/unb-mds/2026-1-Squad07/issues/29), [`#40`](https://github.com/unb-mds/2026-1-Squad07/issues/40), [`#95`](https://github.com/unb-mds/2026-1-Squad07/issues/95), [`#96`](https://github.com/unb-mds/2026-1-Squad07/issues/96) | Must have | Banco/Backend |
| RF04 | Listar submissões cadastradas | [`#76`](https://github.com/unb-mds/2026-1-Squad07/issues/76), [`#94`](https://github.com/unb-mds/2026-1-Squad07/issues/94), [`#96`](https://github.com/unb-mds/2026-1-Squad07/issues/96) | Must have | Backend/Frontend |
| RF05 | Consultar detalhes de uma submissão | [`#76`](https://github.com/unb-mds/2026-1-Squad07/issues/76), [`#94`](https://github.com/unb-mds/2026-1-Squad07/issues/94), [`#96`](https://github.com/unb-mds/2026-1-Squad07/issues/96) | Must have | Backend/Frontend |
| RF06 | Consultar textos legislativos de exemplo | [`#60`](https://github.com/unb-mds/2026-1-Squad07/issues/60) | Must have | Dados/Documentação |
| RF07 | Exibir resultado básico ou status | [`#40`](https://github.com/unb-mds/2026-1-Squad07/issues/40), [`#60`](https://github.com/unb-mds/2026-1-Squad07/issues/60), [`#94`](https://github.com/unb-mds/2026-1-Squad07/issues/94), [`#95`](https://github.com/unb-mds/2026-1-Squad07/issues/95) | Should have | Backend/Frontend |
| RF08 | Disponibilizar documentação da R1 | [`#57`](https://github.com/unb-mds/2026-1-Squad07/issues/57), [`#68`](https://github.com/unb-mds/2026-1-Squad07/issues/68), [`#72`](https://github.com/unb-mds/2026-1-Squad07/issues/72), [`#86`](https://github.com/unb-mds/2026-1-Squad07/issues/86), [`#99`](https://github.com/unb-mds/2026-1-Squad07/issues/99) | Should have | Documentação |
| RF09 | Calcular índice inicial de legibilidade real | [`#41`](https://github.com/unb-mds/2026-1-Squad07/issues/41) | R2/Futuro | Backend/NLP |
| RF10 | Calcular score final real de qualidade | [`#42`](https://github.com/unb-mds/2026-1-Squad07/issues/42) | R2/Futuro | Backend/NLP |
| RF11 | Exibir relatório visual de qualidade calculado | [`#43`](https://github.com/unb-mds/2026-1-Squad07/issues/43), [`#44`](https://github.com/unb-mds/2026-1-Squad07/issues/44), [`#50`](https://github.com/unb-mds/2026-1-Squad07/issues/50), [`#51`](https://github.com/unb-mds/2026-1-Squad07/issues/51) | R2/Futuro | Frontend/Dados |

## Rastreabilidade dos requisitos não funcionais

| Requisito | Categoria | Issues relacionadas | Critério principal |
| --- | --- | --- | --- |
| RNF01 | Usabilidade | [`#65`](https://github.com/unb-mds/2026-1-Squad07/issues/65), [`#75`](https://github.com/unb-mds/2026-1-Squad07/issues/75), [`#76`](https://github.com/unb-mds/2026-1-Squad07/issues/76), [`#93`](https://github.com/unb-mds/2026-1-Squad07/issues/93), [`#94`](https://github.com/unb-mds/2026-1-Squad07/issues/94), [`#95`](https://github.com/unb-mds/2026-1-Squad07/issues/95), [`#96`](https://github.com/unb-mds/2026-1-Squad07/issues/96) | Interface sem sobreposição e alinhada ao protótipo. |
| RNF02 | Manutenibilidade | [`#40`](https://github.com/unb-mds/2026-1-Squad07/issues/40), [`#92`](https://github.com/unb-mds/2026-1-Squad07/issues/92), [`#93`](https://github.com/unb-mds/2026-1-Squad07/issues/93), [`#94`](https://github.com/unb-mds/2026-1-Squad07/issues/94), [`#95`](https://github.com/unb-mds/2026-1-Squad07/issues/95) | API organizada e testável localmente. |
| RNF03 | Dados | [`#29`](https://github.com/unb-mds/2026-1-Squad07/issues/29), [`#40`](https://github.com/unb-mds/2026-1-Squad07/issues/40), [`#76`](https://github.com/unb-mds/2026-1-Squad07/issues/76), [`#95`](https://github.com/unb-mds/2026-1-Squad07/issues/95), [`#96`](https://github.com/unb-mds/2026-1-Squad07/issues/96) | Persistência estruturada das submissões. |
| RNF04 | Arquitetura | [`#29`](https://github.com/unb-mds/2026-1-Squad07/issues/29), [`#40`](https://github.com/unb-mds/2026-1-Squad07/issues/40), [`#75`](https://github.com/unb-mds/2026-1-Squad07/issues/75), [`#76`](https://github.com/unb-mds/2026-1-Squad07/issues/76), [`#93`](https://github.com/unb-mds/2026-1-Squad07/issues/93), [`#94`](https://github.com/unb-mds/2026-1-Squad07/issues/94), [`#95`](https://github.com/unb-mds/2026-1-Squad07/issues/95), [`#96`](https://github.com/unb-mds/2026-1-Squad07/issues/96) | Separação entre frontend, backend e banco. |
| RNF05 | Segurança/configuração | [`#29`](https://github.com/unb-mds/2026-1-Squad07/issues/29), [`#93`](https://github.com/unb-mds/2026-1-Squad07/issues/93), [`#96`](https://github.com/unb-mds/2026-1-Squad07/issues/96) | Configuração sensível por variáveis de ambiente. |
| RNF06 | Documentação | [`#57`](https://github.com/unb-mds/2026-1-Squad07/issues/57), [`#68`](https://github.com/unb-mds/2026-1-Squad07/issues/68), [`#72`](https://github.com/unb-mds/2026-1-Squad07/issues/72), [`#86`](https://github.com/unb-mds/2026-1-Squad07/issues/86), [`#99`](https://github.com/unb-mds/2026-1-Squad07/issues/99) | Documentação em `docs/`, pronta para publicação. |
| RNF07 | Processo | [`#61`](https://github.com/unb-mds/2026-1-Squad07/issues/61), [`#77`](https://github.com/unb-mds/2026-1-Squad07/issues/77) | Integração por branch e Pull Request. |
| RNF08 | Operação | [`#29`](https://github.com/unb-mds/2026-1-Squad07/issues/29), [`#40`](https://github.com/unb-mds/2026-1-Squad07/issues/40), [`#75`](https://github.com/unb-mds/2026-1-Squad07/issues/75), [`#76`](https://github.com/unb-mds/2026-1-Squad07/issues/76), [`#93`](https://github.com/unb-mds/2026-1-Squad07/issues/93), [`#94`](https://github.com/unb-mds/2026-1-Squad07/issues/94), [`#95`](https://github.com/unb-mds/2026-1-Squad07/issues/95), [`#96`](https://github.com/unb-mds/2026-1-Squad07/issues/96) | Execução local mínima do fluxo da R1. |
| RNF09 | Gestão de produto | [`#57`](https://github.com/unb-mds/2026-1-Squad07/issues/57), [`#68`](https://github.com/unb-mds/2026-1-Squad07/issues/68), [`#77`](https://github.com/unb-mds/2026-1-Squad07/issues/77), [`#99`](https://github.com/unb-mds/2026-1-Squad07/issues/99) | Escopo R1/R2 separado e validado. |
| RNF10 | Transparência | [`#72`](https://github.com/unb-mds/2026-1-Squad07/issues/72) | Dashboard de métricas reproduzível. |

## Dependências principais da Sprint 8

| Dependência | Desbloqueia | Observação |
| --- | --- | --- |
| [`#57`](https://github.com/unb-mds/2026-1-Squad07/issues/57) Requisitos refinados | [`#65`](https://github.com/unb-mds/2026-1-Squad07/issues/65), [`#68`](https://github.com/unb-mds/2026-1-Squad07/issues/68), [`#75`](https://github.com/unb-mds/2026-1-Squad07/issues/75), [`#77`](https://github.com/unb-mds/2026-1-Squad07/issues/77) | Define escopo, critérios e prioridades. |
| [`#65`](https://github.com/unb-mds/2026-1-Squad07/issues/65) Protótipo de alta fidelidade | [`#75`](https://github.com/unb-mds/2026-1-Squad07/issues/75), [`#76`](https://github.com/unb-mds/2026-1-Squad07/issues/76) | Guia visual para a implementação do frontend. |
| [`#29`](https://github.com/unb-mds/2026-1-Squad07/issues/29) Banco e Prisma | [`#40`](https://github.com/unb-mds/2026-1-Squad07/issues/40), [`#76`](https://github.com/unb-mds/2026-1-Squad07/issues/76) | Base da persistência. |
| [`#40`](https://github.com/unb-mds/2026-1-Squad07/issues/40) Endpoint de submissão | [`#75`](https://github.com/unb-mds/2026-1-Squad07/issues/75), [`#76`](https://github.com/unb-mds/2026-1-Squad07/issues/76) | Base do fluxo funcional do produto. |
| [`#60`](https://github.com/unb-mds/2026-1-Squad07/issues/60) Curadoria de dados | [`#77`](https://github.com/unb-mds/2026-1-Squad07/issues/77) e demonstração da R1 | Apoia exemplos reais ou realistas. |
| [`#68`](https://github.com/unb-mds/2026-1-Squad07/issues/68) Vision/Overview | [`#77`](https://github.com/unb-mds/2026-1-Squad07/issues/77) | Define narrativa de escopo e produto. |
| [`#72`](https://github.com/unb-mds/2026-1-Squad07/issues/72) Métricas | [`#77`](https://github.com/unb-mds/2026-1-Squad07/issues/77) | Apoia apresentação de processo e produtividade. |

## Integração final da R1

| Item | Desbloqueia | Observação |
| --- | --- | --- |
| [`#93`](https://github.com/unb-mds/2026-1-Squad07/issues/93) Cliente de API e variáveis de ambiente | [`#94`](https://github.com/unb-mds/2026-1-Squad07/issues/94), [`#95`](https://github.com/unb-mds/2026-1-Squad07/issues/95), [`#96`](https://github.com/unb-mds/2026-1-Squad07/issues/96) | Centraliza chamadas HTTP e reduz URLs hardcoded. |
| [`#94`](https://github.com/unb-mds/2026-1-Squad07/issues/94) Integração de autenticação | Fluxo autenticado da demonstração | Conecta login/cadastro do frontend às rotas reais do backend. |
| [`#95`](https://github.com/unb-mds/2026-1-Squad07/issues/95) Integração de submissão | Fluxo real de cadastro de texto legislativo | Troca simulação do frontend por chamada real ao `POST /laws`. |
| [`#96`](https://github.com/unb-mds/2026-1-Squad07/issues/96) Listagem e detalhe reais | Demonstração de persistência | Usa `GET /laws` e detalhe de submissão para comprovar persistência. |
| [`#99`](https://github.com/unb-mds/2026-1-Squad07/issues/99) Revisão documental da R1 | Apresentação da R1 e revisão do PO | Alinha documentação pública ao estado real da `dev`. |

## Specs relacionadas

| Spec | Status | Relação com requisitos |
| --- | --- | --- |
| `000-documentacao-do-projeto` | Implementada/Ativa | Define o padrão de documentação, SDD e TDD documental usado na R1. |
| `001-integracao-frontend-backend` | Implementada | Orienta a integração entre frontend, backend, API, autenticação, submissão, listagem e validação da demo. |

## Escopo futuro

| Funcionalidade | Issues relacionadas | Motivo para ficar fora da R1 |
| --- | --- | --- |
| SSO e autenticação institucional | A definir | Não é necessário para a demonstração local da R1. |
| CRUD administrativo completo de usuário | [`#45`](https://github.com/unb-mds/2026-1-Squad07/issues/45) | A R1 entrega autenticação básica; administração completa fica para evolução. |
| Recuperação de senha | [`#46`](https://github.com/unb-mds/2026-1-Squad07/issues/46) | Exige fluxo de segurança e envio de e-mail. |
| Detecção avançada de ambiguidade | [`#48`](https://github.com/unb-mds/2026-1-Squad07/issues/48) | Depende de NLP mais sofisticado. |
| Resumo inteligente com IA externa | [`#49`](https://github.com/unb-mds/2026-1-Squad07/issues/49) | Depende de integração externa e políticas de uso. |
| Agente de IA para apoio jurídico | A definir | Deve ser especificado e implementado na R2, após validação do fluxo base. |
| Dashboard completo de qualidade legislativa | [`#50`](https://github.com/unb-mds/2026-1-Squad07/issues/50), [`#51`](https://github.com/unb-mds/2026-1-Squad07/issues/51) | Deve evoluir após a submissão e persistência estarem estáveis. |
