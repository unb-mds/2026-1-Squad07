# Feature Specification: Integração IA → Backend (R2)

**Branch**: `docs/issue-106-ai-integration`
**Criado em**: 2026-06-11
**Status**: Especificação arquitetural (planejamento R2)
**Issues**: #106
**Épico**: motor-inteligência-nlp

## Objetivo

Especificar a arquitetura de integração entre frontend, backend e o classificador de IA do **CrivoAI**, removendo a incerteza que dificulta o planejamento das sprints da R2. A análise usa o modelo **LegalBERT-pt** como classificador multi-label de problemas do texto legislativo, levantado no estudo do Squad de [Agentes de IA e PLN](../../estudos/sprint3/Estudo(Agentes%20de%20IA%20e%20PLN)%20-%20Agentes%20de%20IA%20e%20Processamento%20de%20Linguagem%20Natural.md). A spec define contratos, decisões de integração, fluxos síncrono e assíncrono, cache, versionamento e o plano de validação da própria documentação.

A descrição arquitetural detalhada vive em [`docs/architecture/ai-integration.md`](../../docs/architecture/ai-integration.md). Esta spec registra escopo, requisitos verificáveis e o plano de validação no formato SDD/TDD do projeto.

## Contexto

Na R1, a análise real de IA, o score real e o agente jurídico estão fora de escopo; os indicadores do protótipo são demonstrativos. A R2 introduz a análise real, e sem arquitetura definida o time não consegue dividir tarefas nem validar decisões de desempenho.

As [Métricas de Sucesso da IA](../../docs/architecture/ai-success-metrics.md) já definem qualidade, performance e monitoramento. Esta spec usa esses valores como base para as decisões de integração e não os redefine.

## Escopo

### Incluído

- Documento de arquitetura `docs/architecture/ai-integration.md` com diagrama de componentes, fluxos e contratos.
- Esta spec `specs/002-requirements-r2/ai-integration.md` com requisitos e plano de validação.
- Definição dos endpoints `POST /api/v1/analysis/evaluate` e `GET /api/v1/analysis/{id}/history` com schemas.
- Decisão documentada de síncrono vs. assíncrono e de integração interna vs. externa.
- Distinção entre o fluxo **offline** (classificar acervo, treinar, popular catálogo) e o fluxo **online** (classificação sob demanda do usuário).
- Reuso do catálogo via `Law.sourceType = CATALOG`.
- Política de cache e versionamento de modelos.

### Fora de Escopo

- Implementação do serviço de IA, do modelo ou do agente jurídico.
- Criação real dos endpoints, modelos Prisma ou rotas no backend.
- Pipeline de treinamento: preparação do dataset, ciclo de fine-tuning e métricas de treino (tema de ciclo de vida de ML, não de integração).
- Alinhamento das rotas da R1 ao prefixo `/api/v1/`.

## R2 Completa

A R2 separa dois fluxos: **offline**, em que um acervo é classificado, usado para treinar o LegalBERT-pt e persistido como catálogo (`Law.sourceType = CATALOG`); e **online**, em que o usuário envia uma lei nova/atualizada e o backend a classifica na hora com o modelo já treinado.

No fluxo online, o backend orquestra a inferência do LegalBERT-pt por trás de uma interface estável (`AnalysisProvider`). O modelo é auto-hospedado (`transformers` + `torch`), carregado no processo do backend e podendo evoluir para um serviço de inferência separado. Ele classifica o texto em categorias de problema (multi-label); o backend deriva `score`, `metrics` e `warnings` a partir das probabilidades. O endpoint de avaliação inicia síncrono, com contrato preparado para modo assíncrono (relevante para textos longos com chunking). Resultados são cacheados por hash de texto + versão de modelo e o histórico por submissão é persistido.

## Futuro

- Migração do módulo de análise para microserviço externo.
- Processamento assíncrono com fila e status.
- Suporte a mais tipos legislativos além de `bill` e `amendment`.
- Comparação de versões de modelo no histórico.

