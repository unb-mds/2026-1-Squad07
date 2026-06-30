# Tasks: Geração de Resumo Automático via Agente de IA

**Spec**: `specs/004-automatic-summary/spec.md`

## Testes e Validação Primeiro

- [x] **T001** Registrar cenários de sumarização, resiliência a falhas, cache e schemas em `test-plan.md`.
- [x] **T002** Definir os contratos atualizados com o campo `summary` na especificação.

## Implementação

- [x] **T003** Atualizar o modelo Prisma `Analysis` no `schema.prisma` adicionando `summary String?`, gerando e aplicando a migration no PostgreSQL.
  - *Checkpoint de Commit*: `chore(db): adiciona campo summary no schema prisma`
- [x] **T004** Criar a interface `SummaryProvider` e as classes `MockSummaryProvider` e `GeminiSummaryProvider` (usando `httpx`) em `backend/app/services/summary_provider.py`.
  - *Checkpoint de Commit*: `feat(nlp): implementa SummaryProvider e suas variantes mock/gemini`
- [x] **T005** Atualizar os schemas Pydantic de análise em `backend/app/models/analysis.py` para incluir o campo `summary` no `AnalysisResponse` e schemas relacionados.
  - *Checkpoint de Commit*: `feat(api): atualiza schemas pydantic de analise com campo summary`
- [x] **T006** Modificar a orquestração de análise em `backend/app/services/analysis/service.py` para executar a inferência de legibilidade/problemas e a sumarização concorrentemente com `asyncio.gather`, persistindo o resumo gerado na tabela de análises.
  - *Checkpoint de Commit*: `feat(nlp): integra geracao concorrente de resumo no AnalysisService`
- [x] **T007** Configurar a inicialização e injeção de dependência do `SummaryProvider` adequado em `backend/app/api/dependencies.py` (lendo a chave `GEMINI_API_KEY` para decidir entre o provedor real ou o mock).
  - *Checkpoint de Commit*: `feat(api): configura injecao de dependencia do SummaryProvider`

## Verificação

- [x] **T008** Escrever testes unitários e mocks para o `SummaryProvider` e `AnalysisService` em `backend/tests/unit/test_summary_provider.py` e atualizar os testes existentes do service.
- [x] **T009** Escrever testes de integração para o endpoint `/api/v1/analysis/evaluate` e rotas de consulta em `backend/tests/integration/test_analysis_api.py` para verificar o retorno do resumo.
  - *Checkpoint de Commit*: `test(nlp): adiciona testes unitarios e integracao para sumarizador`
- [x] **T010** Garantir cobertura de testes no backend `>= 90%` e lint de arquivos limpo (`black`/`flake8`).
  - *Checkpoint de Commit*: `style/refactor: formata codigo e garante cobertura minima de 90%`
- [x] **T011** Executar validação manual local da rota com e sem a chave de API do Gemini para validar o Happy Path (resumo gerado) e o Bad Path (resiliência com resumo nulo).
- [ ] **T012** Abrir Pull Request para a branch `dev` com as alterações e plano de testes.

