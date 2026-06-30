# Spec Driven Development - Dashboard de Produtividade

Status: spec

---

## Projeto

O projeto **Monitoramento de Qualidade de Leis** tem como objetivo desenvolver uma plataforma web para apoiar a avaliação técnica de leis e proposições legislativas. A proposta permite que usuários submetam textos legislativos para análise, organização e futura avaliação com apoio de inteligência artificial.

O dashboard de produtividade existe para acompanhar o processo de desenvolvimento do Squad 07 durante a disciplina de Métodos de Desenvolvimento de Software. Ele deve facilitar a visualização de entregas, participação individual, evolução por sprint e distribuição de trabalho entre documentação, frontend, backend, banco e demais áreas do projeto.

---

## Constituição da área de métricas

### Automação e baixa manutenção

1. O dashboard deve ser atualizado automaticamente sempre que possível.
2. Não dependa de serviços pagos ou credenciais externas além do `GITHUB_TOKEN` padrão do GitHub Actions.
3. Os dados devem ser reproduzíveis por meio do workflow de métricas.
4. O painel deve continuar funcionando como página estática, sem backend próprio.

### Transparência

5. Todas as métricas devem ser derivadas de dados do próprio repositório: commits, issues, pull requests, labels, milestones e reviews.
6. Métricas individuais devem facilitar a avaliação visual da professora, sem exigir interpretação técnica complexa.
7. Rankings diretos são permitidos para facilitar comparação entre integrantes.
8. Métricas devem ser apresentadas com nomes claros e sem abreviações ambíguas.

### Simplicidade

9. A página deve permanecer como um `index.html` estático em `docs/metricas/`.
10. Não introduza build steps como Webpack, Vite ou similares para este painel.
11. Prefira bibliotecas leves via CDN quando forem necessárias para visualização.
12. Não altere a estrutura principal do projeto para resolver demandas do dashboard.

### Identidade visual

13. O painel de métricas deve seguir a identidade visual oficial do projeto, adotando um tema escuro imersivo de alta fidelidade (Eigengrau `#030213`).
14. Alterações visuais devem priorizar clareza, contraste, legibilidade de dados D3.js e estética moderna de vidro translúcido ("liquid glass") com desfoque de fundo.
15. Não use a paleta institucional antiga da UnB como base principal do painel.

---

## Convenções técnicas

- Página: HTML5 estático em `docs/metricas/index.html`.
- Estilização: CSS embutido ou TailwindCSS via CDN.
- Gráficos: D3.js v7 via CDN.
- Dados: `docs/metricas/metrics.json`.
- Coleta: `docs/metricas/collect_metrics.py`.
- Workflow: `.github/workflows/metrics.yml`.
- Linguagem do script coletor: Python 3.11+.
- Dependência do script coletor: PyGithub.
- Publicação oficial: GitHub Pages.
- Branch de integração e desenvolvimento: `dev` (as coletas de commits e dados analisam o histórico desta branch para capturar o progresso do time).
- Suavização de Rolagem: Interpolação linear (LERP) executada com `requestAnimationFrame` para animar os orbes de fundo sem latência ou travamentos.

### Paleta oficial do projeto

| Nome da cor | Código HEX | Aplicação |
| --- | --- | --- |
| Azul Marinho | `#1e3a5f` | Header, botões primários, títulos e séries principais. |
| Branco Puro | `#ffffff` | Fundo de cards e background geral. |
| Cinza claro | `#ececf0` | Divisórias e bordas sutis. |
| Input Gray | `#f3f3f5` | Fundo de campos de busca, áreas neutras e estados sem dados. |
| Success Green | `#22c55e` | Métricas positivas, concluídas ou notas acima de 70%. |
| Error Red | `#ef4444` | Métricas críticas, erros ou notas abaixo de 40%. |
| Warning yellow | `#eab308` | Métricas em aviso, entre 40% e 70%. |
| Eigengrau | `#030213` | Texto principal e elementos de alto contraste. |

### Aplicação da paleta no dashboard

