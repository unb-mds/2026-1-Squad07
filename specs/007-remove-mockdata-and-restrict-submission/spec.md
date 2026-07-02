# Spec: Remoção de Mockdata e Restrição de Submissão

Este documento especifica os requisitos para remover dados simulados (mocks) do dashboard da página inicial do CrivoAI e restringir o acesso ao fluxo de submissão de leis apenas a usuários autenticados.

## Contexto e Justificativa

O CrivoAI foi concebido com inteligência simulada (mocks) e dados de demonstração na Release 1 (R1). Na Release 2 (R2), o sistema deve evoluir para usar inteligência real (TF-IDF/LegalBERT) e exibir dados que reflitam o estado real do banco de dados PostgreSQL. Além disso, a submissão de leis é uma ação que modifica o estado do sistema e consome recursos da API, devendo ser protegida por autenticação para rastrear os autores e evitar abusos.

## Requisitos

### REQ-001: Remoção de Mocks da Home
- **Descrição**: O dashboard e a listagem de submissões na página inicial não devem conter dados simulados (mock).
- **Critérios de Aceite**:
  1. A seção de "Indicadores simulados para demonstração" deve ser removida ou alterada para "Indicadores de Qualidade Legislativa".
  2. A pontuação geral (média), a quantidade de leis analisadas e o número de leis críticas exibidos no dashboard devem ser calculados a partir dos dados persistidos no banco de dados.
  3. O histórico de submissões recentes deve exibir a pontuação real correspondente a cada lei (se houver), ou omitir o selo caso nenhuma análise tenha sido realizada.

### REQ-002: Proteção da Submissão de Leis (Backend)
- **Descrição**: A rota de criação de leis (`POST /laws`) deve exigir um token de autenticação JWT válido.
- **Critérios de Aceite**:
  1. Requisições sem token ou com token inválido devem retornar `401 Unauthorized`.
  2. A lei criada deve ser associada ao usuário autenticado (`uploadedByUserId`).

### REQ-003: Proteção da Submissão de Leis (Frontend)
- **Descrição**: O fluxo de submissão de leis no frontend só deve estar disponível para usuários autenticados.
- **Critérios de Aceite**:
  1. Se um usuário não autenticado acessar a rota `/upload` diretamente, ele deve ser redirecionado para a rota `/login`.
  2. Na página inicial (`/`), o card "Submeter Nova Lei / Registrar Texto" não deve ser exibido para usuários não autenticados.
  3. No lugar do card de submissão para usuários não autenticados, o sistema pode exibir uma mensagem convidando-o a realizar login para registrar novos textos legislativos, ou apenas ocultar o card de submissão e estender visualmente a listagem de submissões recentes.

### REQ-004: Endpoint de Estatísticas do Dashboard
- **Descrição**: O backend deve fornecer um endpoint seguro/público para fornecer os dados reais calculados do dashboard.
- **Critérios de Aceite**:
  1. Criar a rota `GET /api/v1/laws/statistics` (ou similar) no backend.
  2. O endpoint deve retornar a média geral dos scores das análises mais recentes, o total de leis analisadas e o número de leis críticas (score < 40%).

## Limites de Escopo
- Não serão feitas alterações nos modelos de NLP de classificação.
- O fluxo de cadastro e login de usuários já implementado não deve ser alterado, apenas consumido.
- A listagem pública de submissões e a visualização detalhada de leis permanecem acessíveis para usuários não autenticados, conforme o requisito de transparência do projeto.