## Decisões Arquiteturais

| # | Decisão | Justificativa |
| --- | --- | --- |
| D1 | Backend orquestra; frontend não chama a IA diretamente. | Respeita a separação de camadas (RNF04). |
| D2 | LegalBERT-pt auto-hospedado, carregado no processo do backend, atrás de `AnalysisProvider`. | Modelo leve para fine-tuning; mantém execução local (RNF08) e não envia texto a API externa de terceiros. |
| D3 | Endpoint síncrono na R2, contrato preparado para assíncrono. | Alinhado ao alvo de 2 s / limite de 5 s; chunking de textos longos pode exigir assíncrono. |
| D4 | Cache por hash de texto + `model_version`. | Reduz latência e custo; nova versão invalida naturalmente. |
| D5 | Namespace versionado `/api/v1/` para os novos contratos. | Padroniza contratos a partir da R2. |
| D6 | Sem fallback simulado; falha retorna erro explícito. | Evita apresentar resultado inventado como análise real. |
| D7 | Classificação multi-label de problemas; `score`/`metrics`/`warnings` derivados das probabilidades. | Alinha a saída do classificador ao contrato da issue e ao foco de "monitoramento de qualidade". |
| D8 | Textos acima de 512 tokens tratados por chunking + pooling. | Leis são extensas e excedem o limite do BERT. |
| D9 | Dois fluxos: offline (catálogo + treino, em lote) e online (sob demanda, no caminho de requisição). | Têm latências e objetivos diferentes; o treino não pode ficar no caminho da requisição. |
| D10 | Catálogo de leis classificadas reusa `Law.sourceType = CATALOG`. | O valor já existe no schema e na migration; evita criar estrutura paralela. |

## Requisitos

- **REQ-001**: O documento `docs/architecture/ai-integration.md` DEVE conter diagrama de componentes (Frontend → Backend → IA) em Mermaid.
- **REQ-002**: A arquitetura DEVE definir os contratos de `POST /api/v1/analysis/evaluate` e `GET /api/v1/analysis/{id}/history` com schemas de entrada e saída.
- **REQ-003**: A decisão entre processamento síncrono e assíncrono DEVE estar documentada e justificada com base nas métricas de latência.
- **REQ-004**: A decisão entre integração interna (módulo) e externa (microserviço) DEVE estar documentada com critérios de evolução.
- **REQ-005**: O contrato de resposta DEVE incluir `model_version` e `cached`, suportando cache e versionamento.
- **REQ-006**: O frontend NÃO DEVE acessar o serviço de IA diretamente; toda chamada passa pelo backend.
- **REQ-007**: O tratamento de erros DEVE ser explícito e NÃO DEVE retornar score ou métricas simulados em caso de falha.
- **REQ-008**: A documentação DEVE deixar claro que a análise real é planejada para a R2 e não existe na R1.
- **REQ-009**: A página de arquitetura DEVE ser incluída na navegação do MkDocs.
- **REQ-010**: A arquitetura DEVE registrar que o LegalBERT-pt é auto-hospedado localmente, sem envio de texto a API externa de terceiros.
- **REQ-011**: O `score` DEVE ser derivado das probabilidades do classificador; `metrics` DEVE conter a probabilidade por categoria e `warnings` DEVE conter as categorias acima de limiar com `confidence`.
- **REQ-012**: A arquitetura DEVE documentar o tratamento de textos acima de 512 tokens (chunking + pooling) e a justificativa das dependências `transformers`/`torch`.
- **REQ-013**: A arquitetura DEVE distinguir o fluxo offline (catálogo + treino) do fluxo online (sob demanda), deixando claro que o treino não fica no caminho da requisição.
- **REQ-014**: O catálogo de leis classificadas DEVE reusar `Law.sourceType = CATALOG`, sem criar estrutura paralela.

## Plano de Validação (TDD Documental)

