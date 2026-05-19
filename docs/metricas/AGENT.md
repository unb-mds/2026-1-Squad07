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

13. O painel de métricas deve seguir a identidade visual oficial do projeto.
14. Alterações visuais devem priorizar clareza, contraste e consistência com a plataforma principal.
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
- Branch de integração: `dev`.

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

- Header e títulos principais: Azul Marinho.
- Fundo geral e cards: Branco Puro.
- Bordas, divisórias e linhas de tabela: Cinza claro.
- Áreas neutras, campos e estados vazios: Input Gray.
- Issues fechadas, progresso concluído e métricas positivas: Success Green.
- Estados de erro no carregamento do JSON: Error Red.
- Avisos, coautoria ou indicadores intermediários: Warning yellow.
- Texto principal, tooltips e alto contraste: Eigengrau.
- Mapa de calor: gradiente de Input Gray para Azul Marinho.

### Interação e leitura dos dados

- Gráficos devem responder ao mouse com tooltip legível.
- Tooltips devem ter área suficiente para leitura confortável, com título e valor em linhas separadas.
- Barras, pontos e células de heatmap devem indicar interatividade no hover.
- Tabelas com agrupamento por pessoa devem evitar repetir o mesmo nome várias vezes quando os dados puderem ser apresentados em um único bloco.
- Filtros devem ser usados quando a tabela completa dificultar a leitura, especialmente em métricas por sprint/milestone.

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

- Script coletor em `docs/metricas/collect_metrics.py`.
- Arquivo de dados em `docs/metricas/metrics.json`.
- Página estática em `docs/metricas/index.html`.
- Workflow de atualização em `.github/workflows/metrics.yml`.
- Publicação esperada via GitHub Pages.
- Uso de PyGithub para coleta de dados do repositório.
- Uso de D3.js e TailwindCSS via CDN na página HTML.
- Coleta planejada de métricas por pessoa, labels, documentação e milestones.
- Exibição das novas métricas no painel com fallback para JSON ainda não regenerado.
- Identidade visual oficial aplicada à página do painel.

### Métricas existentes no JSON

- `generated_at`: data e horário de geração.
- `repository`: repositório analisado.
- `issues_per_week`: issues abertas e fechadas por semana.
- `commit_message_histogram`: distribuição de tamanho das mensagens de commit.
- `coauthors_per_week`: coautores por semana.
- `commit_heatmap`: mapa de calor de commits por dia e hora.
- `top_committers`: ranking de commits por pessoa.
- `top_pr_authors`: ranking de autores de pull requests.
- `top_issue_contributors`: ranking de contribuições em issues abertas e fechadas.

### Parcialmente implementado

- O `metrics.json` versionado possui as novas chaves com fallback, mas os valores reais dependem da próxima execução do coletor.
- A validação local completa do coletor depende de um ambiente Python com PyGithub instalado.
- A validação final do painel depende da publicação via GitHub Pages.

### Pendente

- Regenerar o `metrics.json` com dados reais das novas métricas.
- Validar responsividade da página no GitHub Pages.
- Validar o workflow após merge na `dev`.

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

- Issues com label de documentação por pessoa.
- Pull requests de documentação por pessoa.
- Commits que alteram arquivos em `docs/`.
- Commits que alteram arquivos `.md`.

### Critérios de aceite

- O painel diferencia contribuição geral de contribuição documental.
- Alterações em `docs/` contam como documentação.
- Alterações em arquivos `.md` contam como documentação.
- PRs com label `documentation` ou título iniciando com `docs:` contam como documentação.

### Plano

- Coletar labels e títulos de PRs para identificar documentação.
- Inspecionar arquivos alterados em commits ou PRs quando necessário.
- Adicionar métricas documentais ao JSON.
- Exibir ranking direto de documentação por pessoa.

### Tarefas

- [x] Identificar PRs de documentação.
- [x] Identificar commits documentais.
- [x] Identificar issues documentais por pessoa.
- [x] Exibir ranking de contribuição em documentação.
- [ ] Validar dados reais após execução do workflow.

