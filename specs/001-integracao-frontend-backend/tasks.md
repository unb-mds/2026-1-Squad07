# Tasks: Integração Frontend-Backend da R1

**Spec**: `specs/001-integracao-frontend-backend/spec.md`
**Issues**: #75, #93, #94 e #95

## Testes e Validação Primeiro

- [x] **T001** Registrar casos de validação para autenticação, submissão e listagem em `test-plan.md`.
- [x] **T002** Confirmar contratos já cobertos por `backend/tests/test_auth.py` e `backend/tests/test_laws.py`.

## Implementação

- [x] **T003** Criar cliente HTTP e tipos da API configuráveis por ambiente, atendendo à issue #93.
- [x] **T004** Integrar contexto e telas de autenticação, atendendo à issue #94.
- [x] **T005** Integrar envio do texto legislativo, atendendo à issue #75.
- [x] **T006** Integrar listagem persistida com estados de interface, atendendo à issue #95.
- [x] **T007** Criar contrato testado de detalhe persistido em `GET /laws/{id}`.
- [x] **T008** Integrar dashboard e detalhe às submissões persistidas, restringindo indicadores simulados identificados à base demonstrativa.

## Verificação

- [x] **T009** Executar `pytest`, lint e build.
- [x] **T010** Validar leitura de detalhe persistido contra PostgreSQL/API do container.
- [x] **T011** Criar seed idempotente de submissões demonstrativas persistidas.
- [x] **T012** Executar o seed duas vezes e comprovar ausência de duplicação no PostgreSQL.
- [ ] **T013** Registrar limitações da R1 e evidências de validação no PR para `dev`.
