# Tasks: Integração Frontend-Backend da R1

**Spec**: `specs/001-integracao-frontend-backend/spec.md`  
**Issues**: #75, #93, #94 e #95

## Testes e Validação Primeiro

- [x] **T001** Registrar casos de validação para autenticação, submissão e listagem em `test-plan.md`.
- [x] **T002** Confirmar contratos já cobertos por `backend/tests/test_auth.py` e `backend/tests/test_laws.py`.

## Implementação

- [ ] **T003** Criar cliente HTTP e tipos da API configuráveis por ambiente, atendendo à issue #93.
- [ ] **T004** Integrar contexto e telas de autenticação, atendendo à issue #94.
- [ ] **T005** Integrar envio do texto legislativo, atendendo à issue #75.
- [ ] **T006** Integrar listagem persistida com estados de interface, atendendo à issue #95.

## Verificação

- [ ] **T007** Executar `pytest`, lint e build.
- [ ] **T008** Registrar limitações da R1 e evidências de validação no PR para `dev`.
