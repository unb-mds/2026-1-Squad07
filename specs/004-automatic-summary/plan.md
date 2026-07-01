# Plano de Implementação: Geração de Resumo Automático via Agente de IA

**Spec**: `specs/004-automatic-summary/spec.md`
**Arquitetura Base**: `docs/architecture/ai-integration.md`

## Visão Geral

O resumo automático é gerado concorrentemente à classificação de problemas no backend FastAPI no momento da avaliação da lei (`POST /api/v1/analysis/evaluate`), sendo posteriormente persistido na tabela `Analysis` no banco de dados e retornado na resposta da API.

```
POST /evaluate ─▶ valida (text/type/lawId?)
                     │
                     ├─▶ cache.get(hash(text)) ── (hit: retorna resultado do cache)
                     │
                     └─▶ (miss) ──▶ asyncio.gather(
                                       ├─▶ provider.analyze(text) -> score, metrics, warnings
                                       └─▶ summary_provider.summarize(text) -> summary
                                    )
                                    │
                     db.analysis.create(..., summary) ◀───┘
```

---

## Decisões de Implementação

| # | Decisão | Justificativa |
| --- | --- | --- |
| P1 | Interface `SummaryProvider` abstrata com implementações `MockSummaryProvider` e `GeminiSummaryProvider`. | Garante modularidade. O `MockSummaryProvider` permite rodar testes e desenvolvimento offline, enquanto `GeminiSummaryProvider` faz chamadas reais. |
| P2 | Chamada direta via `httpx.AsyncClient` à API do Gemini (`gemini-1.5-flash`). | Evita instalar dependências adicionais pesadas (como o SDK do Google AI). `httpx` já está no projeto e suporta requisições assíncronas assíncronas. |
| P3 | Execução concorrente usando `asyncio.gather`. | Minimiza a latência geral executando o classificador LegalBERT-pt e a geração de resumo via API de forma paralela. |
| P4 | Tratamento de erro resiliente (Graceful Fallback). | Caso o provedor de resumo falhe (ex: timeout da API externa ou falta de chave de API), o backend registra o log do erro e completa a análise com `summary = None`, impedindo que a falha do resumo derrube a classificação principal. |
| P5 | Atualização do Prisma e do schema de banco de dados. | Adição do campo `summary String?` ao modelo `Analysis` no `schema.prisma`. Uma nova migration do Prisma será criada para o PostgreSQL. |

---

## Mapeamento de Arquivos a Alterar / Criar

| Arquivo | Ação | Responsabilidade |
| --- | --- | --- |
| `backend/prisma/schema.prisma` | Alterar | Adicionar o campo `summary String?` à tabela `Analysis`. |
| `backend/app/services/summary_provider.py`| Criar | Interface `SummaryProvider` e classes `MockSummaryProvider` e `GeminiSummaryProvider`. |
| `backend/app/models/analysis.py` | Alterar | Adicionar o campo `summary: str | None = None` ao schema Pydantic `AnalysisResponse`. |
| `backend/app/services/analysis/service.py` | Alterar | Modificar `evaluate_text` para integrar `SummaryProvider` concorrentemente via `asyncio.gather` e salvar no DB. |
| `backend/app/api/dependencies.py` | Alterar | Adicionar injeção de dependência para o `SummaryProvider` (inicializado dinamicamente conforme configuração local). |

---

## Performance e Latência

- O modelo `gemini-1.5-flash` é escolhido pela rapidez e menor custo de latência em tarefas de sumarização simples.
- A concorrência assíncrona (`asyncio.gather`) impede que a chamada à API externa adicione latência sequencial sobre o processamento local do LegalBERT-pt.

---

## Estratégia de Testes (TDD)

1. **Testes Unitários**:
   - Validar que o `MockSummaryProvider` retorna o resumo mockado esperado.
   - Validar que o `GeminiSummaryProvider` chama a API do Gemini via `httpx` corretamente, simulando as respostas da API e cenários de erro de rede/timeout (usando `pytest-mock` e `pytest-asyncio`).
2. **Testes de Integração**:
   - Validar que o `AnalysisService` executa a classificação e a sumarização de forma concorrente e persiste o resumo na tabela `Analysis` no banco de dados.
   - Validar o comportamento resiliente do `AnalysisService` caso a sumarização falhe (assegurar que o score e as métricas continuam retornando mesmo com o resumo nulo).
