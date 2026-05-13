# Spec — Dashboard de Produtividade

Status: spec

---

## Projeto

Squad7 - A ideia central do projeto é desenvolver uma plataforma de monitoramento da qualidade de leis e proposições legislativas, permitindo que usuários submetam textos legislativos para análise técnica via IA

---

## Constituição (princípios relevantes)

### Automação e Baixa Manutenção

1. O dashboard deve ser atualizado automaticamente sem intervenção humana.
2. Não dependa de serviços pagos ou credenciais externas além do GITHUB_TOKEN padrão.
3. Os dados devem ser reproduzíveis — qualquer pessoa pode re-gerar o JSON executando o workflow manualmente.

### Transparência

4. Todas as métricas devem ser derivadas exclusivamente de dados públicos do repositório (commits, issues, PRs).
5. Não exiba métricas que possam ser manipuladas trivialmente para "gamificar" o ranking.

### Simplicidade

6. A página deve ser um único index.html estático com zero dependências de back-end.
7. Prefira bibliotecas leves via CDN; não introduza build steps (webpack, vite, etc.) para esta página.

---

## Convenções técnicas

- Página: HTML5 estático (`docs/metricas/index.html`)
- Estilização: CSS inline ou <style> embutido; pode usar TailwindCSS via CDN.
- Gráficos: D3.js v7 via CDN (flexível, sem build).
- Paleta de cores (UnB institucional):
  - Azul escuro: #003366 — header, séries "Abertas", barras empilhadas abertas.
  - Verde: #005C37 — séries "Fechadas", barras empilhadas fechadas.
  - Azul médio: #004A8C — histograma de commits.
  - Dourado: #BFA630 — barras de co-autores.
- Dados: arquivo docs/metricas/metrics.json gerado pelo GitHub Action.
- CI: GitHub Actions workflow (`.github/workflows/metrics.yml`), roda semanalmente (cron) e sob dispatch manual.
- Linguagem do script coletor: Python 3.11+ (já presente no projeto).
- Dependências do script: PyGithub (acesso à API do GitHub).
- Deploy da página: GitHub Pages servindo a pasta docs/metricas/.

---

## Como me ajudar

- Implemente uma tarefa por vez, na ordem descrita.
- O script Python deve ser idempotente — sempre gera o JSON completo do zero.
- Não altere nenhum arquivo fora de docs/metricas/ e .github/workflows/metrics.yml sem permissão.
- Mantenha o HTML legível; não minimize.

---

## Fora de escopo padrão

- Não adicione autenticação ou back-end.
- Não altere o pipeline de CI/linter existente.
- Não mude a estrutura do projeto principal.
- Não colete métricas de repositórios externos.

---

## Funcionalidade: Dashboard de Produtividade

### Spec

Contexto: A equipe (Squad 07) e a professora da disciplina MDS/UnB precisam visualizar a produtividade do projeto ao longo do tempo. A página é acessada via GitHub Pages e mostra gráficos e rankings atualizados semanalmente de forma automática.

Comportamento observável (ponto de vista do usuário):

O usuário acessa a URL do GitHub Pages e vê uma página responsiva contendo:

1. Gráfico de linhas — Issues abertas vs. fechadas por semana
   - Eixo X: semanas (formato `YYYY-WXX`).
   - Eixo Y: quantidade.
   - Duas séries: "Abertas" e "Fechadas".

2. Histograma — Quantidade de caracteres na mensagem de commit
   - Eixo X: faixas de caracteres (0–20, 21–50, 51–100, 101–200, 200+).
   - Eixo Y: número de commits naquela faixa.

3. Gráfico de barras — Quantidade de co-autores por semana
   - Eixo X: semanas.
   - Eixo Y: total de linhas Co-authored-by encontradas nos commits daquela semana.

4. Mapa de calor — Horário dos commits por dia da semana
   - Eixo X: horas do dia (0h–23h).
   - Eixo Y: dias da semana (Seg–Dom).
   - Cor: gradiente de #e8f4f8 (zero commits) a #003366 (máximo).
   - Tooltip mostra dia, hora e quantidade de commits.

5. Gráfico de barras empilhadas — Issues abertas/fechadas por semana
   - Mesmo dado do item 1, mas em formato de barras empilhadas para visualização alternativa.

6. Ranking — Top committers
   - Tabela ordenada por número de commits (desc).
   - Colunas: posição, nome/username, total de commits.
7. Ranking — Top autores de PRs
   - Tabela ordenada por número de PRs abertas (desc).
   - Colunas: posição, nome/username, total de PRs abertas.

8. Ranking — Top em Issues (abertas + fechadas)
   - Tabela ordenada pela soma de issues abertas + issues fechadas pelo usuário (desc).
   - Colunas: posição, nome/username, issues abertas, issues fechadas, total.

Critérios de aceitação:

