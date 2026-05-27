# Plano: Integração Frontend-Backend da R1

**Spec**: `specs/001-integracao-frontend-backend/spec.md`  
**Data**: 2026-05-26

## Abordagem Técnica

O backend é a fonte dos dados exibidos. O frontend usa uma camada pequena em `src/lib/api/`, baseada em `fetch`, para concentrar URL, serialização JSON, envio opcional de token e erro HTTP padronizado. A evolução solicitada elimina o conteúdo mockado restante por meio de leitura persistida do detalhe.

## Contratos Consumidos

| Operação | Endpoint | Entrada | Saída usada pelo frontend |
| --- | --- | --- | --- |
| Cadastro | `POST /auth/register` | `name`, `email`, `password` | `accessToken`, `tokenType`, `user` |
| Login | `POST /auth/login` | `email`, `password` | `accessToken`, `tokenType`, `user` |
| Submissão | `POST /laws` | `title`, `text`, `lawNumber`, `publicationDate?` | Confirmação da criação |
| Listagem | `GET /laws` | - | `id`, `title`, `createdAt`, `textExcerpt` |
| Detalhe | `GET /laws/{id}` | Identificador persistido | Dados completos da submissão |
| Seed demonstrativo | Script backend + Prisma | Conjunto fixo identificado | Submissões persistidas reutilizáveis em apresentação |

## Decisões de Implementação

- Não adicionar bibliotecas: `fetch` e APIs do navegador cobrem o escopo.
- Manter token e usuário no `localStorage` apenas como sessão do frontend; credenciais não serão armazenadas.
- A página `/search` passa a representar submissões reais, sem componentes de score mockado.
- A página inicial apresenta somente contagem e submissões persistidas disponíveis via API.
- A página de detalhe apresenta somente metadados e texto persistidos por `GET /laws/{id}`.
- Arquivos de leis, análise, scores e estatísticas simulados serão removidos; análise real permanece fora do escopo.
- Um seed com identificadores estáveis fará `create` ou `update` de submissões marcadas com `[Demonstração]`, evitando duplicação entre apresentações.
- O formulário aceita texto digitado ou `.txt`; formatos sem parsing permanecem fora do fluxo real.

## Arquivos Previstos

- `frontend/src/lib/api/client.ts`
- `frontend/src/lib/api/auth.ts`
- `frontend/src/lib/api/laws.ts`
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/app/login/page.tsx`
- `frontend/src/app/register/page.tsx`
- `frontend/src/app/upload/page.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/app/law/[id]/page.tsx`
- `frontend/src/components/pages/SearchPage.tsx`
- `backend/app/api/laws.py`
- `backend/app/models/law.py`
- `backend/tests/test_laws.py`
- `backend/scripts/seed_demo_laws.py`
- `backend/tests/test_seed_demo_laws.py`
- `frontend/.env.example`

## Riscos e Mitigações

| Risco | Mitigação |
| --- | --- |
| Backend indisponível durante demonstração | Mensagens de erro claras na UI e validação local do backend registrada no quickstart. |
| Usuário interpretar mock como análise persistida | Remover todo conteúdo de análise e score enquanto não houver processamento persistido real. |
| Seed gerar duplicatas a cada apresentação | Usar identificadores fixos e validar duas execuções consecutivas. |
| Token inconsistente no navegador | Restaurar somente sessão válida serializável e limpar sessão no logout. |
