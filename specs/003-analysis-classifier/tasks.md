# Tasks: Classificador de Análise (LegalBERT-pt)

**Spec**: `specs/003-analysis-classifier/spec.md`

## Testes e Validação Primeiro

- [x] **T001** Registrar cenários de inferência, chunking, cache, persistência e
  schema em `test-plan.md`.
- [x] **T002** Definir os contratos das rotas a partir de
  `docs/architecture/ai-integration.md`.

## Implementação

- [x] **T003** Criar interface `AnalysisProvider` e `LegalBERTProvider`
  (`transformers`/`torch`, carregamento preguiçoso, injetável).
- [x] **T004** Implementar chunking + pooling por média para textos > 512 tokens.
- [x] **T005** Implementar scoring (`score`/`metrics`/`warnings`) com estratégia
  configurável.
- [x] **T006** Implementar cache por hash do texto + `model_version`.
- [x] **T007** Implementar orquestração e persistência em `Analysis`, persistindo
  inclusive em cache hit quando há `lawId`.
- [x] **T008** Definir schemas Pydantic (`AnalysisRequest`, `AnalysisResponse`,
  `AnalysisWarning`, `AnalysisHistoryItem`).
- [x] **T009** Implementar `POST /api/v1/analysis/evaluate`.
- [x] **T010** Implementar `GET /api/v1/laws/{id}/analysis` (mais recente) e
  `GET /api/v1/laws/{id}/history`, com `404` nos casos previstos.
- [x] **T011** Adicionar `transformers` e `torch` ao `requirements.txt`.
- [x] **T012** Mapear falha do modelo para `503`, sem resultado simulado.

## Verificação

- [x] **T013** Escrever testes unitários e de integração com o modelo mockado.
- [x] **T014** Garantir cobertura `>= 90%` e `black`/`flake8` limpos nos arquivos
  da feature.
- [x] **T015** Validar manualmente com o modelo real (CPU) + Postgres: evaluate
  com lei real, chunking > 512 tokens, cache hit persistindo, latest/history e
  os `404` (ver `quickstart.md`).
- [ ] **T016** Abrir PR para `dev` com evidências de validação.

## Pendências fora desta feature

- [ ] **T017** CI verde depende de correções pré-existentes no `dev`
  (ordem `pytest`/`prisma generate` e caminho do schema em `main.yml`; lint em
  `app/models/law.py` e `app/services/security.py`). Tratado separadamente.
