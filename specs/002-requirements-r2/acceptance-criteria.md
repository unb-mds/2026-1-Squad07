# Critérios de Aceite — Release 2

## 1. Contexto e Objetivo
Este documento estabelece os **Critérios de Aceite (Acceptance Criteria — AC)** para as funcionalidades mapeadas na Release 2 do CrivoAI. A especificação destes critérios visa eliminar ambiguidades de escopo, alinhar as entregas técnicas com as expectativas de produto e fornecer uma base estruturada em comportamento (BDD) para a elaboração de planos de teste automatizados guiados por TDD.

## 2. Relação com o Projeto e User Story Mapping
Cada bloco de critério de aceite abaixo está vinculado a um Épico correspondente do nosso User Story Mapping (USM). Os limites quantitativos de qualidade e performance de dados foram extraídos e validados em conformidade com o documento de Métricas de Sucesso da IA (`ai-success-metrics.md`) e com os contratos do model Pydantic `AnalysisResponse` acordados no PR #128.

---

## 3. Especificação dos Critérios de Aceite (GIVEN / WHEN / THEN)

### Módulo 1: Análise de Inteligência Artificial (NLP)
* **Épico Vinculado:** Inteligência Artificial (NLP)
* **Métricas Base:** Precisão mínima de 85%, Recall de 80% e F1-Score de 0,82.

#### AC 1.1 — Formato de Resposta Estruturada do Agente (`AnalysisResponse`)
* **GIVEN** que o Agente de IA proprietário finalizou o processamento de análise de uma lei submetida através do endpoint `POST /api/v1/analysis/evaluate`.
* **WHEN** o payload de resposta for retornado para a camada de Back-end (FastAPI) e mapeado pelo model `AnalysisResponse`.
* **THEN** o resultado deve obrigatoriamente se estruturar em formato JSON válido contendo os campos: `score` (representado como float decimal de 0.0 a 1.0), um dicionário `metrics` (contendo as probabilidades calculadas por categoria) e um array de `warnings` contendo objetos estruturados com as chaves `{ code, message, confidence }` para contemplar as 4 categorias de erros, sem dependência ou obrigatoriedade de campos de resumo síncronos.

#### AC 1.2 — Validação de Inferência Operacional e Latência
* **GIVEN** que uma requisição de análise legislativa foi disparada pelo usuário.
* **WHEN** o Back-end processar a inferência através do modelo proprietário.
* **THEN** o tempo de resposta para o recebimento do payload inicial não deve ultrapassar **2 segundos**, disparando um alerta de lentidão operacional (`slow_query`/`slow_analysis`) nos logs estruturados caso atinja o limite crítico de **5 segundos**.

#### AC 1.3 — Validação de Input Mínimo na Camada de Serviço
* **GIVEN** que o usuário submeteu uma proposição legislativa com um texto que atende à validação inicial do schema Pydantic (`min_length=1`).
* **WHEN** a camada de serviço/regra de negócio no backend avaliar que o tamanho real do texto é inferior ao limite operacional de 100 caracteres.
* **THEN** o sistema deve interceptar a requisição antes de acionar o Agente de IA, retornar um código HTTP 400 (Bad Request) e exibir uma validação em tela informando a insuficiência de caracteres para o cálculo de qualidade.

#### AC 1.4 — Geração Assíncrona do Resumo Legislativo
* **GIVEN** que o usuário solicitou a geração do resumo curto de uma proposição legislativa válida.
* **WHEN** o serviço de sumarização assíncrona for acionado no Back-end.
* **THEN** o sistema deve isolar o processamento em segundo plano sem bloquear o fluxo síncrono de avaliação de qualidade do texto, disponibilizando posteriormente o campo `summary` preenchido com uma string estruturada de até 500 caracteres assim que a inferência do Agente de IA for concluída.

---

### Módulo 2: Autenticação e Perfil
* **Épico Vinculado:** Acesso e Identidade
* **Nota de Escopo:** O CRUD de perfil está alocado na Release 2, enquanto os fluxos avançados de segurança (Recuperação de senha por e-mail e 2FA) encontram-se mapeados no Roadmap de Longo Prazo, estando documentados aqui para fins de rastreabilidade e cumprimento de requisitos futuros.

#### AC 2.1 — Atualização Cadastral de Perfil (CRUD Frontend)
* **GIVEN** que o usuário está autenticado e acessa a sua página de gerenciamento de perfil no Front-end.
* **WHEN** ele alterar seus dados cadastrais (nome ou senha) e confirmar a submissão do formulário.
* **THEN** o Front-end deve validar a integridade dos campos localmente, disparar a requisição assíncrona para a API e persistir os dados via Prisma ORM, atualizando o estado global da aplicação em tela sem exigir o recarregamento forçado da página (F5).

#### AC 2.2 — Segurança no Fluxo de Recuperação de Senha (Roadmap)
* **GIVEN** que um usuário solicitou a recuperação de conta informando um e-mail cadastrado.
* **WHEN** o token enviado por e-mail for utilizado para redefinição ou atingir o tempo limite de expiração de **15 minutos**.
* **THEN** o sistema deve invalidar o token de segurança na base de dados e bloquear qualquer tentativa subsequente de acesso à rota de troca de senha através do mesmo link.

