# Feature Specification: Geração de Resumo Automático via Agente de IA — R2

**Branch**: `feat/issue-134-resumo-ia`
**Criado em**: 2026-06-29
**Status**: Aprovado
**Issue**: #134
**Épico**: motor-inteligência-nlp
**Depende de**: [Classificador de Análise LegalBERT-pt](file:///C:/Users/vinic/Desktop/MDS/2026-1-Squad07/specs/003-analysis-classifier/spec.md) (#143) já mergeado na `dev`.

## Objetivo

Implementar a geração automática de resumos curtos de textos legislativos no backend (FastAPI) através de um Agente de IA, persistindo o resumo gerado no banco de dados (`Analysis.summary`) e expondo-o nos endpoints de consulta e avaliação de qualidade legislativa.

---

## Contexto

A Release 2 do CrivoAI foca em transformar a inteligência demonstrativa (simulada por mocks na R1) in inteligência real. O classificador LegalBERT-pt foi implementado e mergeado com sucesso para derivar score, métricas e warnings de problemas textuais (ambiguidade, vagueza, etc.).

A **Issue #134** complementa essa capacidade de análise gerando um resumo conciso (em linguagem clara e acessível) da lei ou projeto de lei submetido. Esse resumo visa ajudar o usuário a compreender rapidamente a pauta e o objetivo da proposta legislativa.

---

## DECISÕES RESOLVIDAS (Pontos de Esclarecimento)

> [!NOTE]
> **Definição da LLM e Execução Local vs. Externa (Resolvido em 2026-06-29)**
>
> Ficou decidido que utilizaremos a **Opção A (Modular)** para o motor de sumarização:
> 1. Interface abstrata `SummaryProvider` em `backend/app/services/summary_provider.py`.
> 2. `GeminiSummaryProvider` (Concreto): Consome a API do Gemini utilizando uma variável de ambiente `GEMINI_API_KEY` para produção/staging e desenvolvimento conectado.
> 3. `MockSummaryProvider` (Concreto): Retorna resumos estáticos estruturados baseados no texto enviado, ideal para testes locais, CI e desenvolvimento offline.
>
> Essa decisão garante que o projeto mantenha conformidade de execução local sem GPU necessária para desenvolvimento, mas forneça resumos inteligentes reais de alta qualidade em ambientes de staging e produção.

---

## Escopo

### Incluído

- **Alteração do Banco de Dados (Prisma)**:
  - Adição do campo opcional `summary String?` ao modelo `Analysis` em [schema.prisma](file:///C:/Users/vinic/Desktop/MDS/2026-1-Squad07/backend/prisma/schema.prisma).
  - Geração de uma nova migration Prisma para atualizar a tabela `analyses` no PostgreSQL.
- **Serviço de Resumos (`SummaryProvider`)**:
  - Definição da interface `SummaryProvider` em `backend/app/services/summary_provider.py`.
  - Implementação do provedor de sumarização (modular para suportar API externa e fallback de desenvolvimento).
  - Integração do serviço no orquestrador de análise `backend/app/services/analysis/service.py`.
- **Contratos de API atualizados**:
  - Atualização dos schemas Pydantic de resposta (`AnalysisResponse`) para incluir o campo opcional `summary`.
  - Atualização dos endpoints `POST /api/v1/analysis/evaluate` e `GET /api/v1/laws/{id}/analysis`.
- **Garantia de Qualidade**:
  - Testes unitários e de integração do serviço de sumarização utilizando mocks e stubs.
  - Cobertura de testes mantida em no mínimo 90% para o código adicionado.

### Fora de Escopo

- Tradução de textos.
- Chat interativo com a IA sobre a lei (apenas geração de resumo estático de parágrafo único).
- Upload de arquivos PDF no fluxo online (parser já está fora de escopo para esta Sprint).

---

## Contratos de API Atualizados

### POST /api/v1/analysis/evaluate

Response (200 OK):

```json
{
  "analysis_id": "uuid",
  "status": "completed",
  "score": 0.60,
  "summary": "Este projeto de lei dispõe sobre a regulamentação do Programa Nacional de Qualidade Legislativa, estabelecendo critérios para a avaliação técnica de proposições legais.",
  "metrics": {
    "ambiguidade": 0.71,
    "vagueza": 0.18,
    "falta_referencia": 0.62,
    "inconsistencia": 0.09
  },
  "warnings": [
    {
      "code": "ambiguidade",
      "message": "Possível ambiguidade: ...",
      "confidence": 0.71
    }
  ],
  "model_version": "legalbert-pt-v1",
  "cached": false
}
```

### GET /api/v1/laws/{id}/analysis

Response (200 OK) herda o mesmo formato acima, incluindo o campo `"summary"`.

---

## Critérios de Aceite

- **SC-001**: O schema Prisma atualizado com `summary String?` e a migration correspondente criada e aplicada com sucesso.
- **SC-002**: A interface `SummaryProvider` e sua classe concreta implementadas no backend.
- **SC-003**: O orquestrador de análises (`AnalysisService`) executa a sumarização juntamente com a classificação de problemas e persiste o resultado.
- **SC-004**: Os endpoints de avaliação de qualidade e consulta retornam o resumo correto gerado pela IA.
- **SC-005**: Casos de erro do serviço de sumarização (ex: timeout da API externa ou erro de modelo) não derrubam a rota de avaliação de qualidade (o resumo deve retornar nulo ou disparar fallback amigável, garantindo resiliência).
- **SC-006**: Cobertura de testes unitários e de integração >= 90% no backend para o código novo de sumarização.

---

## Referências

- [Especificação de Integração de IA](file:///C:/Users/vinic/Desktop/MDS/2026-1-Squad07/specs/002-requirements-r2/ai-integration.md)
- [Especificação do Classificador](file:///C:/Users/vinic/Desktop/MDS/2026-1-Squad07/specs/003-analysis-classifier/spec.md)
- `backend/app/services/analysis/service.py` (Orquestração do backend)
- `backend/prisma/schema.prisma` (Modelo de dados)
