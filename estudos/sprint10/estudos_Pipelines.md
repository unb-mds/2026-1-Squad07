# Comparação de Ferramentas de CI/CD e pipelines


## 1. Comparação: GitHub Actions vs. GitLab CI vs. Jenkins vs. CircleCI

Ferramentas de CI/CD automatizam o processo de integração e entrega de código. Cada plataforma tem suas características:

* **GitHub Actions:** Integrado nativamente ao GitHub, usa arquivos YAML dentro de `.github/workflows/`. Ideal para projetos que já estão no GitHub, com marketplace de *actions* prontas e fácil configuração.
* **GitLab CI:** Integrado ao GitLab, configurado via `.gitlab-ci.yml`. Oferece um ecossistema completo (repositório, CI/CD, registro de imagens) em uma só plataforma.
* **Jenkins:** Solução *open-source* altamente customizável, com grande ecossistema de plugins. Exige mais configuração e manutenção de infraestrutura própria.
* **CircleCI:** Plataforma em nuvem com foco em velocidade e paralelização. Boa integração com GitHub/Bitbucket, mas é um serviço externo.

Para projetos *open-source* no GitHub, o **GitHub Actions** tende a ser a escolha mais prática por estar no mesmo ambiente do repositório, sem necessidade de serviços externos.

---

## 2. Estrutura de Workflows YAML (events, jobs, steps)

No GitHub Actions, um workflow é definido em um arquivo `.yml` dentro de `.github/workflows/`. Sua estrutura principal é:

```yaml
name: CI Pipeline

on:           # events: quando o workflow dispara
  push:
    branches: [main]
  pull_request:

jobs:         # conjunto de jobs paralelos ou sequenciais
  build:
    runs-on: ubuntu-latest
    steps:    # passos executados em sequência dentro do job
      - uses: actions/checkout@v3
      - name: Instalar dependências
        run: npm install
      - name: Rodar testes
        run: npm test
```
* `on` (events): define os gatilhos — push, pull_request, schedule, workflow_dispatch, etc.

* `jobs`: unidades de trabalho que rodam em paralelo por padrão. Podem ter dependências com `needs`.

* `steps`: sequência de comandos ou actions dentro de um job. Podem usar uses (action reutilizável) ou run (comando shell).

---

## 3. Estratégias de Build (matriz, paralelização, cache)

### Matriz (Matrix)

Permite executar o mesmo job com múltiplas configurações simultaneamente:
```yaml
strategy:
  matrix:
    node-version: [16, 18, 20]
    os: [ubuntu-latest, windows-latest]
```
Isso gera 6 combinações rodando em paralelo, útil para testar compatibilidade.

### Paralelização

Jobs independentes rodam em paralelo automaticamente. Para sequências, usa-se `needs` para definir dependências entre jobs.

### Cache

Evita baixar dependências repetidamente a cada execução:
```yaml
steps:
      - uses: actions/cache@v3
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```
O cache é invalidado automaticamente quando o arquivo de lock muda, garantindo builds corretos e mais rápidos.

## 4. Lint Tools (ESLint, Prettier, Black, Flake8)

Ferramentas de lint analisam o código estaticamente para garantir qualidade e padronização antes de qualquer execução.

- **ESLint**: linter para JavaScript/TypeScript. Detecta erros de lógica, padrões ruins e violações de estilo configuráveis via `.eslintrc`.
- **Prettier**: formatador de código automático (JS, TS, CSS, JSON, etc.). Não analisa lógica, apenas impõe um estilo consistente.
- **Black**: formatador opinativo para Python. Reformata o código sem configurações — foco em consistência total.
- **Flake8**: linter para Python que combina PEP8, PyFlakes e McCabe complexity. Detecta erros de estilo e problemas de lógica simples.

No CI, essas ferramentas rodam em modo de verificação (`--check`) e falham o pipeline se o código não estiver padronizado, forçando qualidade antes do merge.

---

## 5. Estratégias de Teste (unit, integration, e2e, coverage)

Seguindo a **Pirâmide de Testes** de Martin Fowler:

- **Testes Unitários (unit)**: testam funções/componentes isolados, sem dependências externas. São rápidos, baratos e devem ser a maioria.
- **Testes de Integração (integration)**: testam a interação entre módulos ou com serviços externos (banco de dados, APIs). Mais lentos, mas validam contratos entre partes do sistema.
- **Testes E2E (end-to-end)**: simulam o comportamento real do usuário na aplicação completa. São os mais lentos e frágeis — devem ser usados com moderação para fluxos críticos.
- **Coverage (cobertura)**: métrica que indica qual percentual do código é coberto por testes. Ferramentas como Codecov integram com o GitHub para exibir relatórios diretamente nos PRs.

No CI, o ideal é rodar testes unitários a cada push e testes de integração/e2e em PRs para branches principais.

---

## 6. Variáveis de Ambiente e Secrets no GitHub Actions

Informações sensíveis (tokens, senhas, chaves de API) nunca devem ser escritas diretamente no código ou nos arquivos YAML. O GitHub oferece dois mecanismos:

- **Secrets**: valores criptografados configurados em `Settings > Secrets and variables > Actions`. Acessados via `$ secrets.NOME_DO_SECRET` .
- **Variables**: valores não sensíveis reutilizáveis entre workflows. Acessados via `$ vars.NOME_DA_VARIAVEL` .