- Header e títulos principais: Branco Puro com glows/orbes de luz coloridos no fundo.
- Fundo geral: Eigengrau (`#030213`) como base escura fixa.
- Cards e Painéis: Vidro escuro translúcido (`rgba(15, 23, 42, 0.55)` a `rgba(8, 12, 28, 0.75)`) com desfoque de fundo de `28px` e saturação aumentada de `130%` (liquid glass).
- Bordas, divisórias e linhas de tabela: Borda fina e translúcida (`rgba(255, 255, 255, 0.08)`) com bevel de reflexo superior (`rgba(255, 255, 255, 0.16)`) e esquerdo (`rgba(255, 255, 255, 0.12)`).
- Hover de Cards: Deslocamento vertical suave (-5px), intensificação de bordas especulares, e projeção de brilho retroiluminado difuso azul-ciano no fundo.
- Áreas neutras, campos e estados vazios: Slate escuro translúcido com contrastes suaves.
- Issues fechadas, progresso concluído e métricas positivas: Success Green (`#4ade80`).
- Estados de erro no carregamento do JSON: Error Red (`#f87171`).
- Avisos, coautoria ou indicadores intermediários: Warning yellow (`#facc15`).
- Texto principal: Branco Puro e Slate claro (`#f1f5f9`/`#94a3b8`).
- Heatmap de commits: Gradiente partindo do tom escuro de card (`rgba(255, 255, 255, 0.04)`) para azul marinho escuro (`#1e3a5f`) e azul ciano neon (`#38bdf8`) nas atividades de pico.
- Orbes de fundo (Blobs): 6 círculos coloridos desfocados móveis no plano de fundo (`-z-10`) com pulsação CSS infinita, translações paralaxe tridimensionais, escalas líquidas e deslocamento cromático (`hue-rotate`) ao rolar a página.

### Interação e leitura dos dados

- Gráficos devem responder ao mouse com tooltip legível e animações fluidas de entrada (fade-in-up, lines se desenhando, barras crescendo).
- Tooltips devem ter área suficiente para leitura confortável, com título e valor em linhas separadas.
- Barras, pontos e células de heatmap devem indicar interatividade no hover.
- Tabelas com agrupamento por pessoa devem evitar repetir o mesmo nome várias vezes quando os dados puderem ser apresentados em um único bloco.
- Filtros devem ser usados quando a tabela completa dificultar a leitura, especialmente em métricas por sprint/milestone.
- Layout Responsivo sem Scroll Horizontal: A largura máxima do site é fixada em `1360px` com grades mais compactas e fontes dimensionadas, eliminando cortes laterais e a necessidade de arrastar elementos em resoluções comuns.

### Semântica das métricas individuais e Avatares

- Agrupamentos por pessoa devem usar `username` como identificador interno confiável.
- O `name` público do GitHub deve ser usado apenas como texto de exibição.
- Cada integrante ativo deve ter sua foto de perfil oficial obtida dinamicamente da API pública do GitHub (`https://github.com/username.png?size=64`) com fallback para badge de iniciais em caso de falha de requisição.
- **Privacidade do Professor:** Como política de respeito à privacidade, a foto de perfil da professora Carla Rocha (logins `carla-rocha`, `RochaCarla` ou nome `Carla Rocha`) **não deve ser buscada do GitHub** nem exposta, devendo-se utilizar obrigatoriamente e exclusivamente o badge estático de iniciais `CR` em seu lugar.
- `issues_assigned_closed` represents issues atribuídas à pessoa que foram concluídas, não autoria do fechamento.
- O rótulo visual dessa métrica deve ser `Atribuídas concluídas`.
- Contribuição em documentação deve representar execução rastreável.
- Issues de documentação contam para a pessoa que fechou a issue via `closed_by`.
- PRs de documentação contam para o autor do pull request.
- Commits de documentação contam para o autor do commit quando alteram `docs/` ou arquivos `.md`.
- Issues de documentação sem `closed_by` confiável não devem ser contabilizadas como contribuição individual efetiva.

---

## Como usar este arquivo

