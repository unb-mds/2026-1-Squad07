# Tarefas: Remoção de Mockdata e Restrição de Submissão

Este arquivo lista as tarefas necessárias para implementar a especificação, ordenadas logicamente. Conforme a metodologia TDD do projeto, os testes do backend devem ser escritos antes da implementação.

## Backend (Testes e Implementação)

- [ ] **T001 [TEST]** Atualizar `backend/tests/test_laws.py` para incluir a fixture autouse de autenticação e testar que a submissão rejeita usuários deslogados e associa leis aos IDs dos usuários autenticados.
- [ ] **T002 [TEST]** Escrever testes de integração para o novo endpoint de estatísticas `GET /api/v1/laws/statistics` no backend.
- [ ] **T003 [TEST]** Atualizar testes de listagem de leis para validar o retorno do campo `score`.
- [ ] **T004 [IMPL]** Atualizar `backend/app/models/law.py` com `score` em `LawListItem` e o schema `LawStatisticsResponse`.
- [ ] **T005 [IMPL]** Atualizar a rota `POST /laws` em `backend/app/api/laws.py` para proteger o recurso com `Depends(get_current_user)` e preencher `uploadedByUserId`.
- [ ] **T006 [IMPL]** Atualizar a rota `GET /laws` em `backend/app/api/laws.py` para incluir e expor o score mais recente de cada lei.
- [ ] **T007 [IMPL]** Criar o endpoint de estatísticas `GET /api/v1/laws/statistics` em `backend/app/api/laws.py` calculando os dados agregados a partir do banco de dados Prisma.
- [ ] **T008 [TEST]** Executar a suíte de testes do backend com `pytest` e garantir que todos passem.

## Frontend (Integração e Interface)

- [ ] **T009 [IMPL]** Atualizar `frontend/src/lib/api/laws.ts` adicionando `score` ao `LawSubmissionListItem` e implementando a chamada de API para `getLawStatistics()`.
- [ ] **T010 [IMPL]** Modificar `frontend/src/app/upload/page.tsx` para redirecionar usuários não autenticados para `/login` usando o hook `useAuth` e `router.replace`.
- [ ] **T011 [IMPL]** Modificar `frontend/src/app/page.tsx` para remover o uso de `demoDashboard` e `demoAnalyses`, consumindo os dados reais de estatísticas e a nota da listagem.
- [ ] **T012 [IMPL]** Ocultar o card de "Submeter Nova Lei / Registrar Texto" na Home para usuários não autenticados.
- [ ] **T013 [VAL]** Rodar a suite de lint do frontend (`npm run lint`), fazer build (`npm run build`) e realizar validações manuais de acesso para usuário autenticado e não autenticado.