1. O arquivo docs/metricas/index.html abre corretamente no navegador sem servidor local (protocolo file:// ou via GitHub Pages).
2. O arquivo docs/metricas/metrics.json é gerado pelo workflow e contém todas as seções: issues_per_week, commit_message_histogram, coauthors_per_week, commit_heatmap, top_committers, top_pr_authors, top_issue_contributors.
3. O workflow .github/workflows/metrics.yml executa com sucesso no GitHub Actions usando apenas GITHUB_TOKEN.
4. O workflow roda automaticamente todo domingo às 03:00 UTC e pode ser disparado manualmente via workflow_dispatch.
5. Após a execução, o workflow faz commit do metrics.json atualizado no branch dev.
6. Os gráficos renderizam corretamente com os dados do JSON (sem erros no console).
7. A página é responsiva (funciona em mobile e desktop).
8. O ranking exibe pelo menos os 10 primeiros ou todos os contribuidores (o que for menor).

Casos de borda:

- Semana sem atividade: a semana aparece no eixo X com valor 0; não é omitida.
- Commit sem mensagem (squash vazio): conta como 0 caracteres na faixa 0–20.
- Usuário deletado (ghost): aparece como ghost nos rankings.
- Co-authored-by com formato inválido: é ignorado silenciosamente.
- Repositório com < 1 semana de histórico: exibe os dados disponíveis sem erro.

Fora de escopo desta spec:

- Métricas de code review (comments em PRs).
- Métricas de CI (tempo de build, falhas).
- Filtro interativo por período.
- Autenticação ou área restrita.
- Armazenamento histórico (o JSON é sempre reescrito por completo).

---

### Plano

Referência: spec acima. Constituição relevante: princípios 1, 2, 3, 6, 7.

Decisões técnicas:

- Coleta de dados:
  - Escolha: Script Python usando PyGithub para acessar a API REST do GitHub.
  - Alternativas consideradas: GitHub GraphQL API; gh CLI direto no workflow.
  - Rationale: PyGithub é bem documentada, suporta paginação automática e o projeto já usa Python. A GraphQL seria mais eficiente mas adiciona complexidade de queries. O gh CLI limitaria a lógica a shell scripts.

- Visualização:
  - Escolha: D3.js v7 via CDN + tabelas HTML puras com estilo Tailwind CDN.
  - Alternativas consideradas: Chart.js; Mermaid; imagens estáticas geradas por matplotlib.
  - Rationale: D3.js oferece controle total sobre SVG, permite customização avançada dos gráficos e escalas bem para visualizações futuras. Chart.js é mais simples mas menos flexível. Imagens estáticas perdem interatividade.

- Persistência dos dados:
  - Escolha: Arquivo JSON único commitado no branch dev pelo próprio workflow.
  - Alternativas consideradas: GitHub Pages artifact; branch separado gh-pages.
  - Rationale: JSON no branch de integração mantém histórico via git, é simples de debugar, respeita o fluxo de Pull Requests antes da main, e GitHub Pages pode servir de qualquer pasta configurada.

- Agendamento:
  - Escolha: cron: '0 3 * * 0' (domingo 03:00 UTC) + workflow_dispatch.
  - Rationale: Frequência semanal alinha com as sprints da disciplina; horário de madrugada evita conflitos com trabalho ativo.

Tradeoffs aceitos:

1. O JSON é reescrito do zero a cada execução — não há dados incrementais. Aceitável porque o repositório é pequeno e a API suporta o volume.
2. D3.js via CDN exige internet para visualizar — aceitável porque o público-alvo acessa via GitHub Pages (já online).
3. O commit automático pode gerar ruído no histórico — mitigado com mensagem padronizada [bot] atualiza métricas de produtividade.

Dependências:
- PyGithub (script coletor)
- D3.js v7 (CDN, front-end)
- TailwindCSS (CDN, estilização)
- actions/checkout@v4 (workflow)
- actions/setup-python@v5 (workflow)

---

### Tarefas

1. Criar script coletor (`docs/metricas/collect_metrics.py`)
   - Depende de: —
   - Pronto quando:
     - O script aceita variáveis de ambiente GITHUB_TOKEN e GITHUB_REPOSITORY.
     - Gera docs/metricas/metrics.json com schema correto.
     - Roda localmente com python collect_metrics.py (dado token válido).
   - Fora de escopo: renderização HTML, workflow.

2. Criar workflow (`.github/workflows/metrics.yml`)
   - Depende de: Tarefa 1.
   - Pronto quando:
     - Instala dependências, executa o script, e commita o JSON atualizado.
     - Roda no cron semanal e via dispatch manual.
     - Usa apenas GITHUB_TOKEN (permissões `contents: write`).
   - Fora de escopo: a página HTML.

3. Criar página HTML (`docs/metricas/index.html`)
   - Depende de: Tarefa 1 (precisa do schema do JSON para bindar os gráficos).
   - Pronto quando:
     - Carrega metrics.json via fetch relativo.
     - Renderiza todos os 7 componentes visuais descritos na spec.
     - Responsivo (mobile-first com Tailwind).
     - Sem erros no console do navegador.
   - Fora de escopo: coleta de dados, CI.

4. Configurar GitHub Pages
   - Depende de: Tarefas 2 e 3.
   - Pronto quando:
     - A página é acessível via URL pública do GitHub Pages.
     - O JSON é servido corretamente (sem CORS issues em mesmo domínio).
   - Fora de escopo: DNS customizado.

---

### Schema do metrics.json

JSON



{
  "generated_at": "2025-05-11T03:00:00Z",
  "repository": "unb-mds/2026.1-ContraDito",
  "issues_per_week": [
    { "week": "2025-W01", "opened": 5, "closed": 3 }
  ],
  "commit_message_histogram": [
    { "range": "0-20", "count": 12 },
    { "range": "21-50", "count": 30 },
    { "range": "51-100", "count": 45 },
    { "range": "101-200", "count": 20 },
    { "range": "200+", "count": 5 }
  ],
  "coauthors_per_week": [
    { "week": "2025-W01", "count": 4 }
  ],
  "commit_heatmap": [
    { "day": 0, "hour": 10, "count": 8 },
    { "day": 6, "hour": 22, "count": 2 }
  ],
  "top_committers": [
    { "username": "fulano", "name": "Fulano Silva", "commits": 42 }
  ],
  "top_pr_authors": [
    { "username": "fulano", "name": "Fulano Silva", "prs_opened": 15 }
  ],
  "top_issue_contributors": [
    { "username": "fulano", "name": "Fulano Silva", "opened": 10, "closed": 8, "total": 18 }
  ]
}


---