#### AC 2.3 — Autenticação de Dois Fatores (2FA — Roadmap)
* **GIVEN** que o usuário ativou a camada de Autenticação de Dois Fatores em suas configurações de segurança.
* **WHEN** ele realizar o login inserindo e-mail e senha corretos na interface principal.
* **THEN** o sistema deve reter o redirecionamento para o Dashboard e exigir obrigatoriamente a inserção de um token numérico dinâmico (OTP) válido antes de autorizar a geração do token JWT de sessão.

---

### Módulo 3: Melhorias de Interface (UI/UX Improvements)
* **Épico Vinculado:** Visualização de Dados & Relatórios

#### AC 3.1 — Responsividade Adaptativa do Relatório Analítico
* **GIVEN** que o usuário acessa a página de visualização lado a lado contendo o texto original e os apontamentos da IA.
* **WHEN** o viewport do navegador for reduzido para resoluções mobile (largura inferior a 768px).
* **THEN** o layout deve se adaptar dinamicamente via TailwindCSS, movendo os cards laterais de ambiguidade para a porção inferior do texto original, mantendo o scroll independente e a legibilidade integral dos destaques (*highlights*).

#### AC 3.2 — Acessibilidade de Componentes Dinâmicos (WCAG)
* **GIVEN** que o usuário navega pelo Dashboard utilizando leitores de tela ou teclado.
* **WHEN** o foco interativo passar pelos gráficos de score e cards de problemas identificados pela IA.
* **THEN** os elementos HTML devem conter propriedades `aria-label` descritivas, suporte completo à navegação via tecla *Tab* e contraste de cor mínimo de 4.5:1, impedindo barreiras de acessibilidade visual.

#### AC 3.3 — Vinculação Interativa de Destaques e Cards de Alertas
* **GIVEN** que a tela de relatório renderizou com sucesso as marcações (*highlights*) no texto original da lei.
* **WHEN** o usuário clicar ou passar o cursor (*hover*) sobre um trecho de texto destacado.
* **THEN** a interface deve aplicar um destaque visual reflexo no card lateral correspondente àquele aviso (`warning`) e trazê-lo para o foco de visão do usuário (*scroll into view*).

---

### Módulo 4: Integração de Dados e Infraestrutura
* **Épico Vinculado:** Infraestrutura & DevOps / Descoberta & Gestão de Acervo

#### AC 4.1 — Persistência e Sincronização Sólida com Prisma ORM
* **GIVEN** que o banco de dados PostgreSQL está operando sob concorrência múltipla de escritas.
* **WHEN** novas proposições forem submetidas ou novos perfis criados simultaneamente.
* **THEN** o Prisma ORM deve executar as operações em blocos transacionais isolados, garantindo que falhas de rede em uma requisição não corrompam registros paralelos e que conexões ociosas no pool sejam limpas de forma eficiente.

#### AC 4.2 — Isolamento e Reprodutibilidade no Ambiente Docker
* **GIVEN** que o container do Back-end ou do Front-end foi inicializado isoladamente via Docker.
* **WHEN** o ambiente for instanciado sem volumes persistentes de dependências locais (ex: `node_modules` ou pacotes globais da máquina do desenvolvedor).
* **THEN** a aplicação deve compilar e rodar com sucesso baseando-se estritamente nas instruções do `Dockerfile` e nas variáveis parametrizadas no `.env`, garantindo a idêntica execução do código entre as máquinas locais e o pipeline de CI/CD.

#### AC 4.3 — Critério de Bloqueio e Feedback do Pipeline de CI/CD
* **GIVEN** que um desenvolvedor abriu um Pull Request ou realizou um *push* para a branch de desenvolvimento.
* **WHEN** o pipeline de CI/CD automatizado executar os jobs de validação.
* **THEN** o GitHub Actions deve falhar e **bloquear o merge** caso o linter acuse erros de formatação, o build do Docker falhe ou qualquer teste unitário/integração do `pytest` retorne falha.

---

## 4. Validação da Especificação (TDD Documental)

Para cumprimento das diretrizes de governança técnica do projeto, os critérios de aceite documentados foram verificados em relação à consistência de requisitos através do seguinte teste lógico:

| ID | Cenário de Teste Documental | Método de Verificação | Status |
|----|-----------------------------|-----------------------|--------|
| TS-AC01 | Cobertura de Escopo R2 | Verificação se os módulos descritos cobrem todos os épicos ativos listados para a sprint atual no USM. | Aprovado |
| TS-AC02 | Testabilidade de Cláusulas | Confirmação de que todas as condições `THEN` possuem métricas exatas e em conformidade com o PR #128 (ex: score float 0.0-1.0, warnings, metrics, HTTP 400 na camada Service) para guiar o `test-plan.md`. | Aprovado |
| TS-AC03 | Tratamento de Desvio de Escopo | Validação se o fluxo de autenticação avançada e o resumo assíncrono foram isolados corretamente em seus respectivos cronogramas. | Aprovado |