# Tasks: [NOME DA SPEC]

**Input**: `spec.md`, `plan.md`, `test-plan.md`, `quickstart.md`, `contracts/`, `data-model.md`

**Regra obrigatória**: tarefas de teste/validação devem aparecer antes das tarefas de implementação de cada história ou entrega.

## Formato

- `[ ] T001 [P] [Área] Descrição objetiva com caminho de arquivo`
- `[P]` indica que a tarefa pode ser executada em paralelo.
- `[Área]` pode ser `DOCS`, `SPEC`, `BACKEND`, `FRONTEND`, `TEST`, `REVIEW` ou `OPS`.

## Fase 1 - Preparação

- [ ] T001 [SPEC] Confirmar que `spec.md` não possui ambiguidades centrais.
- [ ] T002 [TEST] Confirmar que `test-plan.md` existe e cobre critérios de aceite.

## Fase 2 - Validação Primeiro

- [ ] T003 [TEST] Criar ou registrar validações que devem falhar/estar pendentes antes da implementação.
- [ ] T004 [REVIEW] Validar que os critérios são rastreáveis à issue.

## Fase 3 - Implementação ou Documentação

- [ ] T005 [Área] Implementar a menor mudança necessária.

## Fase 4 - Revisão

- [ ] T006 [TEST] Executar validações planejadas.
- [ ] T007 [REVIEW] Conferir diff e escopo.
- [ ] T008 [DOCS] Atualizar documentação pública quando aplicável.

## Dependências

- `test-plan.md` bloqueia `tasks.md`.
- Tarefas de implementação dependem das tarefas de validação.
- Alterações fora do escopo exigem nova autorização.