Antes de qualquer alteração na área de métricas, leia este arquivo e siga o fluxo:

1. Verifique a branch atual e confirme que não está na `main`.
2. Leia o estado atual da implementação.
3. Identifique qual funcionalidade de métricas será alterada.
4. Confira o escopo permitido e o fora de escopo.
5. Implemente apenas uma responsabilidade por tarefa.
6. Atualize este arquivo se a decisão de produto, métrica, critério de aceite ou identidade visual mudar.

Este arquivo é a referência de Spec Driven Development da área de métricas. Ele deve preservar o plano original de criação do dashboard e também indicar o que já foi implementado, o que está parcial e o que ainda será evoluído.

---

## Escopo permitido

Arquivos permitidos por padrão:

- `docs/metricas/AGENT.md`
- `docs/metricas/collect_metrics.py`
- `docs/metricas/metrics.json`
- `docs/metricas/index.html`
- `.github/workflows/metrics.yml`

Alterações fora desses arquivos exigem permissão explícita.

---

## Fora de escopo padrão

A menos que exista solicitação explícita, não faça:

- adicionar autenticação;
- criar backend para o dashboard;
- alterar frontend principal do produto;
- alterar backend principal do produto;
- alterar banco de dados;
- alterar documentação de requisitos, escopo ou arquitetura;
- coletar métricas de repositórios externos;
- adicionar serviços pagos;
- adicionar dependências sem justificativa técnica;
- criar build step para a página de métricas;
- alterar pipelines de CI/CD não relacionados ao dashboard;
- transformar métricas em julgamento absoluto de desempenho individual.

---

## Estado atual da implementação

### Implementado

- Script coletor em `docs/metricas/collect_metrics.py` (otimizado com Git local para arquivos alterados para evitar Rate Limit e leitura orientada à branch `dev`).
- Arquivo de dados em `docs/metricas/metrics.json` (atualizado com suporte ao campo unificado de coautoria).
- Página estática em `docs/metricas/index.html`.
- Workflow de atualização em `.github/workflows/metrics.yml` configurado para execução semanal (cron dominical).
- Publicação via GitHub Pages.
- Uso de PyGithub para coleta de dados do repositório.
- Uso de D3.js e TailwindCSS via CDN na página HTML.
- Coleta de métricas por pessoa, labels, documentação e milestones integrando Issues e PRs.
- Exibição das novas métricas no painel com avatares reais do GitHub e exceção de privacidade.
- Identidade visual escurecida e moderna aplicada ("liquid glass" e LERP).
- Layout responsivo e adaptado para evitar barra de rolagem horizontal.

### Métricas existentes no JSON

- `generated_at`: data e horário de geração.
- `repository`: repositório analisado.
- `issues_per_week`: issues abertas e fechadas por semana.
- `commit_message_histogram`: distribuição de tamanho das mensagens de commit.
- `coauthors_per_week`: contagem de coautores por semana (`coauthors`/`count`) acompanhada da chave `details`, que lista os nomes reais dos coautores de cada semana para exibição na tooltip do gráfico.
- `commit_heatmap`: mapa de calor de commits por dia e hora.
- `top_committers`: ranking de commits por pessoa.
- `top_pr_authors`: ranking de autores de pull requests.
- `top_issue_contributors`: ranking de contribuições em issues abertas e fechadas.

### Parcialmente implementado

- (Nenhuma funcionalidade parcial pendente de código básico).

### Pendente

- Regenerar o `metrics.json` com dados reais das novas métricas após workflow em ambiente oficial.
- Validar responsividade da página diretamente no ambiente do GitHub Pages.
- Validar o workflow após o merge definitivo na branch `dev`.

---

## Funcionalidade: Dashboard base

### Spec

O usuário acessa a página do dashboard via GitHub Pages e visualiza métricas públicas do repositório, geradas automaticamente pelo GitHub Actions.

O dashboard base deve exibir 8 componentes visuais:

