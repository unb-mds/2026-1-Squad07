# Feature Specification: Framework de Testes Automatizados

**Branch**: `feat/issue-114-test-framework`
**Criado em**: 2026-06-11
**Status**: Em implementação
**Issues**: #114
**Épico**: tdd-testing
**Sprint**: Sprint 11

## Objetivo

Configurar centralmente o framework de testes do CrivoAI para backend e frontend, garantindo cobertura mínima de 90%, relatórios de coverage automáticos e integração com o CI. Sem essa configuração, cada desenvolvedor usa uma abordagem diferente e não há limiar que bloqueie merge em caso de cobertura insuficiente.

## Contexto

O backend já possui 20+ testes com fake delegates (monkeypatch), mas sem `pytest.ini`, sem threshold de coverage e sem organização em subpastas. O frontend não tem nenhuma configuração de testes. O CI (`main.yml`) já executa pytest, mas com dois bugs: executa pytest duas vezes e usa o caminho errado do schema Prisma.

## Escopo

### Incluído

- `pytest.ini` com threshold de 90% e configuração de asyncio no backend.
- `pytest-asyncio` adicionado ao `requirements.txt`.
- Reorganização de `backend/tests/` em `unit/` e `integration/` com `conftest.py` compartilhado.
- Configuração completa de Jest no frontend: `jest.config.ts`, `jest.setup.ts`, dependências e scripts.
- Mínimo de 5 testes exemplo no backend (já existem 20+) e 5 no frontend.
- Correção dos bugs do CI e adição de job para testes do frontend.
- Badge de coverage no `README.md`.

### Fora de Escopo

- SonarQube — será configurado na issue de CI completo.
- Testes de integração com banco real — reservados para a R2.
- Testes end-to-end (Cypress, Playwright).
- Análise de qualidade além de coverage.

## Requisitos

- **REQ-001**: O backend DEVE ter `pytest.ini` configurado com `testpaths`, `asyncio_mode = auto` e `fail_under = 90`.
- **REQ-002**: `pytest-asyncio` DEVE estar em `requirements.txt`.
- **REQ-003**: Os testes do backend DEVEM estar organizados em `tests/unit/` e `tests/integration/`.
- **REQ-004**: `backend/tests/conftest.py` DEVE centralizar fixtures compartilhadas (`make_user`, `FakeUserDelegate`).
- **REQ-005**: O frontend DEVE ter `jest.config.ts` com threshold de 90% e `jest.setup.ts` com `@testing-library/jest-dom`.
- **REQ-006**: O frontend DEVE ter mínimo de 5 testes exemplo cobrindo funções puras e componentes React.
- **REQ-007**: `frontend/package.json` DEVE ter scripts `test` e `test:coverage`.
- **REQ-008**: O CI DEVE executar pytest com flags de coverage e falhar se coverage < 90%.
- **REQ-009**: O CI DEVE ter job separado para testes do frontend com threshold de coverage.
- **REQ-010**: O `README.md` DEVE exibir badge de coverage.

## Critérios de Aceite

### Cenário 1 — Backend configurado

- `cd backend && pytest -v` executa todos os testes sem erro.
- `pytest --cov=app --cov-fail-under=90` não falha.
- Relatório HTML gerado em `htmlcov/`.

### Cenário 2 — Frontend configurado

- `cd frontend && npm test` executa mínimo de 5 testes sem erro.
- `npm run test:coverage` não falha com threshold de 90%.

### Cenário 3 — CI integrado

- O job de testes do backend passa com coverage no GitHub Actions.
- O job de testes do frontend passa com coverage no GitHub Actions.
- Um PR com coverage abaixo do threshold falha no CI.

### Cenário 4 — Documentação

- `specs/003-framework-testes/` contém `spec.md`, `test-plan.md` e `tasks.md`.
- `README.md` exibe badge de coverage visível.
