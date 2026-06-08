# Comparação de Ferramentas de CI/CD

## 1. Comparação: GitHub Actions vs. GitLab CI vs. Jenkins vs. CircleCI

Ferramentas de CI/CD automatizam o processo de integração e entrega de código. Cada plataforma tem suas características:

* **GitHub Actions:** Integrado nativamente ao GitHub, usa arquivos YAML dentro de `.github/workflows/`. Ideal para projetos que já estão no GitHub, com marketplace de *actions* prontas e fácil configuração.
* **GitLab CI:** Integrado ao GitLab, configurado via `.gitlab-ci.yml`. Oferece um ecossistema completo (repositório, CI/CD, registro de imagens) em uma só plataforma.
* **Jenkins:** Solução *open-source* altamente customizável, com grande ecossistema de plugins. Exige mais configuração e manutenção de infraestrutura própria.
* **CircleCI:** Plataforma em nuvem com foco em velocidade e paralelização. Boa integração com GitHub/Bitbucket, mas é um serviço externo.

Para projetos *open-source* no GitHub, o **GitHub Actions** tende a ser a escolha mais prática por estar no mesmo ambiente do repositório, sem necessidade de serviços externos.

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
strategy:
  - uses: actions/cache@v3
  with:
    path: ~/.npm
    key: $ runner.os -node-$ hashFiles('**/package-lock.json') 
```
O cache é invalidado automaticamente quando o arquivo de lock muda, garantindo builds corretos e mais rápidos.

## 4. Lint Tools (ESLint, Prettier, Black, Flake8)

Ferramentas de lint analisam o código estaticamente para garantir qualidade e padronização antes de qualquer execução.

- **ESLint**: linter para JavaScript/TypeScript. Detecta erros de lógica, padrões ruins e violações de estilo configuráveis via `.eslintrc`.
- **Prettier**: formatador de código automático (JS, TS, CSS, JSON, etc.). Não analisa lógica, apenas impõe um estilo consistente.
- **Black**: formatador opinativo para Python. Reformata o código sem configurações — foco em consistência total.
- **Flake8**: linter para Python que combina PEP8, PyFlakes e McCabe complexity. Detecta erros de estilo e problemas de lógica simples.

No CI, essas ferramentas rodam em modo de verificação (`--check`) e falham o pipeline se o código não estiver padronizado, forçando qualidade antes do merge.

