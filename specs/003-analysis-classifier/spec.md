# Feature Specification: Classificador de Análise (LegalBERT-pt) — R2

**Branch**: `feat/analysis-classifier`
**Criado em**: 2026-06-22
**Status**: Em implementação
**Issues**: implementação do classificador (épico motor-inteligência-nlp)
**Depende de**: spec arquitetural [`specs/002-requirements-r2/ai-integration.md`](../002-requirements-r2/ai-integration.md) (#106) e migration da tabela `Analysis`.

## Objetivo

Implementar o **fluxo online** de análise de qualidade de textos legislativos do
CrivoAI: classificar um texto sob demanda com o **LegalBERT-pt** (classificador
multi-label de problemas), derivar `score`/`metrics`/`warnings`, cachear por
texto + versão de modelo e persistir o resultado em `Analysis`, expondo os
contratos versionados definidos na arquitetura.

Esta spec é a **especificação funcional** da implementação. A spec #106 é
arquitetural (define contratos e decisões) e marca a implementação como fora de
escopo; este documento traz escopo de implementação, requisitos verificáveis,
contratos efetivos e o plano de validação no formato SDD/TDD do projeto.

## Contexto

A arquitetura está descrita em [`docs/architecture/ai-integration.md`](../../docs/architecture/ai-integration.md),
que define o classificador atrás da interface `AnalysisProvider`, o cache por
hash de texto + `model_version`, a persistência em `Analysis` e os três
contratos HTTP. A taxonomia inicial da R2 é `ambiguidade`, `vagueza`,
`falta_referencia`, `inconsistencia`.

O **treinamento do modelo** (fluxo offline: dataset, fine-tuning, métricas de
treino) está **fora de escopo** — é outra frente. Esta implementação entrega a
*integração* do fluxo online; até existir um checkpoint treinado, o classificador
carrega o LegalBERT-pt base com cabeça de classificação não treinada, o que
valida o encanamento ponta a ponta sem produzir predições calibradas.

## Escopo

### Incluído

- Interface `AnalysisProvider` e implementação `LegalBERTProvider`
  (`transformers` + `torch`, carregamento preguiçoso), em
  `backend/app/services/analysis_provider.py`.
- Chunking + pooling por média para textos acima de 512 tokens (D8).
- Derivação de `score`, `metrics` e `warnings` em
  `backend/app/services/analysis/scoring.py`, com estratégia configurável.
- Cache por hash do texto + `model_version`
  (`backend/app/services/analysis/cache.py`).
- Orquestração e persistência em `Analysis`
  (`backend/app/services/analysis/service.py`).
- Endpoints versionados: `POST /api/v1/analysis/evaluate`,
  `GET /api/v1/laws/{id}/analysis`, `GET /api/v1/laws/{id}/history`.
- Dependências `transformers` e `torch` no `requirements.txt`.
- Testes unitários e de integração com o modelo mockado.

### Fora de Escopo

- Treinamento/fine-tuning do modelo e preparação de dataset (fluxo offline).
- Processamento assíncrono com fila e status (`202 Accepted`) — contrato já
  preparado, mas não implementado na R2.
- População do catálogo (`Law.sourceType = CATALOG`).
- Alinhamento das rotas da R1 (`/auth`, `/laws`, `/health`) ao prefixo
  `/api/v1/`.

## Decisão de implementação: vínculo `evaluate` ↔ `Law`

O contrato de `POST /api/v1/analysis/evaluate` recebe `{ text, type }`, mas a
tabela `Analysis` exige uma `Law` para persistir e as consultas de análise são
por `law.id`. Resolução adotada:

> O `evaluate` aceita um campo **opcional `lawId`**. Quando informado, a lei é
> validada (404 se não existir), o texto é analisado e o resultado é **sempre
> persistido** (inclusive em cache hit). Quando ausente, o `evaluate` funciona
> como um *preview* sem persistência, retornando `analysis_id` gerado. As
> consultas `GET /api/v1/laws/{id}/analysis` e `.../history` operam sobre as
> análises persistidas da lei.

Isso reaproveita a ingestão de leis já existente (`POST /laws`), mantém o
contrato `{ text, type }` documentado (campo opcional é aditivo) e habilita o
histórico por lei.

## Requisitos

- **REQ-001**: O classificador DEVE ficar atrás da interface `AnalysisProvider`,
  permitindo trocar o modelo sem alterar scoring, cache, service ou rotas.
- **REQ-002**: `LegalBERTProvider` DEVE carregar o modelo via `transformers` +
  `torch` e DEVE tratar textos acima de 512 tokens por chunking + pooling por
  média por categoria.
- **REQ-003**: O `score` DEVE ser `1 - média(probabilidades por categoria)`;
  `metrics` DEVE conter a probabilidade por categoria; `warnings` DEVE conter as
  categorias acima de um limiar configurável, cada uma com `code`, `message` e
  `confidence`.
- **REQ-004**: O cache DEVE ser chaveado por hash do texto + `model_version` e a
  segunda chamada com o mesmo texto DEVE retornar `cached: true` sem reprocessar
  a inferência.
- **REQ-005**: Havendo `lawId`, cada execução DEVE persistir uma linha em
  `Analysis`, **inclusive em cache hit** (o cache evita só a inferência, não a
  persistência).
- **REQ-006**: `POST /api/v1/analysis/evaluate` DEVE validar `{ text (não vazio),
  type ∈ {bill, amendment} }`, retornando `422` para entrada inválida sem chamar
  o modelo.
- **REQ-007**: `GET /api/v1/laws/{id}/analysis` DEVE retornar a análise mais
  recente da lei e `404` quando a lei não existir ou não tiver análise.
- **REQ-008**: `GET /api/v1/laws/{id}/history` DEVE retornar o histórico em ordem
  decrescente e `404` quando a lei não existir.
- **REQ-009**: Falha do serviço de IA DEVE retornar `503` e NÃO DEVE apresentar
  score ou métricas simulados (sem fallback inventado).
- **REQ-010**: A resposta de análise DEVE conter `analysis_id`, `status`,
  `score`, `metrics`, `warnings`, `model_version` e `cached`.
- **REQ-011**: A cobertura de testes do backend DEVE ser `>= 90%`, com o modelo
  mockado nos testes unitários e de integração.

## Contratos

Os contratos seguem [`docs/architecture/ai-integration.md`](../../docs/architecture/ai-integration.md#endpoints-da-api).

### POST /api/v1/analysis/evaluate

Request:

```json
{ "text": "Art. 1 ...", "type": "bill", "lawId": "opcional" }
```

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `text` | string não vazia | Sim | Texto legislativo a analisar. |
| `type` | `bill` \| `amendment` | Sim | Tipo do texto. |
| `lawId` | string | Não | Lei a vincular/persistir; valida 404 se não existir. |

Response 200:

```json
{
  "analysis_id": "uuid",
  "status": "completed",
  "score": 0.60,
  "metrics": { "ambiguidade": 0.71, "vagueza": 0.18,
               "falta_referencia": 0.62, "inconsistencia": 0.09 },
  "warnings": [
    { "code": "ambiguidade", "message": "Possível ambiguidade: ...",
      "confidence": 0.71 }
  ],
  "model_version": "legalbert-pt-v1",
  "cached": false
}
```

### GET /api/v1/laws/{id}/analysis

Retorna a análise mais recente da lei (mesmo schema acima). `404` se a lei não
existir ou não tiver análise.

### GET /api/v1/laws/{id}/history

Retorna o histórico em ordem decrescente; `404` se a lei não existir.

```json
[ { "timestamp": "2026-06-22T12:46:43Z", "score": 0.49,
    "model_version": "legalbert-pt-v1" } ]
```

## Critérios de Aceite

- **SC-001**: Interface `AnalysisProvider` + `LegalBERTProvider` implementadas.
- **SC-002**: `POST /api/v1/analysis/evaluate` funciona com texto de lei real.
- **SC-003**: Chunking funciona para textos acima de 512 tokens.
- **SC-004**: Segunda chamada com o mesmo texto retorna `cached: true`.
- **SC-005**: Com `lawId`, o resultado persiste em `Analysis`, inclusive em
  cache hit; o histórico reflete cada execução.
- **SC-006**: `GET /api/v1/laws/{id}/analysis` e `.../history` retornam os dados
  corretos e `404` nos casos previstos.
- **SC-007**: Falha do modelo retorna `503` sem resultado simulado.
- **SC-008**: Cobertura `>= 90%` com o modelo mockado.

## Referências

- [`docs/architecture/ai-integration.md`](../../docs/architecture/ai-integration.md)
- [`specs/002-requirements-r2/ai-integration.md`](../002-requirements-r2/ai-integration.md)
- `backend/prisma/schema.prisma` (tabela `Analysis`)
