# Plano de Validação (TDD) — Framework de Testes Automatizados

Esta é uma spec de infraestrutura; a validação segue TDD de configuração — cada verificação deve passar antes de considerar a tarefa concluída.

## Backend

| Verificação | Comando | Critério de aceite |
|---|---|---|
| V1 - pytest descobre testes | `cd backend && pytest --collect-only` | Todos os testes em `tests/unit/` aparecem sem erro |
| V2 - testes passam | `cd backend && pytest -v` | 0 falhas, 0 erros |
| V3 - coverage ≥ 90% | `pytest --cov=app --cov-fail-under=90` | Não retorna código de saída diferente de 0 |
| V4 - relatório HTML gerado | `pytest --cov=app --cov-report=html` | Pasta `htmlcov/` criada com `index.html` |
| V5 - asyncio configurado | `pytest --co -q` | Sem warnings de `asyncio_mode` |
| V6 - conftest carregado | `pytest -v` | Fixtures de `conftest.py` disponíveis nos testes |

## Frontend

| Verificação | Comando | Critério de aceite |
|---|---|---|
| V7 - jest descobre testes | `cd frontend && npm test -- --listTests` | ≥5 arquivos listados |
| V8 - testes passam | `npm test` | 0 falhas |
| V9 - coverage ≥ 90% | `npm run test:coverage` | Não falha por threshold |
| V10 - alias `@/` funciona | `npm test` | Imports com `@/lib/api/client` resolvem sem erro |

## CI

| Verificação | Como validar | Critério de aceite |
|---|---|---|
| V11 - job backend passa | Abrir PR e verificar GitHub Actions | Job "Testes de Integração" verde |
| V12 - job frontend passa | Abrir PR e verificar GitHub Actions | Job "Frontend Tests" verde |
| V13 - bug do pytest duplo corrigido | Ler `main.yml` | Apenas um step de pytest após prisma setup |
| V14 - caminho prisma correto | Ler `main.yml` | `backend/prisma/schema.prisma` |
