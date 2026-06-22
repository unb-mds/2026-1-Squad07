# Test Plan — Classificador de Análise (LegalBERT-pt)

O plano de testes canônico desta feature vive na spec funcional, em
[`specs/003-analysis-classifier/test-plan.md`](../specs/003-analysis-classifier/test-plan.md),
junto com a spec, o plano de implementação, as tasks e o quickstart de validação.

**Resumo:** TDD com o modelo (`transformers`/`torch`) sempre mockado nos testes
automatizados (nenhum peso baixado no CI). Os cenários cobrem scoring
(`score`/`metrics`/`warnings`), chunking + pooling acima de 512 tokens, cache por
hash de texto + `model_version`, persistência em `Analysis` (inclusive em cache
hit quando há `lawId`) e os contratos dos endpoints
`POST /api/v1/analysis/evaluate`, `GET /api/v1/laws/{id}/analysis` e
`GET /api/v1/laws/{id}/history`, com os respectivos `404`/`422`/`503`.

Arquivos de teste:

- `tests/unit/test_analysis_scoring.py`
- `tests/unit/test_analysis_provider.py`
- `tests/unit/test_analysis_cache.py`
- `tests/unit/test_analysis_service.py`
- `tests/integration/test_analysis_api.py`

Validação com o modelo real (CPU) + Postgres: ver
[`specs/003-analysis-classifier/quickstart.md`](../specs/003-analysis-classifier/quickstart.md).
