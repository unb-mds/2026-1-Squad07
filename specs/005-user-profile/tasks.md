# Tasks — Tela de Perfil do Usuário

Issue: #135 | Sprint 12 | Responsável: @ViniciusA05

## Planejamento de Commits Atômicos

Para manter o histórico do Git limpo e de fácil revisão, a tarefa será dividida nos seguintes commits atômicos:

1. `docs: especifica funcionalidade de perfil de usuario #135`
   - Contém a pasta `specs/005-user-profile/` com todos os documentos de SDD/TDD.
2. `test: adiciona testes unitarios de componente para a pagina de perfil`
   - Contém a implementação inicial dos testes de comportamento no frontend (Red/TDD).
3. `feat: implementa client de api e estende AuthContext para perfil`
   - Contém a criação do client de API e propagação da alteração do usuário no estado global.
4. `feat: implementa interface e layout da pagina de perfil`
   - Contém a tela `/profile`, tratamentos de erro, loading e redirecionamentos.
5. `test: finaliza testes de integracao e ajustes de layout`
   - Ajustes finais, correções de linting e validação de cobertura de testes.

---

## Detalhamento de Atividades

### Fase 1: Especificação e Design (SDD)

- [x] Criar `specs/005-user-profile/spec.md`
- [x] Criar `specs/005-user-profile/plan.md`
- [x] Criar `specs/005-user-profile/test-plan.md`
- [x] Criar `specs/005-user-profile/tasks.md` (Esta lista)
- [x] Criar `specs/005-user-profile/quickstart.md`
- [x] **Commit 1**: `docs: especifica funcionalidade de perfil de usuario #135`

### Fase 2: Escrita de Testes (TDD - Red)

- [ ] Criar arquivo de teste `frontend/src/app/profile/__tests__/page.test.tsx` com os cenários:
  - TC-01: Redirecionamento se não autenticado
  - TC-02: Exibição de dados iniciais do usuário
  - TC-03: Validação de input com nome curto ou vazio
  - TC-06: Cancelamento de modificações voltando ao valor original
- [ ] Rodar os testes locais do frontend para verificar a falha controlada (Red).
- [ ] **Commit 2**: `test: adiciona testes unitarios de componente para a pagina de perfil`

### Fase 3: Infraestrutura e Serviços (Frontend)

- [ ] Criar o cliente de API `frontend/src/lib/api/users.ts` com a função de atualização de perfil.
- [ ] Modificar o `AuthContext.tsx` para incluir a função de sincronização do usuário logado na sessão ativa.
- [ ] **Commit 3**: `feat: implementa client de api e estende AuthContext para perfil`

### Fase 4: Implementação da Interface (Green)

- [ ] Criar a página `frontend/src/app/profile/page.tsx`.
- [ ] Integrar inputs, validações e os Toasts de sucesso e erro.
- [ ] Executar testes automatizados do frontend e garantir que todos passam (Green).
- [ ] **Commit 4**: `feat: implementa interface e layout da pagina de perfil`

### Fase 5: Ajustes e Revisão Final (Refactor)

- [ ] Testar manualmente a integração ponta a ponta com usuário `ADMIN` localmente.
- [ ] Garantir conformidade com os linters executando `npm run lint` no frontend.
- [ ] **Commit 5**: `test: finaliza testes de integracao e ajustes de layout`