1. Gráfico de linhas de issues abertas vs. fechadas por semana.
2. Histograma de tamanho das mensagens de commit.
3. Gráfico de barras de coautores por semana.
4. Mapa de calor de commits por dia da semana e horário.
5. Gráfico de barras empilhadas de issues abertas e fechadas por semana.
6. Ranking de top committers.
7. Ranking de autores de pull requests.
8. Ranking de contribuições em issues.

### Plano original preservado

O plano original do dashboard base era criar:

1. Script coletor (`docs/metricas/collect_metrics.py`).
2. Workflow de atualização (`.github/workflows/metrics.yml`).
3. Página HTML (`docs/metricas/index.html`).
4. Publicação via GitHub Pages.

Esse plano permanece válido como fundação do dashboard. A diferença é que, no estado atual, esses artefatos já existem e devem ser tratados como base para evolução, correção e validação.

### Critérios de aceite

- O painel carrega `metrics.json` via GitHub Pages.
- Todos os 8 componentes visuais são renderizados sem erro.
- Gráficos possuem hover responsivo ao mouse.
- Tooltips são legíveis e não ficam pequenos demais para os dados apresentados.
- No gráfico de coautores por semana, a tooltip deve exibir os nomes reais dos coautores da semana (campo `details`), e não apenas a contagem total.
- Quando um gráfico possuir mais de 8 rótulos no eixo X (ex.: muitas semanas de histórico de coautoria), os rótulos devem ser rotacionados em -45° para evitar sobreposição e garantir a legibilidade.
- A página é responsiva em desktop e mobile.
- A mensagem de erro aparece apenas quando o JSON não pode ser carregado.
- O ranking exibe até 10 pessoas ou todos os registros disponíveis, o que for menor.
- A interface utiliza a paleta oficial do projeto.

### Tarefas

- [x] Criar script coletor.
- [x] Criar workflow.
- [x] Criar página HTML.
- [x] Gerar `metrics.json`.
- [x] Aplicar identidade visual oficial no painel.
- [ ] Validar renderização final no GitHub Pages.
- [ ] Validar responsividade em desktop e mobile.

---

## Funcionalidade: Métricas por pessoa

### Spec

O painel deve permitir que a professora visualize a participação de cada integrante de forma direta. As métricas individuais devem ser apresentadas em rankings e tabelas de fácil leitura.

### Métricas planejadas

- Issues abertas por pessoa.
- Issues atribuídas por pessoa.
- Issues fechadas por pessoa.
- Issues pendentes por pessoa.
- Pull requests abertos por pessoa.
- Pull requests revisados por pessoa.
- Pull requests mergeados por pessoa.
- Commits realizados por pessoa.

### Critérios de aceite

- O painel diferencia autoria de PR e participação em review.
- O painel diferencia issues abertas, atribuídas, fechadas e pendentes.
- O painel exibe rankings diretos por pessoa.
- Usuários removidos ou indisponíveis aparecem como `ghost`.
- Métricas ausentes não quebram a página.

### Plano

- Expandir o coletor para agregar métricas por usuário.
- Consultar assignees das issues para medir atribuição e pendência.
- Consultar pull requests para medir autoria, merge e reviews.
- Atualizar o schema do JSON com uma seção específica de métricas por pessoa.
- Atualizar o HTML para exibir ranking ou tabela consolidada.

### Tarefas

- [x] Coletar issues atribuídas por pessoa.
- [x] Coletar issues pendentes por pessoa.
- [x] Coletar PRs mergeados por pessoa.
- [x] Coletar PRs revisados por pessoa.
- [x] Criar tabela consolidada de métricas por pessoa.
- [x] Atualizar critérios visuais do painel para ranking direto.
- [ ] Validar dados reais após execução do workflow.

---

## Funcionalidade: Distribuição por labels

### Spec

O painel deve mostrar como o trabalho do projeto está distribuído entre áreas e tipos de tarefa por meio das labels do GitHub.

### Métricas planejadas

- Quantidade de issues por label.
- Quantidade de issues por pessoa agrupadas por label.
- Distribuição por labels como documentação, frontend, backend, banco, feature, bugfix, chore e prioridade.

### Critérios de aceite

