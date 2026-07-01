# Test Plan: Geração de Resumo Automático via Agente de IA

**Spec**: `specs/004-automatic-summary/spec.md`
**Abordagem**: TDD. O serviço de sumarização é testado com dublês (mocks/stubs) para a API externa do Gemini. Nenhum request de rede real é disparado para a API do Gemini durante os testes automatizados do CI.

---

## Estratégia de Mocks

- **Sumarização Externa**: A classe `GeminiSummaryProvider` será testada interceptando as chamadas HTTP efetuadas via `httpx.AsyncClient` (usando `pytest-mock` ou a biblioteca `respx` se disponível, ou mockando o método `post` do cliente HTTP).
- **Orquestração**: Nos testes unitários de `AnalysisService`, o `SummaryProvider` é substituído por um `MockSummaryProvider` determinístico.
- **Banco de Dados**: O Prisma client é mockado nos testes unitários para validar a passagem do campo `summary` para o método `create` do Prisma.

---

## Cenários de Teste

### SummaryProvider — `services/summary_provider.py`

| ID | Cenário | Critério |
| --- | --- | --- |
| SM-1 | `MockSummaryProvider` retorna o mock esperado | O resumo retornado é uma string fixa não vazia correspondente ao mock padrão. |
| SM-2 | `GeminiSummaryProvider` sem chave de API | Falha com erro explícito (`ValueError`) na inicialização ou retorna `None` no fluxo seguro. |
| SM-3 | Chamada com sucesso na API do Gemini | O payload correto é enviado ao endpoint do Gemini e a resposta `["candidates"][0]["content"]["parts"][0]["text"]` é extraída com sucesso. |
| SM-4 | API do Gemini retorna HTTP Error (ex: 429, 500) | O provedor captura o erro de HTTP e lança `SummaryError` (ou retorna `None`). |
| SM-5 | API do Gemini sofre Timeout | O timeout do `httpx` é disparado e o provedor lança `SummaryError`. |

### Orquestração no Service — `services/analysis/service.py`

| ID | Cenário | Critério |
| --- | --- | --- |
| AS-1 | Cache Miss gera e persiste resumo | `SummaryProvider.summarize` é chamado, e o resultado é salvo na tabela `Analysis` e retornado. |
| AS-2 | Cache Hit retorna resumo do cache | O resumo persistido no banco é retornado diretamente, sem chamar `SummaryProvider.summarize`. |
| AS-3 | Falha do serviço de resumo é silenciada (Resiliência) | Se o `SummaryProvider` lançar `SummaryError`, o `AnalysisService` captura o erro, prossegue com a classificação LegalBERT, retorna `summary: None` e salva a linha com sucesso. |
| AS-4 | Execução concorrente em paralelo | O tempo total de execução do `evaluate_text` em cache miss deve ser otimizado por `asyncio.gather`. |

### Endpoints da API — `api/analysis.py`

| ID | Cenário | Critério |
| --- | --- | --- |
| EP-1 | `POST /api/v1/analysis/evaluate` com sucesso | Retorna status 200 contendo a chave `"summary"` com o resumo gerado pela IA. |
| EP-2 | `GET /api/v1/laws/{id}/analysis` com sucesso | Retorna a análise mais recente contendo o campo `"summary"` persistido. |
| EP-3 | `POST /api/v1/analysis/evaluate` com falha de sumarização | Retorna status 200 com a análise de qualidade completa, mas `"summary": null` (resiliência). |

---

## Cobertura

Meta `>= 90%` de cobertura de código no backend.

---

## Mapa para os Testes Automatizados

- `backend/tests/unit/test_summary_provider.py` — SM-*
- `backend/tests/unit/test_analysis_service.py` — AS-* (com mock de `SummaryProvider`)
- `backend/tests/integration/test_analysis_api.py` — EP-* (com mock de `SummaryProvider`)
