# Tasks — Framework de Testes Automatizados

Issue: #114 | Sprint 11 | Responsável: @ViniciusA05

## Backend

- [x] Criar `specs/003-framework-testes/spec.md`
- [x] Criar `specs/003-framework-testes/test-plan.md`
- [x] Criar `specs/003-framework-testes/tasks.md`
- [ ] Adicionar `pytest-asyncio` em `backend/requirements.txt`
- [ ] Criar `backend/pytest.ini` com `testpaths`, `asyncio_mode = auto` e `fail_under = 90`
- [ ] Criar `backend/tests/conftest.py` com fixtures `make_user` e `FakeUserDelegate`
- [ ] Criar `backend/tests/unit/` e mover testes existentes
- [ ] Criar `backend/tests/integration/__init__.py`
- [ ] Validar V1–V6 do test-plan

## Frontend

- [ ] Instalar dependências de teste: `jest`, `jest-environment-jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `@types/jest`, `ts-jest`
- [ ] Criar `frontend/jest.config.ts`
- [ ] Criar `frontend/jest.setup.ts`
- [ ] Adicionar scripts `test` e `test:coverage` em `frontend/package.json`
- [ ] Criar `frontend/src/__tests__/api-client.test.ts` (funções puras de `lib/api/client.ts`)
- [ ] Criar `frontend/src/components/__tests__/` com ≥4 testes de componentes
- [ ] Validar V7–V10 do test-plan

## CI

- [ ] Corrigir step duplicado de pytest em `main.yml`
- [ ] Corrigir caminho do schema Prisma em `main.yml`
- [ ] Adicionar flags `--cov=app --cov-report=html --cov-report=lcov --cov-fail-under=90` ao step pytest
- [ ] Adicionar job `frontend-tests` em `main.yml`
- [ ] Validar V11–V14 do test-plan via PR

## README

- [ ] Adicionar badge de coverage ao `README.md`

## PR

- [ ] Abrir PR para `dev` referenciando `Closes #114`