---

## Funcionalidade: Progresso por sprint/milestone

### Spec

O painel deve mostrar a evolução do trabalho por sprint usando milestones do GitHub. Essa visão deve ajudar a equipe e a professora a entenderem o que foi planejado, concluído e pendente em cada sprint.

### Métricas planejadas

- Issues por milestone.
- Issues concluídas por milestone.
- Issues pendentes por milestone.
- Distribuição de issues por pessoa dentro da milestone.

### Critérios de aceite

- Milestones sem issues podem ser omitidas.
- Issues abertas contam como pendentes.
- Issues fechadas contam como concluídas.
- A visualização deve permitir comparar progresso entre sprints.
- A distribuição por pessoa deve aparecer dentro da milestone.
- A visualização por pessoa deve possuir filtro de sprint/milestone.
- Após selecionar uma sprint, o painel deve mostrar cada integrante com suas colaborações naquela sprint.

### Plano

- Expandir a coleta de issues para incluir milestone.
- Agrupar issues por milestone e status.
- Agrupar issues por milestone e assignee.
- Atualizar o JSON com progresso por sprint.
- Exibir tabela ou gráfico por sprint/milestone.

### Tarefas

- [x] Coletar milestone de cada issue.
- [x] Gerar progresso geral por milestone.
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
- O workflow roda por cron semanal.
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
    { "week": "2026-W18", "count": 4 }
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
```

---

## Schema planejado para evolução

As novas métricas devem ser adicionadas sem remover as chaves atuais, para preservar compatibilidade com o painel existente.

```json
{
  "people_metrics": [
    {
      "username": "usuario",
      "name": "Usuario",
      "issues_opened": 4,
      "issues_assigned": 6,
      "issues_closed": 5,
      "issues_pending": 1,
      "prs_opened": 3,
      "prs_reviewed": 2,
      "prs_merged": 2,
      "commits": 12
    }
  ],
  "labels_distribution": [
    { "label": "documentation", "count": 8 }
  ],
  "labels_by_person": [
    { "username": "usuario", "label": "documentation", "count": 3 }
  ],
  "documentation_contributions": [
    {
      "username": "usuario",
      "issues": 2,
      "pull_requests": 1,
      "commits": 5,
      "total": 8
    }
  ],
  "milestone_progress": [
    {
      "milestone": "Sprint 08",
      "opened": 10,
      "closed": 7,
      "pending": 3
    }
  ],
  "milestone_progress_by_person": [
    {
      "milestone": "Sprint 08",
      "username": "usuario",
      "assigned": 3,
      "closed": 2,
      "pending": 1
    }
  ]
}
```

---

## Critérios gerais de aceite

- O `AGENT.md` continua explicando como criar o dashboard do zero.
- O documento explica o estado atual da implementação.
- Cada funcionalidade possui objetivo, comportamento esperado, critérios de aceite, plano e tarefas.
- Métricas existentes ficam marcadas como implementadas ou parcialmente implementadas.
- Novas métricas por pessoa ficam marcadas como pendentes ou evolução planejada.
- Rankings diretos por pessoa são previstos para facilitar leitura da professora.
- O acesso oficial é via GitHub Pages.
- A identidade visual oficial do projeto está documentada e deve orientar o painel.
- O escopo permanece limitado a métricas, salvo permissão explícita.

---

## Validação antes de finalizar uma alteração de métricas

- Conferir se a alteração respeita este `AGENT.md`.
- Conferir se a branch atual não é `main`.
- Conferir se arquivos fora do escopo permitido não foram alterados.
- Validar o schema do `metrics.json`.
- Validar renderização da página quando houver mudança no HTML.
- Conferir aplicação da paleta oficial quando houver mudança visual.
- Conferir o workflow quando houver mudança em coleta ou automação.
- Registrar no PR quais métricas foram alteradas, adicionadas ou apenas planejadas.
