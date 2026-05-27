# Feature Specification: Integração Frontend-Backend da R1

**Branch**: `feat/integracao`
**Criado em**: 2026-05-26
**Status**: Em implementação
**Issues**: #75, #93, #94 e #95; evolução solicitada para delimitar indicadores demonstrativos em 2026-05-26

## Objetivo

Conectar as telas já existentes do CrivoAI às rotas reais disponíveis no backend, permitindo cadastro, login, submissão, listagem e leitura de detalhe de textos legislativos persistidos na demonstração da R1.

## Contexto

O backend expõe `POST /auth/register`, `POST /auth/login`, `POST /laws` e `GET /laws`. O protótipo apresenta submissões persistidas e, exclusivamente para registros semeados e identificados como demonstração, exibe indicadores simulados de qualidade. Esses indicadores apoiam a apresentação visual da R1 e não representam cálculo, processamento de IA ou resultado persistido pelo backend.

## Escopo

### Incluído

- Cliente HTTP centralizado configurado por `NEXT_PUBLIC_API_URL`.
- Persistência local do token e do usuário retornados pela API de autenticação.
- Cadastro e login reais com apresentação clara de erros.
- Envio real do formulário de texto legislativo para `POST /laws`.
- Exibição das submissões reais obtidas por `GET /laws`, com carregamento, vazio e falha.
- Consulta de detalhe persistido por identificador, com texto e metadados reais do backend.
- Dashboard e detalhe com indicadores simulados somente para registros demonstrativos, sinalizados como apresentação do protótipo.
- Seed idempotente de submissões demonstrativas persistidas, identificadas visivelmente para apresentação do protótipo.

### Fora de Escopo

- Análise de IA, cálculo real de score ou persistência de resultado analítico.
- Upload e parsing de PDF, DOC ou DOCX.
- Painel administrativo de usuários.

## R1 Demonstrável

Na R1, uma pessoa pode criar conta ou entrar, submeter texto digitado ou importado de arquivo `.txt`, verificar a submissão recém-persistida na listagem e abrir seu texto armazenado. Para apresentações, o banco pode ser populado com submissões marcadas como demonstração e a interface pode exibir, apenas para essas submissões, score, métricas e observações explicitamente rotulados como simulados ou demonstrativos.

## R2 Completa

Na R2, a integração pode incluir autenticação aplicada à autoria da submissão, análise real e testes automatizados de componentes e fluxos no frontend.

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
4. A listagem de busca mantém foco nos campos persistidos; indicadores demonstrativos podem aparecer no dashboard somente para registros da base de apresentação.

### Cenário 4 - Detalhe persistido

**Como** avaliador, **quero** abrir uma submissão, **para** ler o texto realmente armazenado.

1. Ao selecionar um resultado, a interface consulta `GET /laws/{id}`.
2. O detalhe exibe metadados e texto retornados pelo backend.
3. Registro inexistente ou falha da API apresenta mensagem compreensível.
4. Para submissões demonstrativas identificadas, a tela pode exibir score, métricas e pontos observados com rotulagem inequívoca de conteúdo simulado ou demonstrativo.

### Cenário 5 - Base demonstrativa persistida

**Como** apresentador, **quero** popular o banco com submissões identificadas como demonstração, **para** apresentar o protótipo sem depender de dados em memória.

1. Um comando de seed cria registros demonstrativos no PostgreSQL.
2. Os registros são visivelmente identificados como dados de demonstração.
3. Executar o seed novamente atualiza os mesmos registros, sem duplicá-los.
4. Os registros aparecem normalmente em `GET /laws` e podem ser abertos por detalhe.
5. Os indicadores associados aos registros demonstrativos são apresentados como simulação, sem sugerir análise real pelo backend.

## Requisitos

- **REQ-001**: O frontend DEVE centralizar URL, parsing e erros HTTP da API.
- **REQ-002**: A URL da API DEVE ser configurável por `NEXT_PUBLIC_API_URL`.
- **REQ-003**: O token DEVE poder ser enviado como `Authorization: Bearer <token>`.
- **REQ-004**: Login e cadastro NÃO DEVEM usar base local simulada de usuários.
- **REQ-005**: A submissão DEVE usar somente o contrato já aceito por `POST /laws`.
- **REQ-006**: A listagem DEVE usar somente os campos já retornados por `GET /laws`.
- **REQ-007**: A interface NÃO DEVE apresentar indicadores simulados como resultado real; score, métricas e observações de apresentação só podem ser exibidos para registros demonstrativos, com identificação visual explícita.
- **REQ-008**: O backend DEVE fornecer o detalhe persistido de uma submissão por `GET /laws/{id}`.
- **REQ-009**: O seed demonstrativo DEVE ser idempotente e persistir somente submissões explicitamente identificadas como demonstração.
- **REQ-010**: Os indicadores demonstrativos DEVEM permanecer dissociados de cálculo de score, análise de IA ou persistência analítica no backend.

## Critérios de Sucesso

- **SC-001**: Os fluxos de autenticação, submissão, listagem e detalhe usam dados persistidos sem dependência nova.
- **SC-002**: `pytest` do backend continua passando.
- **SC-003**: `npm run lint` e `npm run build` do frontend passam.
- **SC-004**: Uma validação manual confirma mensagens de carregamento, falha, sucesso e vazio.
- **SC-005**: Uma validação manual confirma que score e observações aparecem apenas na base demonstrativa e são identificados como simulados.

## Referências

- Issues #75, #93, #94 e #95.
- `backend/app/api/auth.py`.
- `backend/app/api/laws.py`.
- `frontend/src/contexts/AuthContext.tsx`.
- `frontend/src/app/upload/page.tsx`.
- `frontend/src/app/page.tsx`.
- `frontend/src/app/law/[id]/page.tsx`.
- `frontend/src/components/pages/SearchPage.tsx`.
