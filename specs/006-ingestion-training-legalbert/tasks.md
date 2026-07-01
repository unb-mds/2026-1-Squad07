# Tasks: Ingestão de Leis e Treinamento do LegalBERT-pt

**Spec**: `specs/006-ingestion-training-legalbert/spec.md`

## Testes e Validação Primeiro (TDD)

- [ ] **T001** Criar os cenários de testes unitários para a rota atualizada `GET /laws` com suporte ao query parameter `source_type`.
- [ ] **T002** Criar os cenários de testes unitários para verificar a carga de pesos locais do `LegalBERTProvider` se presentes.

## Implementação Offline (ML & Ingestão)

- [ ] **T003** Criar o dataset representativo em `backend/data/dataset_laws.json`.
- [ ] **T004** Implementar o script de treinamento `backend/scripts/train_classifier.py` utilizando Hugging Face `Trainer`.
- [ ] **T005** Implementar o script de ingestão `backend/scripts/ingest_catalog.py` utilizando Prisma ORM.
- [ ] **T006** Adicionar a regra de ignore da pasta `fine_tuned_legalbert` em `.gitignore`.

## Implementação Online (Backend API & Services)

- [ ] **T007** Ajustar o método `_ensure_loaded` do `LegalBERTProvider` em `backend/app/services/analysis_provider.py` para carregar o modelo local treinado se presente.
- [ ] **T008** Modificar a rota `GET /laws` em `backend/app/api/laws.py` para receber e aplicar o filtro de query `source_type`.
- [ ] **T009** Validar que a inferência online carrega os pesos ajustados de forma preguiçosa.

## Integração no Frontend

- [ ] **T010** Ajustar o client `frontend/src/lib/api/laws.ts` na chamada `listLawSubmissions` para passar o filtro.
- [ ] **T011** Validar na interface do frontend que as leis do catálogo e as submissões exibem resultados preditos pelo classificador real.

## Verificação e Cobertura

- [ ] **T012** Rodar o conjunto de testes `pytest` e garantir cobertura de código `>= 90%` nos novos módulos e classes modificadas.
- [ ] **T013** Executar linter no backend (`black`, `flake8`) e no frontend (`npm run lint`).
- [ ] **T014** Abrir PR para a branch `dev` com as evidências do treinamento e ingestão local.
