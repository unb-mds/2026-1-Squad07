# Test Plan — Classificador de Análise (LegalBERT-pt)

**Issue**: Implementação do classificador multi-label atrás de `AnalysisProvider`
**Spec**: [`specs/002-requirements-r2/ai-integration.md`](../specs/002-requirements-r2/ai-integration.md)
**Abordagem**: TDD. Os testes abaixo são escritos antes da implementação e o
modelo (LegalBERT-pt / `transformers` + `torch`) é sempre substituído por mocks
nos testes unitários — nenhum peso real é baixado no CI.

## Objetivo

Validar a inferência multi-label, o cálculo de `score`/`metrics`/`warnings`, o
chunking de textos acima de 512 tokens, o cache por hash de texto + versão de
modelo, a persistência em `Analysis` e os contratos dos endpoints
`POST /api/v1/analysis/evaluate` e `GET /api/v1/analysis/{id}/history`.

## Taxonomia testada (R2)

`ambiguidade`, `vagueza`, `falta_referencia`, `inconsistencia` (REQ-015).

## Estratégia de mock

- `AnalysisProvider` é uma interface abstrata; os testes usam um provider falso
  que devolve probabilidades determinísticas por categoria.
- Para o `LegalBERTProvider`, o carregamento do modelo (`transformers`/`torch`)
  é preguiçoso (lazy) e a inferência de logits (`_infer_logits`) é o ponto de
  costura: os testes injetam um tokenizer falso e substituem `_infer_logits`,
  exercitando chunking e pooling sem baixar o modelo real.
- Os delegates do Prisma (`db.analysis`) são substituídos por dublês em memória.

## Cenários

### 1. Scoring (`services/analysis/scoring.py`)

| ID | Cenário | Critério de aceite |
| --- | --- | --- |
| SC-1 | `score = 1 - média(probabilidades)` | Probabilidades conhecidas → score esperado (REQ-011). |
| SC-2 | `metrics` contém a probabilidade por categoria | Uma entrada por categoria da taxonomia. |
| SC-3 | `warnings` lista categorias acima do limiar com `confidence` | Só categorias `>= threshold`; cada uma com `category` e `confidence`. |
| SC-4 | Nenhuma categoria acima do limiar | `warnings` vazio e score alto. |
| SC-5 | Estratégia de scoring é configurável | Estratégia inválida levanta erro explícito. |

### 2. Provider, chunking e pooling (`services/analysis_provider.py`)

| ID | Cenário | Critério de aceite |
| --- | --- | --- |
| PR-1 | Texto curto (<= 512 tokens) gera 1 chunk | `analyze` retorna dict com as 4 categorias. |
| PR-2 | Texto acima de 512 tokens é dividido em vários chunks | Nº de chunks = ceil(tokens / 512) (D8). |
| PR-3 | Pooling por média entre chunks | Probabilidade final = média por categoria entre chunks (REQ-011). |
| PR-4 | `model_version` exposto pelo provider | String não vazia e estável. |
| PR-5 | Texto sem tokens levanta erro explícito | `ValueError`, sem score inventado (D6/REQ-007). |
| PR-6 | Interface `AnalysisProvider` é abstrata | Instanciar a classe base falha; trocar de provider não muda o resto. |

### 3. Cache (`services/analysis/cache.py`)

| ID | Cenário | Critério de aceite |
| --- | --- | --- |
| CA-1 | Chave = hash(texto + model_version) | Mesmo texto e versão → mesma chave (D4). |
| CA-2 | Texto diferente → chave diferente | Hash distingue entradas. |
| CA-3 | Versão de modelo diferente → chave diferente | Nova versão invalida o cache (D4). |
| CA-4 | `get`/`set` retornam o valor armazenado | Round-trip preserva o resultado. |

### 4. Service / orquestração (`services/analysis/service.py`)

| ID | Cenário | Critério de aceite |
| --- | --- | --- |
| SV-1 | Primeira chamada computa e retorna `cached: false` | Provider é chamado uma vez. |
| SV-2 | Segunda chamada com mesmo texto retorna `cached: true` | Provider NÃO é chamado de novo. |
| SV-3 | Resultado é persistido em `Analysis` quando há `lawId` | `db.analysis.create` recebe score/metrics/warnings/modelVersion. |
| SV-4 | Sem `lawId`, retorna resultado sem persistir | `db.analysis.create` não é chamado. |
| SV-5 | Falha do provider não retorna score simulado | Levanta `AnalysisError` (D6/REQ-007). |

### 5. Endpoints (`api/analysis.py`)

| ID | Cenário | Critério de aceite |
| --- | --- | --- |
| EP-1 | `POST /evaluate` retorna o schema completo | `score`, `metrics`, `warnings`, `model_version`, `cached`. |
| EP-2 | `POST /evaluate` com texto vazio → 422 | Validação de schema (Pydantic). |
| EP-3 | Segunda chamada idêntica retorna `cached: true` | Cache atravessa o endpoint. |
| EP-4 | Falha do provider → erro explícito (502) | Sem score/metrics simulados (REQ-007). |
| EP-5 | `GET /{id}/history` retorna análises da lei em ordem desc | Consulta por `lawId`, ordenado por `createdAt`. |
| EP-6 | `GET /{id}/history` sem análises → lista vazia | Não inventa dados. |

## Cobertura

Meta `>= 90%` em `backend/app/` (linha `fail_under = 90` em `pytest.ini`). O
caminho real de carregamento do modelo e da inferência com `torch` é marcado com
`# pragma: no cover`, pois exige o download do modelo e é validado manualmente
com leis reais, não no CI.

## Validação manual (leis reais)

`POST /api/v1/analysis/evaluate` com o texto de uma lei real do acervo deve
retornar `score` em `[0, 1]`, `metrics` com as 4 categorias e `warnings`
coerentes — executado fora do CI, com o modelo carregado.
