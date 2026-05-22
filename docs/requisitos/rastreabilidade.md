# Matriz de Rastreabilidade

## Objetivo

Esta matriz relaciona requisitos, issues, áreas do projeto e prioridade para a Release 1. O objetivo é permitir que a equipe acompanhe quais requisitos estão cobertos por tarefas reais da Sprint 8 e quais itens ficam planejados para versões futuras.

## Rastreabilidade dos requisitos funcionais

| Requisito | Descrição resumida | Issues relacionadas | Prioridade R1 | Área principal |
| --- | --- | --- | --- | --- |
| RF01 | Submeter texto legislativo | [`#40`](https://github.com/unb-mds/2026-1-Squad07/issues/40), [`#75`](https://github.com/unb-mds/2026-1-Squad07/issues/75) | Must have | Frontend/API |
| RF02 | Receber submissão via API | [`#40`](https://github.com/unb-mds/2026-1-Squad07/issues/40) | Must have | Backend/API |
| RF03 | Persistir submissão legislativa | [`#29`](https://github.com/unb-mds/2026-1-Squad07/issues/29), [`#40`](https://github.com/unb-mds/2026-1-Squad07/issues/40) | Must have | Banco/Backend |
| RF04 | Listar submissões cadastradas | [`#76`](https://github.com/unb-mds/2026-1-Squad07/issues/76) | Must have | Backend/Frontend |
| RF05 | Consultar detalhes de uma submissão | [`#76`](https://github.com/unb-mds/2026-1-Squad07/issues/76) | Must have | Backend/Frontend |
| RF06 | Consultar textos legislativos de exemplo | [`#60`](https://github.com/unb-mds/2026-1-Squad07/issues/60) | Must have | Dados/Documentação |
| RF07 | Exibir resultado básico ou status | [`#40`](https://github.com/unb-mds/2026-1-Squad07/issues/40), [`#60`](https://github.com/unb-mds/2026-1-Squad07/issues/60) | Should have | Backend/Frontend |
| RF08 | Disponibilizar documentação da R1 | [`#57`](https://github.com/unb-mds/2026-1-Squad07/issues/57), [`#68`](https://github.com/unb-mds/2026-1-Squad07/issues/68), [`#72`](https://github.com/unb-mds/2026-1-Squad07/issues/72) | Should have | Documentação |
| RF09 | Calcular índice inicial de legibilidade | [`#41`](https://github.com/unb-mds/2026-1-Squad07/issues/41) | Could have | Backend/NLP |
| RF10 | Calcular score final de qualidade | [`#42`](https://github.com/unb-mds/2026-1-Squad07/issues/42) | Could have | Backend/NLP |
| RF11 | Exibir relatório visual de qualidade | [`#43`](https://github.com/unb-mds/2026-1-Squad07/issues/43), [`#44`](https://github.com/unb-mds/2026-1-Squad07/issues/44), [`#50`](https://github.com/unb-mds/2026-1-Squad07/issues/50), [`#51`](https://github.com/unb-mds/2026-1-Squad07/issues/51) | Could have | Frontend/Dados |

## Rastreabilidade dos requisitos não funcionais

| Requisito | Categoria | Issues relacionadas | Critério principal |
| --- | --- | --- | --- |
| RNF01 | Usabilidade | [`#65`](https://github.com/unb-mds/2026-1-Squad07/issues/65), [`#75`](https://github.com/unb-mds/2026-1-Squad07/issues/75), [`#76`](https://github.com/unb-mds/2026-1-Squad07/issues/76) | Interface sem sobreposição e alinhada ao protótipo. |
| RNF02 | Manutenibilidade | [`#40`](https://github.com/unb-mds/2026-1-Squad07/issues/40) | API organizada e testável localmente. |
| RNF03 | Dados | [`#29`](https://github.com/unb-mds/2026-1-Squad07/issues/29), [`#40`](https://github.com/unb-mds/2026-1-Squad07/issues/40), [`#76`](https://github.com/unb-mds/2026-1-Squad07/issues/76) | Persistência estruturada das submissões. |
| RNF04 | Arquitetura | [`#29`](https://github.com/unb-mds/2026-1-Squad07/issues/29), [`#40`](https://github.com/unb-mds/2026-1-Squad07/issues/40), [`#75`](https://github.com/unb-mds/2026-1-Squad07/issues/75), [`#76`](https://github.com/unb-mds/2026-1-Squad07/issues/76) | Separação entre frontend, backend e banco. |
| RNF05 | Segurança/configuração | [`#29`](https://github.com/unb-mds/2026-1-Squad07/issues/29) | Configuração sensível por variáveis de ambiente. |
| RNF06 | Documentação | [`#57`](https://github.com/unb-mds/2026-1-Squad07/issues/57), [`#68`](https://github.com/unb-mds/2026-1-Squad07/issues/68), [`#72`](https://github.com/unb-mds/2026-1-Squad07/issues/72) | Documentação em `docs/`, pronta para publicação. |
| RNF07 | Processo | [`#61`](https://github.com/unb-mds/2026-1-Squad07/issues/61), [`#77`](https://github.com/unb-mds/2026-1-Squad07/issues/77) | Integração por branch e Pull Request. |
| RNF08 | Operação | [`#29`](https://github.com/unb-mds/2026-1-Squad07/issues/29), [`#40`](https://github.com/unb-mds/2026-1-Squad07/issues/40), [`#75`](https://github.com/unb-mds/2026-1-Squad07/issues/75), [`#76`](https://github.com/unb-mds/2026-1-Squad07/issues/76) | Execução local mínima do fluxo da R1. |
| RNF09 | Gestão de produto | [`#57`](https://github.com/unb-mds/2026-1-Squad07/issues/57), [`#68`](https://github.com/unb-mds/2026-1-Squad07/issues/68), [`#77`](https://github.com/unb-mds/2026-1-Squad07/issues/77) | Escopo R1/R2 separado e validado. |
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

## Escopo futuro

| Funcionalidade | Issues relacionadas | Motivo para ficar fora da R1 |
| --- | --- | --- |
| Cadastro e login de usuário | [`#36`](https://github.com/unb-mds/2026-1-Squad07/issues/36), [`#37`](https://github.com/unb-mds/2026-1-Squad07/issues/37) | Não é necessário para demonstrar o fluxo de submissão legislativa. |
| Autenticação JWT | [`#38`](https://github.com/unb-mds/2026-1-Squad07/issues/38) | Aumenta complexidade e risco técnico. |
| CRUD completo de usuário | [`#45`](https://github.com/unb-mds/2026-1-Squad07/issues/45) | Não é parte do fluxo principal da R1. |
| Recuperação de senha | [`#46`](https://github.com/unb-mds/2026-1-Squad07/issues/46) | Exige fluxo de segurança e envio de e-mail. |
| Detecção avançada de ambiguidade | [`#48`](https://github.com/unb-mds/2026-1-Squad07/issues/48) | Depende de NLP mais sofisticado. |
| Resumo inteligente com IA externa | [`#49`](https://github.com/unb-mds/2026-1-Squad07/issues/49) | Depende de integração externa e políticas de uso. |
| Dashboard completo de qualidade legislativa | [`#50`](https://github.com/unb-mds/2026-1-Squad07/issues/50), [`#51`](https://github.com/unb-mds/2026-1-Squad07/issues/51) | Deve evoluir após a submissão e persistência estarem estáveis. |