- Labels sem issues não precisam aparecer.
- Issues com múltiplas labels devem contar em todas as labels correspondentes.
- A visualização deve permitir identificar rapidamente quais áreas concentram mais trabalho.
- A distribuição por pessoa deve facilitar avaliação individual.
- Labels por pessoa devem ser agrupadas pelo nome do integrante, com as labels listadas abaixo de cada nome.
- A interface não deve repetir o nome da mesma pessoa em várias linhas para essa visualização.

### Plano

- Expandir a coleta de issues para registrar labels.
- Criar agregação geral por label.
- Criar agregação por pessoa e label com base em assignees.
- Atualizar o JSON com seções específicas para labels.
- Adicionar visualização de barras ou tabela no HTML.

### Tarefas

- [x] Coletar labels por issue.
- [x] Gerar ranking geral de labels.
- [x] Gerar distribuição de labels por pessoa.
- [x] Exibir labels no painel.
- [x] Agrupar labels por pessoa na visualização.
- [ ] Validar dados reais após execução do workflow.

---

## Funcionalidade: Contribuição em documentação

### Spec

O painel deve destacar contribuições relacionadas à documentação, porque a documentação é parte central da avaliação da disciplina e da Release 1.

### Métricas planejadas

- Issues de documentação fechadas por pessoa via `closed_by`.
- Pull requests de documentação por pessoa.
- Commits que alteram arquivos em `docs/`.
- Commits que alteram arquivos `.md`.

### Critérios de aceite

- O painel diferencia contribuição geral de contribuição documental.
- Alterações em `docs/` contam como documentação.
- Alterações em arquivos `.md` contam como documentação.
- Issues de documentação fechadas contam para o usuário em `closed_by`.
- PRs com label `documentation` ou título iniciando com `docs:` contam como documentação para o autor do PR.

### Plano

- Coletar labels e títulos de PRs para identificar documentação.
- Coletar `closed_by` das issues de documentação para evitar atribuição ambígua.
- Inspecionar arquivos alterados em commits ou PRs quando necessário.
- Adicionar métricas documentais ao JSON.
- Exibir ranking direto de documentação por pessoa.

### Tarefas

- [x] Identificar PRs de documentação.
- [x] Identificar commits documentais.
- [x] Identificar issues documentais fechadas por pessoa.
- [x] Exibir ranking de contribuição em documentação.
- [ ] Validar dados reais após execução do workflow.

---

## Funcionalidade: Progresso por sprint/milestone

### Spec

O painel deve mostrar a evolução do trabalho por sprint usando milestones do GitHub. Essa visão deve ajudar a equipe e a professora a entenderem o que foi planejado, concluído e pendente em cada sprint. O progresso das sprints contabiliza de forma unificada tanto as issues comuns quanto os pull requests associados a cada milestone.

### Métricas planejadas

- Issues e PRs por milestone.
- Items concluídos por milestone.
- Items pendentes por milestone.
- Distribuição de issues e PRs por pessoa dentro da milestone.

### Critérios de aceite

- **Listagem Abrangente:** Todas as milestones do repositório devem ser listadas, mesmo que não possuam issues associadas, para garantir que as sprints 09 e 10 sejam exibidas corretamente.
- **Contabilização Unificada:** O progresso das sprints contabiliza de forma integrada e unificada tanto as issues comuns quanto os pull requests associados a cada milestone.
- Issues e PRs abertos contam como pendentes.
- Issues fechadas e PRs mergeados/fechados contam como concluídos.
- A visualização deve permitir comparar progresso entre sprints.
- **Renderização sem truncamento:** A tabela de progresso por sprint deve exibir todas as milestones coletadas, sem limite de linhas, para que o fluxo não trave em sprints intermediárias (ex.: Sprint 08) e as sprints posteriores (09, 10, ...) também apareçam.
- A distribuição por pessoa deve aparecer dentro da milestone.
- A visualização por pessoa deve possuir filtro de sprint/milestone.
- Após selecionar uma sprint, o painel deve mostrar cada integrante com suas colaborações naquela sprint.

### Plano