Exemplo de uso:

```yaml
- name: Deploy
  env:
    API_TOKEN: ${{ secrets.API_TOKEN }}
    ENV: production
  run: ./deploy.sh
```
---

## 7. Docker Build e Push para Registry

Uma etapa comum em pipelines de CD é construir uma imagem Docker e publicá-la em um registry para ser usada no deploy.

Fluxo típico com GitHub Actions:
```yaml
- name: Login no GitHub Container Registry
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }} 
    password: ${{secrets.GITHUB_TOKEN}}

- name: Build e Push da imagem
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: ghcr.io/${{ github.repository }}:latest
```
Os principais registries são: Docker Hub, GitHub Container Registry (GHCR), AWS ECR e Google Artifact Registry. O GITHUB_TOKEN já é disponibilizado automaticamente pelo Actions, sem necessidade de criar secrets adicionais para o GHCR.

---

## 8. Deploy Strategies (rolling, blue-green, canary)

Diferentes estratégias de deploy minimizam riscos e tempo de indisponibilidade:

- **Rolling Update**: substitui instâncias antigas pela nova versão gradualmente. Simples, mas durante a transição podem existir duas versões rodando simultaneamente.
- **Blue-Green**: mantém dois ambientes idênticos (blue = atual, green = nova versão). O tráfego é redirecionado para o green após validação. Rollback instantâneo, mas exige o dobro de infraestrutura.
- **Canary Release**: envia uma pequena porcentagem do tráfego real para a nova versão (ex: 5%), monitora métricas e expande gradualmente. Reduz o impacto de bugs em produção, mas exige infraestrutura de roteamento de tráfego.

A escolha depende do nível de risco aceitável, custo de infraestrutura e capacidade de monitoramento do time.

---

## 9. Monitoramento de Pipelines e Alertas

Um pipeline de CI/CD sem monitoramento é um pipeline cego. Boas práticas incluem:

- **Status checks**: GitHub Actions exibe o status de cada workflow diretamente nos PRs, bloqueando merges se houver falha.

- **Notificações**: configure alertas por e-mail, Slack ou outros canais para falhas em branches principais.

- **Observabilidade de pipelines**: ferramentas como Datadog, Grafana e o próprio painel do GitHub Actions permitem visualizar tempo de execução, taxa de falha e gargalos.

- **Métricas importantes**: Tempo Médio de Recuperação (MTTR — Mean Time to Repair/Resolution), frequência de falhas por step, e lead time do código até a produção.

Monitorar o pipeline é tão importante quanto monitorar a aplicação em produção — pipelines lentos ou instáveis impactam diretamente a produtividade do time.

---

###  Referências

### Comparação: GitHub Actions vs GitLab CI vs Jenkins vs CircleCI

- [CI/CD Tools Comparison – Atlassian](https://www.atlassian.com/continuous-delivery/principles/continuous-integration-vs-delivery-vs-deployment)
- [CI/CD Pipeline Comparison – Fireship (YouTube)](https://www.youtube.com/watch?v=scEDHsr3APg)
---

### Estrutura de Workflows YAML (events, jobs, steps)

- [Documentação oficial – GitHub Actions](https://docs.github.com/pt/actions/reference/workflows-and-actions/workflow-syntax)
- [GitHub Actions Tutorial – TechWorld with Nana (YouTube)](https://www.youtube.com/watch?v=R8_veQiYBjI)

---
### Estratégias de Build (matriz, paralelização, cache)

- [Matrix Strategy – Docs oficiais](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/run-job-variations)
- [Caching dependencies – Docs oficiais](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching)
- [Paralelização e cache no GitHub Actions – DevOps Toolkit (YouTube)](https://www.youtube.com/watch?v=eZcAvTb0rbA)

---
### Lint Tools (ESLint, Prettier, Black, Flake8)

- [Black & Flake8 no CI – Real Python](https://realpython.com/python-code-quality/)

---
### Estratégias de Teste (unit, integration, e2e, coverage)

- [Testing strategies in CI – Martin Fowler](https://martinfowler.com/articles/practical-test-pyramid.html)
- [Unit vs Integration vs E2E – Fireship (YouTube)](https://www.youtube.com/watch?v=r9HdJ8P6GQI)

---
### Variáveis de Ambiente e Secrets no GitHub Actions

- [Using secrets – Docs oficiais](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets)
- [Secrets & Environment Variables – GitHub Actions (YouTube – Traversy Media)](https://www.youtube.com/watch?v=eB0nUzAI7M8)

---
### Docker Build e Push para Registry

- [Docker + GitHub Actions – Docs Docker](https://docs.docker.com/build/ci/github-actions/)
- [Publicar no GitHub Container Registry – Docs GitHub](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

---
### Deploy Strategies (rolling, blue-green, canary)

- [Blue-Green & Canary Deployments Explained – TechWorld with Nana (YouTube)](https://www.youtube.com/watch?v=AWVTKBUnoIg)
- [Kubernetes Deploy Strategies – Kubernetes Docs](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#strategy)

---
### Monitoramento de Pipelines e Alertas

- [GitHub Actions Status Checks & Notificações – Docs GitHub](https://docs.github.com/en/actions/how-tos/monitor-workflows) 