Esta é uma spec documental; a validação segue TDD documental conforme `specs/AGENTS.md`. Cada critério abaixo deve ser verificável antes de considerar a tarefa concluída.

| Verificação | Como validar | Critério de aceite |
| --- | --- | --- |
| V1 - Documento existe e está completo | Abrir `docs/architecture/ai-integration.md` | Contém objetivo, componentes, decisões, endpoints, performance e estado atual. |
| V2 - Spec existe | Abrir este arquivo | Contém escopo, requisitos e plano de validação. |
| V3 - Diagrama Mermaid renderiza | `mkdocs serve` e abrir a página | Diagrama de componentes e sequência renderizam sem erro. |
| V4 - Endpoints com schemas | Ler seção de endpoints | Request/response e tabelas de campos presentes para os dois endpoints. |
| V5 - Decisão sync vs. async | Ler seção de decisões | Decisão tomada, justificada e ligada às métricas de latência. |
| V6 - Navegação atualizada | Verificar `mkdocs.yml` e navegação | Página aparece na seção Arquitetura. |
| V7 - Coerência com escopo | Revisão cruzada com `ai-success-metrics.md` e `index.md` | Sem contradição de escopo, RNFs ou estado atual. |

## Critérios de Sucesso

- **SC-001**: `docs/architecture/ai-integration.md` criado e completo.
- **SC-002**: `specs/002-requirements-r2/ai-integration.md` criado.
- **SC-003**: Diagrama de componentes em Mermaid incluído e renderizável.
- **SC-004**: Endpoints especificados com schemas de input/output.
- **SC-005**: Fluxo síncrono vs. assíncrono decidido e documentado.
- **SC-006**: Página adicionada à navegação do MkDocs e validada com `mkdocs serve`.
- **SC-007**: Revisão com arquiteto, backend lead e ML lead registrada no PR.

## Decisões Resolvidas

- **R-001** (era ambiguidade de modelo): o modelo é o **LegalBERT-pt**, usado como classificador multi-label de problemas. Resolvido com o time em 2026-06-11.

## Pendências (NEEDS CLARIFICATION)

- **NC-001**: Confirmar se a entidade de análise será persistida em nova tabela Prisma (`Analysis`) ou associada a `Law`; definir antes da implementação da R2.
- **NC-002**: Definir o identificador usado em `GET /api/v1/analysis/{id}/history` — `analysis_id` ou `submission_id` (`law.id`). Esta spec assume o identificador da submissão.
- **NC-003**: Definir a **taxonomia das categorias de problema** que o LegalBERT-pt deve classificar (ex.: ambiguidade, vagueza, falta de referência, inconsistência) e a base rotulada usada no fine-tuning.
- **NC-004**: Definir a **fórmula de agregação** das probabilidades para o `score` geral e a estratégia de pooling entre chunks (máximo, média ou outra).
- **NC-005**: Definir se leis enviadas por usuários (`USER_UPLOAD`) podem **realimentar** o catálogo e o conjunto de treino (e com qual revisão humana), ou se o catálogo é populado apenas pelo acervo curado offline.
- **NC-006**: Definir como o catálogo classificado armazena o resultado da classificação — em campos próprios de `Law`, em tabela de análise associada (ver NC-001) ou ambos.

## Referências

- Issue #106.
- [`docs/architecture/ai-integration.md`](../../docs/architecture/ai-integration.md).
- [`docs/architecture/ai-success-metrics.md`](../../docs/architecture/ai-success-metrics.md).
- [`docs/architecture/index.md`](../../docs/architecture/index.md).
- `backend/app/models/law.py` e `backend/app/api/laws.py` (padrão de schemas e rotas).
- `backend/prisma/schema.prisma` (modelo de dados atual).
- `estudos/sprint3/Estudo(Agentes de IA e PLN) - Agentes de IA e Processamento de Linguagem Natural.md` (LegalBERT-pt).