- Pré-carregar todas as milestones do repositório para evitar omissões.
- Expandir a coleta de issues e pulls para registrar suas respectivas milestones de forma unificada.
- Agrupar itens por milestone e status (`opened`, `closed`, `pending`).
- Agrupar itens por milestone e assignee.
- Atualizar o JSON com progresso detalhado por sprint.
- Exibir tabela ou gráfico por sprint/milestone com suporte a filtros dinâmicos.

### Tarefas

- [x] Coletar milestone de cada issue e pull request.
- [x] Gerar progresso geral por milestone de forma pré-carregada.
- [x] Gerar progresso por pessoa dentro da milestone.
- [x] Exibir progresso por sprint no painel.
- [x] Adicionar filtro de sprint/milestone para progresso por pessoa.
- [ ] Validar dados reais após execução do workflow.

---

## Funcionalidade: Workflow de atualização automática

### Spec

O workflow deve gerar o `metrics.json` automaticamente, usando apenas `GITHUB_TOKEN`, sem serviços externos e sem exigir intervenção manual para uso normal.

### Critérios de aceite

- O workflow roda por `workflow_dispatch`.
- O workflow roda por cron semanal (configurado para execução dominical).
- O workflow roda em push na `dev` quando arquivos de métricas forem alterados.
- O workflow faz commit do `metrics.json` atualizado na `dev`.
- O workflow não deve gerar loop infinito de commits.

### Plano

- Manter o workflow mínimo.
- Instalar apenas dependências necessárias.
- Executar o coletor.
- Commitar apenas `docs/metricas/metrics.json` quando houver mudança.

### Tarefas

- [x] Criar workflow de métricas.
- [x] Configurar `workflow_dispatch`.
- [x] Configurar cron semanal.
- [x] Configurar push controlado na `dev`.
- [ ] Validar execução após merge na `dev`.

---

## Funcionalidade: Publicação via GitHub Pages

### Spec

O acesso oficial ao painel deve acontecer via GitHub Pages. O painel não deve depender de `file://` como critério oficial, porque navegadores podem bloquear `fetch("metrics.json")` quando o arquivo é aberto diretamente.

### Critérios de aceite

- A página é acessível via GitHub Pages.
- O JSON é servido no mesmo domínio da página.
- A página carrega os dados sem erro de CORS.
- A navegação para o painel está disponível quando configurada no MkDocs.

### Plano

- Manter `docs/metricas/index.html` e `docs/metricas/metrics.json` juntos.
- Usar `fetch("metrics.json")` com caminho relativo.
- Validar acesso publicado via GitHub Pages.
- Não tratar `file://` como ambiente oficial.

### Tarefas

- [x] Criar página estática.
- [x] Criar JSON no mesmo diretório.
- [ ] Validar publicação via GitHub Pages.
- [ ] Validar navegação a partir da documentação do projeto.

---

## Schema atual do metrics.json

```json
{
  "generated_at": "2026-05-11T03:00:00+00:00",
  "repository": "unb-mds/2026-1-Squad07",
  "issues_per_week": [
    { "week": "2026-W18", "opened": 5, "closed": 3 }
  ],
  "commit_message_histogram": [
    { "range": "0-20", "count": 12 },
    { "range": "21-50", "count": 30 },
    { "range": "51-100", "count": 45 },
    { "range": "101-200", "count": 20 },
    { "range": "200+", "count": 5 }
  ],
  "coauthors_per_week": [
    { "week": "2026-W18", "coauthors": 4, "count": 4, "details": ["Fulano de Tal", "Ciclana Souza"] }
  ],
  "commit_heatmap": [
    { "day": 0, "hour": 10, "count": 8 }
  ],
  "top_committers": [
    { "username": "usuario", "name": "Usuario", "commits": 42 }
  ],
  "top_pr_authors": [
    { "username": "usuario", "name": "Usuario", "prs_opened": 15 }
  ],
  "top_issue_contributors": [
    { "username": "usuario", "name": "Usuario", "opened": 10, "closed": 8, "total": 18 }
  ]
}