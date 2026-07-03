# Plano de Implementação: Remoção de Mockdata e Restrição de Submissão

Este plano detalha as alterações técnicas necessárias para atender à especificação de remoção de mocks do dashboard e proteção do fluxo de submissão de leis.

## Componentes Envolvidos

---

### Backend (Python / FastAPI / Prisma)

#### 1. [MODIFY] [law.py](file:///c:/Users/pluca/2026-1-Squad07/backend/app/models/law.py)
- Adicionar o campo `score: float | None = None` em `LawListItem`.
- Criar a classe `LawStatisticsResponse` contendo:
  - `averageScore: float`
  - `analyzedLaws: int`
  - `criticalLaws: int`

#### 2. [MODIFY] [laws.py](file:///c:/Users/pluca/2026-1-Squad07/backend/app/api/laws.py)
- Importar `Depends` e `get_current_user`.
- Modificar `submit_law`:
  - Adicionar `current_user = Depends(get_current_user)`.
  - Mapear `data["uploadedByUserId"] = current_user.id` antes da persistência.
- Modificar `list_law_submissions`:
  - Fazer join/include com as análises associadas a cada lei, ordenadas por data descrescente e pegando a mais recente: `include={"analyses": {"order": {"createdAt": "desc"}, "take": 1}}`.
  - Atribuir o score da análise mais recente ao campo `score` do `LawListItem` (ou `None` se não houver análise).
- Adicionar nova rota `GET /api/v1/laws/statistics` (ou como sub-rota em `router_v1` ou no `router` geral) para calcular estatísticas reais:
  - Buscar todas as leis do tipo `USER_UPLOAD` e incluir suas análises.
  - Iterar pelas leis em memória, coletando o score mais recente de cada uma.
  - Calcular a média geral dos scores, o total de leis analisadas (que possuem análise) e a quantidade de leis críticas (score < 0.40).
  - Retornar o JSON conforme o schema `LawStatisticsResponse`.

#### 3. [MODIFY] [test_laws.py](file:///c:/Users/pluca/2026-1-Squad07/backend/tests/test_laws.py)
- Adicionar fixture autouse para sobrescrever `get_current_user` nos testes da rota `/laws`, garantindo que as chamadas de teste continuem passando com autenticação simulada.
- Adicionar teste para validar que a criação de leis grava `uploadedByUserId`.
- Adicionar testes de integração para o endpoint de estatísticas.

---

### Frontend (Next.js / TypeScript)

#### 1. [MODIFY] [laws.ts](file:///c:/Users/pluca/2026-1-Squad07/frontend/src/lib/api/laws.ts)
- Adicionar `score?: number | null` ao tipo `LawSubmissionListItem`.
- Criar a interface `LawStatistics` e a função `getLawStatistics()` que chama `/api/v1/laws/statistics` (ou similar).

#### 2. [MODIFY] [page.tsx](file:///c:/Users/pluca/2026-1-Squad07/frontend/src/app/page.tsx)
- Importar `useAuth` de `@/contexts/AuthContext`.
- Importar `getLawStatistics` e o tipo correspondente.
- Criar um estado local `statistics` do tipo `LawStatistics | null`.
- No `useEffect`, disparar a busca de estatísticas juntamente com a listagem de submissões.
- Substituir o uso de `demoDashboard` pelo estado real `statistics`.
  - Exibir `statistics.averageScore` multiplicando por 100 no RadialProgress (com fallback para 0 se nulo).
  - Exibir a contagem total de `statistics.analyzedLaws` e `statistics.criticalLaws` (com fallback para 0).
  - Remover a frase "Indicadores simulados para demonstração".
- No histórico de submissões recentes:
  - Exibir a nota real vinda de `law.score` (calculada como `law.score * 100` e formatada com a classe de cor correspondente), omitindo o badge se `law.score` for nulo (ou seja, se a lei ainda não passou pela IA).
  - Remover completamente a importação e o uso de `demoAnalyses` e `scoreClass` local de `demo-analysis.ts`.
- Verificar se `user` de `useAuth()` está logado:
  - Se sim, exibir o card de "Submeter Nova Lei".
  - Se não, ocultar o card de submissão e deixar que a lista de submissões ocupe o espaço restante ou exibir um placeholder informando que é necessário login para registrar novas leis.

#### 3. [MODIFY] [page.tsx](file:///c:/Users/pluca/2026-1-Squad07/frontend/src/app/upload/page.tsx)
- Adicionar um `useEffect` para verificar se `user` ou `token` estão presentes. Se não estiverem, redirecionar via `router.replace("/login")`.
- Exibir tela de loading enquanto carrega o estado de autenticação para evitar flashes indesejados da tela de upload para usuários não logados.
