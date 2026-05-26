# Feature Specification: Integração Frontend-Backend da R1

**Branch**: `feat/integracao`  
**Criado em**: 2026-05-26  
**Status**: Em implementação  
**Issues**: #75, #93, #94 e #95

## Objetivo

Conectar as telas já existentes do CrivoAI às rotas reais disponíveis no backend, permitindo cadastro, login, submissão de texto legislativo e listagem das submissões persistidas na demonstração da R1.

## Contexto

O backend já expõe `POST /auth/register`, `POST /auth/login`, `POST /laws` e `GET /laws`, enquanto o frontend ainda usa usuários armazenados localmente, submissão simulada e leis mockadas. A integração deve preservar os mocks apenas para a análise/score demonstrativos, que não possuem contrato backend nesta etapa.

## Escopo

### Incluído

- Cliente HTTP centralizado configurado por `NEXT_PUBLIC_API_URL`.
- Persistência local do token e do usuário retornados pela API de autenticação.
- Cadastro e login reais com apresentação clara de erros.
- Envio real do formulário de texto legislativo para `POST /laws`.
- Exibição das submissões reais obtidas por `GET /laws`, com carregamento, vazio e falha.

### Fora de Escopo

- Criar endpoints novos no backend.
- Detalhes reais de submissão, análise de IA ou cálculo de score.
- Upload e parsing de PDF, DOC ou DOCX.
- Painel administrativo de usuários.

## R1 Demonstrável

Na R1, uma pessoa pode criar conta ou entrar, submeter texto digitado ou importado de arquivo `.txt` e verificar a submissão recém-persistida na listagem real. A interface informa explicitamente que análise e score permanecem demonstrativos quando exibidos.

## R2 Completa

Na R2, a integração pode incluir detalhes persistidos por submissão, autenticação aplicada à autoria da submissão, análise real e testes automatizados de componentes e fluxos no frontend.

## Futuro

- Parsing seguro de documentos enviados.
- Recuperação de senha e gestão administrativa.
- Catálogo público e filtros de análise real.

## Cenários e Critérios de Aceite

### Cenário 1 - Autenticação real

**Como** usuário, **quero** cadastrar ou autenticar minha conta pelo backend, **para** acessar o produto com dados persistidos.

1. O cadastro envia somente nome, e-mail e senha para `POST /auth/register`.
2. O login envia e-mail e senha para `POST /auth/login`.
3. Em sucesso, token e usuário retornados ficam disponíveis ao cabeçalho da aplicação.
4. Respostas inválidas ou erros de API apresentam mensagem compreensível.

### Cenário 2 - Submissão persistida

**Como** usuário, **quero** enviar texto legislativo, **para** registrar uma submissão real.

1. O formulário envia `title`, `text`, `lawNumber` e, quando preenchida, `publicationDate` para `POST /laws`.
2. A interface impede envio sem título, número ou texto.
3. Em sucesso, a pessoa recebe feedback e segue para a listagem de submissões.
4. O envio não promete análise ou score real.

### Cenário 3 - Consulta de submissões

**Como** avaliador, **quero** ver as submissões registradas, **para** validar o fluxo persistente da R1.

1. A tela de busca consulta `GET /laws` usando o cliente HTTP comum.
2. Cada item real exibe `title`, `createdAt` e `textExcerpt`.
3. Há estados visíveis de carregamento, lista vazia e erro de conexão.
4. Dados demonstrativos de score não são apresentados como resultado persistido.

## Requisitos

- **REQ-001**: O frontend DEVE centralizar URL, parsing e erros HTTP da API.
- **REQ-002**: A URL da API DEVE ser configurável por `NEXT_PUBLIC_API_URL`.
- **REQ-003**: O token DEVE poder ser enviado como `Authorization: Bearer <token>`.
- **REQ-004**: Login e cadastro NÃO DEVEM usar base local simulada de usuários.
- **REQ-005**: A submissão DEVE usar somente o contrato já aceito por `POST /laws`.
- **REQ-006**: A listagem DEVE usar somente os campos já retornados por `GET /laws`.
- **REQ-007**: Mocks de análise DEVEM permanecer identificados como demonstrativos e separados da listagem persistida.

## Critérios de Sucesso

- **SC-001**: Os quatro fluxos descritos nas issues são ligados aos endpoints existentes sem dependência nova.
- **SC-002**: `pytest` do backend continua passando.
- **SC-003**: `npm run lint` e `npm run build` do frontend passam.
- **SC-004**: Uma validação manual confirma mensagens de carregamento, falha, sucesso e vazio.

## Referências

- Issues #75, #93, #94 e #95.
- `backend/app/api/auth.py`.
- `backend/app/api/laws.py`.
- `frontend/src/contexts/AuthContext.tsx`.
- `frontend/src/app/upload/page.tsx`.
- `frontend/src/components/pages/SearchPage.tsx`.
