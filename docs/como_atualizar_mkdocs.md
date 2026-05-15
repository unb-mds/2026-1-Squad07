# Tutorial: Como atualizar a documentação do MkDocs

Este tutorial explica o fluxo correto para atualizar a documentação do projeto usando MkDocs e GitHub Pages.

## Visão geral

O projeto usa duas branches principais relacionadas à documentação:

| Branch | Função |
|---|---|
| `dev` | Guarda os arquivos-fonte da documentação |
| `gh-pages` | Guarda o site já construído pelo MkDocs |

A branch `dev` contém arquivos como:

```text
docs/
mkdocs.yml
.github/
```

A branch `gh-pages` contém o site final publicado, com arquivos como:

```text
index.html
assets/
search/
metricas/
architecture/
```

A pasta `docs/` não aparece na branch `gh-pages`, pois ela é usada apenas como fonte para gerar o site final.

---

## Fluxo correto para atualizar o MkDocs

### 1. Atualize sua branch `dev`

Antes de começar qualquer alteração, vá para a branch `dev` e atualize o repositório local:

```bash
git checkout dev
git pull origin dev
```

---

### 2. Crie uma branch para sua alteração

Crie uma branch nova a partir da `dev`:

```bash
git checkout -b docs/nome-da-alteracao
```

Exemplo:

```bash
git checkout -b docs/adiciona-dashboard-metricas
```

---

### 3. Adicione ou edite arquivos dentro da pasta `docs`

Todos os arquivos da documentação devem ficar dentro da pasta `docs`.

Exemplo de estrutura:

```text
docs/
├── index.md
├── architecture/
└── metricas/
    ├── index.html
    ├── metrics.json
    └── collect_metrics.py
```

O arquivo `docs/index.md` é a página inicial da documentação.

Se for criar uma nova página, crie um arquivo `.md` ou uma pasta dentro de `docs`.

Exemplo:

```text
docs/tutorial-atualizar-mkdocs.md
```

---

### 4. Atualize o `mkdocs.yml` se criar uma nova página

Se a nova página ainda não existir na navegação do site, adicione o caminho no arquivo `mkdocs.yml`.

Exemplo:

```yaml
nav:
  - Início: index.md
  - Tutorial MkDocs: tutorial-atualizar-mkdocs.md
  - Métricas: metricas/index.html
```

Se a página estiver dentro de uma pasta:

```text
docs/guias/deploy.md
```

o caminho no `mkdocs.yml` deve ser:

```yaml
nav:
  - Guias:
      - Deploy: guias/deploy.md
```

Importante: os caminhos no `mkdocs.yml` são relativos à pasta `docs`.

---

### 5. Teste o site localmente

Antes de publicar, teste se a documentação está funcionando.

Para rodar localmente:

```bash
mkdocs serve
```

Depois acesse no navegador:

```text
http://127.0.0.1:8000
```

Também é possível testar apenas o build:

```bash
mkdocs build
```

Esse comando gera uma pasta chamada `site/`.

Se houver erro no `mkdocs.yml`, em links internos ou em arquivos ausentes, o MkDocs mostrará no terminal.

---

### 6. Verifique se os arquivos foram gerados corretamente

Depois de rodar:

```bash
mkdocs build
```

verifique se a pasta `site/` foi criada.

Por exemplo, se existe:

```text
docs/metricas/index.html
```

o MkDocs deve gerar:

```text
site/metricas/index.html
```

Ou seja, a pasta `docs/` desaparece no site final. Isso é esperado.

---

### 7. Publique a documentação no GitHub Pages

Depois que tudo estiver funcionando, rode:

```bash
mkdocs gh-deploy --force
```

Esse comando gera o site e atualiza automaticamente a branch `gh-pages`.

A branch `gh-pages` não deve ser editada manualmente. Ela deve ser tratada apenas como a saída gerada pelo MkDocs.

---

### 8. Salve suas alterações na branch de trabalho

Depois de publicar, faça commit dos arquivos alterados na sua branch.

```bash
git status
git add docs mkdocs.yml
git commit -m "docs: atualiza documentação do MkDocs"
git push origin docs/nome-da-alteracao
```

Exemplo:

```bash
git push origin docs/adiciona-dashboard-metricas
```

---

### 9. Abra um Pull Request para a `dev`

Depois do push, abra um Pull Request da sua branch para a branch `dev`.

O Pull Request deve conter os arquivos-fonte da documentação, como:

```text
docs/
mkdocs.yml
```

Não é necessário abrir Pull Request para a branch `gh-pages`.

---

## Exemplo: adicionando uma nova página

Suponha que queremos adicionar uma página chamada `planejamento.md`.

### Criar o arquivo

```text
docs/planejamento.md
```

Conteúdo exemplo:

```markdown
# Planejamento

Esta página descreve o planejamento do projeto.
```

### Atualizar o `mkdocs.yml`

```yaml
nav:
  - Início: index.md
  - Planejamento: planejamento.md
```

### Testar

```bash
mkdocs serve
```

ou:

```bash
mkdocs build
```

### Publicar

```bash
mkdocs gh-deploy --force
```

### Salvar na branch

```bash
git add docs/planejamento.md mkdocs.yml
git commit -m "docs: adiciona página de planejamento"
git push origin docs/adiciona-planejamento
```

---

## Exemplo: adicionando uma página dentro de uma pasta

Suponha que queremos adicionar:

```text
docs/guias/deploy.md
```

No `mkdocs.yml`, o caminho deve ser:

```yaml
nav:
  - Guias:
      - Deploy: guias/deploy.md
```

Depois, rode:

```bash
mkdocs build
mkdocs gh-deploy --force
```

---

## Como funciona o dashboard de métricas

O dashboard de métricas fica dentro da pasta:

```text
docs/metricas/
```

Estrutura esperada:

```text
docs/metricas/
├── index.html
├── metrics.json
└── collect_metrics.py
```

No site publicado, ele fica acessível em:

```text
/metricas/
```

ou:

```text
/metricas/index.html
```

O arquivo `metrics.json` deve ficar na mesma pasta que o `index.html`, pois o dashboard carrega os dados com caminho relativo.

No `mkdocs.yml`, o dashboard pode ser adicionado assim:

```yaml
nav:
  - Métricas: metricas/index.html
```

---

## O que não fazer

Não edite manualmente a branch `gh-pages`.

Não coloque os arquivos-fonte diretamente na branch `gh-pages`.

Não configure o GitHub Pages para publicar apenas uma subpasta como:

```text
docs/metricas
```

Isso pode fazer o dashboard funcionar isoladamente, mas quebra a documentação principal do MkDocs.

A configuração correta do GitHub Pages deve apontar para:

```text
Branch: gh-pages
Folder: /root
```

---

## Resumo do fluxo

```bash
git checkout dev
git pull origin dev

git checkout -b docs/nome-da-alteracao

# editar arquivos em docs/
# editar mkdocs.yml, se necessário

mkdocs serve
mkdocs build
mkdocs gh-deploy --force

git add docs mkdocs.yml
git commit -m "docs: descreve alteração feita"
git push origin docs/nome-da-alteracao
```

Depois disso, abra um Pull Request para a branch `dev`.

---

## Observação importante

A branch `dev` guarda o conteúdo-fonte da documentação.

A branch `gh-pages` guarda apenas o site gerado.

Portanto, se uma pasta existe em `docs/` na branch `dev`, ela aparecerá na `gh-pages` sem o prefixo `docs`.

Exemplo:

```text
dev/docs/metricas/index.html
```

vira:

```text
gh-pages/metricas/index.html
```

Isso é o comportamento esperado do MkDocs.