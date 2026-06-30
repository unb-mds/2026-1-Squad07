# TESTING

Este arquivo reúne a forma correta de executar os testes unitários e de cobertura do projeto.

## Backend

1. Abra o terminal em `backend/`:

```powershell
cd backend
```

2. Gere o cliente Prisma antes de rodar os testes (se ainda não tiver feito):

```powershell
prisma generate --schema=prisma/schema.prisma
```

3. Execute os testes com cobertura:

```powershell
python -m pytest tests/ -v --tb=short --cov=app --cov-report=term-missing --cov-report=html --cov-report=lcov --cov-fail-under=90
```

### Resultados esperados

- Todos os testes backend devem passar.
- Coverage global deve ser pelo menos `90%` para o código em `app/`.
- Relatórios gerados:
  - `htmlcov/index.html`
  - `coverage.xml`
  - `lcov.info`

## Frontend

1. Abra o terminal em `frontend/`:

```powershell
cd frontend
npm ci
```

2. Execute os testes com coverage:

```powershell
npm run test:coverage
```

### Resultados esperados

- Todos os testes frontend devem passar.
- Coverage deve ser atendida conforme thresholds configurados em `frontend/jest.config.js`.

## Anotações importantes

- O frontend já possui testes para utilitários e componentes básicos.
- Este repositório adiciona agora testes para o `AuthContext` em `frontend/src/contexts/__tests__/AuthContext.test.tsx`.
- A documentação de testes deve ser mantida atualizada sempre que novos fluxos críticos forem adicionados.
