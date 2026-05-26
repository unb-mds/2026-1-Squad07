# Plano: Integração Frontend-Backend da R1

**Spec**: `specs/001-integracao-frontend-backend/spec.md`  
**Data**: 2026-05-26

## Abordagem Técnica

O backend existente é a fonte do contrato e não será ampliado nesta feature. O frontend receberá uma camada pequena em `src/lib/api/`, baseada em `fetch`, para concentrar URL, serialização JSON, envio opcional de token e erro HTTP padronizado.

## Contratos Existentes Consumidos

| Operação | Endpoint | Entrada | Saída usada pelo frontend |
| --- | --- | --- | --- |
| Cadastro | `POST /auth/register` | `name`, `email`, `password` | `accessToken`, `tokenType`, `user` |
| Login | `POST /auth/login` | `email`, `password` | `accessToken`, `tokenType`, `user` |
| Submissão | `POST /laws` | `title`, `text`, `lawNumber`, `publicationDate?` | Confirmação da criação |
| Listagem | `GET /laws` | - | `id`, `title`, `createdAt`, `textExcerpt` |

## Decisões de Implementação

- Não adicionar bibliotecas: `fetch` e APIs do navegador cobrem o escopo.
- Manter token e usuário no `localStorage` apenas como sessão do frontend; credenciais não serão armazenadas.
- A página `/search` passa a representar submissões reais, sem componentes de score mockado.
- A página de detalhe e o dashboard de análise continuam demonstrativos, pois o backend ainda não fornece análise nem `GET /laws/{id}`.
- O formulário aceita texto digitado ou `.txt`; formatos sem parsing permanecem fora do fluxo real.

## Arquivos Previstos

- `frontend/src/lib/api/client.ts`
- `frontend/src/lib/api/auth.ts`
- `frontend/src/lib/api/laws.ts`
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/app/login/page.tsx`
- `frontend/src/app/register/page.tsx`
- `frontend/src/app/upload/page.tsx`
- `frontend/src/components/pages/SearchPage.tsx`
- `frontend/.env.example`

## Riscos e Mitigações

| Risco | Mitigação |
| --- | --- |
| Backend indisponível durante demonstração | Mensagens de erro claras na UI e validação local do backend registrada no quickstart. |
| Usuário interpretar mock como análise persistida | Remover score da listagem real e nomear o conteúdo demonstrativo onde permanecer. |
| Token inconsistente no navegador | Restaurar somente sessão válida serializável e limpar sessão no logout. |
