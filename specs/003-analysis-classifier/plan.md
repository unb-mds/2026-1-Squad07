# Plano de Implementação: Classificador de Análise (LegalBERT-pt)

**Spec**: `specs/003-analysis-classifier/spec.md`
**Arquitetura**: `docs/architecture/ai-integration.md`

## Visão Geral

O fluxo online é orquestrado pelo backend FastAPI. O frontend nunca chama a IA
diretamente (D1). A inferência fica atrás da interface `AnalysisProvider` (D2),
o cache evita reprocessar a inferência (D4) e os resultados são persistidos em
`Analysis`, relacionados a `Law` (D11).

```
POST /evaluate ─▶ valida (text/type/lawId?) ─▶ service.evaluate_text
                                                  │
       cache.get(hash(text+model_version)) ◀──────┤ (hit: pula inferência)
                                                  │
       provider.analyze(text)  ◀──────────────────┤ (miss)
         └ chunking + pooling (D8)                 │
       scoring.score_analysis ─▶ score/metrics/warnings
                                                  │
       se lawId: db.analysis.create (sempre) ◀────┘
```

## Decisões

| # | Decisão | Justificativa |
| --- | --- | --- |
| P1 | Provider em `analysis_provider.py`; scoring/cache/service em pacote `analysis/`. | Separa o detalhe de inferência (modelo) das regras de orquestração. |
| P2 | Carregamento do modelo é **preguiçoso** e injetável (tokenizer/model). | Mantém os testes rápidos e sem baixar pesos; permite mock. |
| P3 | Inferência real (`torch`) isolada em `_infer_logits`/`_ensure_loaded`, marcada `# pragma: no cover`. | Exige modelo real; coberta por validação manual, não no CI. |
| P4 | Pooling e sigmoid em Python puro (sem `torch` no caminho lógico). | Permite testar chunking/pooling com modelo mockado. |
| P5 | `lawId` opcional no `evaluate`; persiste sempre que presente (inclusive cache hit). | Corrige histórico vazio em cache hit e reaproveita a ingestão por `/laws`. |
| P6 | Cache em memória atrás de interface pequena (`AnalysisCache`). | Simples para a R2; pode virar Redis/banco sem mudar chamadores. |
| P7 | Falha do modelo → `AnalysisError` no service → `503` na rota. | Erro explícito, sem score simulado (D6). |

## Mapeamento para Arquivos

| Arquivo | Responsabilidade |
| --- | --- |
| `backend/app/services/analysis_provider.py` | `AnalysisProvider`, `LegalBERTProvider`, taxonomia, mensagens, chunking, pooling. |
| `backend/app/services/analysis/scoring.py` | `score`, `metrics`, `warnings` (estratégia configurável). |
| `backend/app/services/analysis/cache.py` | Cache por hash(texto + `model_version`). |
| `backend/app/services/analysis/service.py` | Orquestração: cache, inferência, scoring, persistência. |
| `backend/app/models/analysis.py` | Schemas Pydantic (`AnalysisRequest`, `AnalysisResponse`, `AnalysisWarning`, `AnalysisHistoryItem`). |
| `backend/app/api/analysis.py` | Rotas `/api/v1/analysis/evaluate` e `/api/v1/laws/{id}/(analysis\|history)`. |
| `backend/requirements.txt` | `transformers`, `torch`. |

## Performance

- Modelo carregado uma vez (preguiçoso, na primeira inferência) e mantido em
  memória.
- Cache reduz latência de textos repetidos.
- Textos longos (chunking) são a principal fonte de latência variável; o
  contrato já está preparado para o modo assíncrono futuro (`202`).

## Estratégia de Testes

TDD com o modelo sempre mockado nos testes automatizados; validação manual com o
modelo real (CPU) + Postgres descrita em `quickstart.md`. Detalhe dos cenários
em `test-plan.md`.
