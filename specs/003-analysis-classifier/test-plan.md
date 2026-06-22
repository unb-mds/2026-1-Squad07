# Test Plan: Classificador de Análise (LegalBERT-pt)

**Spec**: `specs/003-analysis-classifier/spec.md`
**Abordagem**: TDD. O modelo (`transformers`/`torch`) é sempre mockado nos testes
automatizados — nenhum peso é baixado no CI. A validação com o modelo real fica
no `quickstart.md`.

## Estratégia de mock

- `AnalysisProvider` é abstrato; testes usam um provider falso com probabilidades
  determinísticas.
- No `LegalBERTProvider`, o carregamento (`transformers`/`torch`) é preguiçoso e
  `_infer_logits` é o ponto de costura: testes injetam um tokenizer falso e
  substituem `_infer_logits`, exercitando chunking e pooling sem baixar o modelo.
- Delegates do Prisma (`db.law`, `db.analysis`) são substituídos por dublês.

## Cenários

### Scoring — `services/analysis/scoring.py`

| ID | Cenário | Critério |
| --- | --- | --- |
| SC-1 | `score = 1 - média(probabilidades)` | Probabilidades conhecidas → score esperado. |
| SC-2 | `metrics` por categoria | Uma entrada por categoria; cópia defensiva. |
| SC-3 | `warnings` acima do limiar | `code`/`message`/`confidence`, ordenados desc. |
| SC-4 | Nada acima do limiar | `warnings` vazio. |
| SC-5 | Estratégia inválida | Erro explícito (`ValueError`). |

### Provider, chunking e pooling — `services/analysis_provider.py`

| ID | Cenário | Critério |
| --- | --- | --- |
| PR-1 | Texto curto → 1 chunk | Saída com as 4 categorias. |
| PR-2 | Texto > 512 tokens → vários chunks | Nº de chunks = ceil(tokens / 512). |
| PR-3 | Pooling por média entre chunks | Probabilidade final = média por categoria. |
| PR-4 | `model_version` exposto | String não vazia e estável. |
| PR-5 | Texto sem tokens | `ValueError`, sem score inventado. |
| PR-6 | Interface abstrata | Instanciar `AnalysisProvider` falha. |

### Cache — `services/analysis/cache.py`

| ID | Cenário | Critério |
| --- | --- | --- |
| CA-1..3 | Chave = hash(texto + `model_version`) | Mesmo texto/versão → mesma chave; texto/versão diferente → chave diferente. |
| CA-4 | `get`/`set`/`clear` | Round-trip preserva o valor. |

### Service / orquestração — `services/analysis/service.py`

| ID | Cenário | Critério |
| --- | --- | --- |
| SV-1 | 1ª chamada computa | `cached: false`, `analysis_id`, `status: completed`. |
| SV-2 | 2ª chamada (mesmo texto) | `cached: true`, provider chamado 1x. |
| SV-3 | Com `lawId` persiste | `db.analysis.create` com `law: connect` + `Json`. |
| SV-4 | Sem `lawId` não persiste | Nenhuma gravação. |
| SV-5 | Falha do provider | `AnalysisError`, sem persistência. |
| SV-6 | **Cache hit com `lawId` ainda persiste** | Avaliar sem `lawId` e depois com `lawId` grava a análise (`cached: true`). |

### Endpoints — `api/analysis.py`

| ID | Cenário | Critério |
| --- | --- | --- |
| EP-1 | `POST /evaluate` | 200 com `analysis_id`, `status`, `score`, `metrics`, `warnings`, `model_version`, `cached`. |
| EP-2 | Entrada inválida | `422` para texto vazio, `type` ausente ou `type` fora do enum. |
| EP-3 | Segunda chamada | `cached: true`. |
| EP-4 | `lawId` inexistente | `404`, sem chamar o modelo. |
| EP-5 | `lawId` existente | Persiste a análise da lei. |
| EP-6 | Falha do modelo | `503`, sem score simulado. |
| EP-7 | `GET /laws/{id}/analysis` | Análise mais recente da lei. |
| EP-8 | Latest sem lei / sem análise | `404` em ambos os casos. |
| EP-9 | `GET /laws/{id}/history` | Itens `{timestamp, score, model_version}` em ordem desc. |
| EP-10 | History sem lei | `404`. |

## Cobertura

Meta `>= 90%` em `backend/app/` (`pytest.ini` exige `fail_under = 90`). O
carregamento real do modelo e a inferência com `torch` são `# pragma: no cover`.

## Mapa para os testes automatizados

- `backend/tests/unit/test_analysis_scoring.py` — SC-*
- `backend/tests/unit/test_analysis_provider.py` — PR-*
- `backend/tests/unit/test_analysis_cache.py` — CA-*
- `backend/tests/unit/test_analysis_service.py` — SV-*
- `backend/tests/integration/test_analysis_api.py` — EP-*
