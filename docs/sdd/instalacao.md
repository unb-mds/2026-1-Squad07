# Instalação do Spec Kit

## Objetivo

Esta página explica como preparar o ambiente local para usar o **GitHub Spec Kit** no fluxo de **Spec Driven Development (SDD)** e **Test Driven Development (TDD)** do Squad 07.

O objetivo é permitir que integrantes do grupo e agentes de IA consigam criar, revisar e manter specs com o mesmo padrão usado no **CrivoAI**.

## O Spec Kit é obrigatório?

Não. A instalação do Spec Kit CLI não é obrigatória para entender ou contribuir com o projeto.

A estrutura principal do SDD está versionada no repositório:

- `AGENTS.md`;
- `docs/AGENTS.md`;
- `specs/AGENTS.md`;
- `.specify/templates/`;
- `.specify/memory/constitution.md`;
- `.agents/skills/`;
- `specs/`.

Esses arquivos já permitem que pessoas e agentes de IA entendam o fluxo, leiam specs existentes, sigam critérios de qualidade e criem novas specs manualmente.

Mesmo assim, a instalação do Spec Kit CLI é recomendada para quem vai criar ou manter specs com frequência, porque ele facilita o uso dos comandos auxiliares, mantém o formato mais padronizado e aproxima o projeto do fluxo oficial do Spec Kit.

## Quando instalar

Instale o Spec Kit quando você precisar:

- criar novas specs com frequência;
- usar scripts auxiliares do Spec Kit;
- validar ou atualizar templates;
- trabalhar diretamente no fluxo `spec -> plan -> test-plan -> tasks`;
- apoiar agentes de IA que utilizem comandos do Spec Kit;
- manter a estrutura SDD/TDD do projeto.

Se você for apenas ler a documentação, revisar PRs ou consultar uma spec já existente, a instalação não é necessária.

## Pré-requisitos

Antes de instalar, confirme que sua máquina possui:

- Git;
- Python 3.11 ou superior;
- acesso ao terminal;
- acesso ao repositório local do projeto.

Também é recomendado ter o MkDocs disponível para testar a documentação localmente com:

```powershell
mkdocs serve
```

## Instalar o uv

O `uv` é usado para instalar e executar ferramentas Python de forma isolada.

No PowerShell, execute:

```powershell
irm https://astral.sh/uv/install.ps1 | iex
```

Depois feche e abra o terminal novamente, ou garanta que o diretório do `uv` esteja no `PATH`.

Valide a instalação:

```powershell
uv --version
```

## Instalar o Spec Kit CLI

Use o `uv` para instalar o CLI do Spec Kit a partir do repositório oficial:

```powershell
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
```

Valide a instalação:

```powershell
specify --version
```

Caso o comando `specify` não esteja disponível no terminal, use o `uvx`:

```powershell
uvx --from git+https://github.com/github/spec-kit.git specify --version
```

## Validar integração do projeto

Dentro da raiz do repositório, execute:

```powershell
specify integration list
```

Ou, usando `uvx`:

```powershell
uvx --from git+https://github.com/github/spec-kit.git specify integration list
```

O projeto foi configurado inicialmente com integração Codex, mas as instruções versionadas devem continuar úteis para qualquer agente de IA que atue como auxiliar do time.

## Como usar no Squad 07

Antes de criar ou alterar uma spec:

1. Leia a issue relacionada no GitHub.
2. Leia o `AGENTS.md` da raiz.
3. Leia `specs/AGENTS.md`.
4. Verifique se já existe uma spec relacionada em `specs/`.
5. Use uma branch fora da `main` compatível com os scripts do Spec Kit.
6. Crie ou atualize a spec seguindo a ordem:
   - `spec.md`;
   - `plan.md`;
   - `test-plan.md`;
   - `tasks.md`;
   - `quickstart.md`.
7. Só avance para implementação quando a spec estiver clara e sem ambiguidades centrais.

## Padrões de branch para specs

Para usar os scripts PowerShell do Spec Kit, a branch deve seguir um dos padrões abaixo:

- padrão numerado do Spec Kit, como `001-submissao-texto-legislativo`;
- padrão timestamp do Spec Kit, como `20260319-143022-feature-name`;
- padrão do Squad 07 com issue, como `docs/issue-86-sdd-documentacao` ou `codex/issue-72-metricas-dashboard`.

No padrão com issue, os scripts buscam em `specs/` uma spec cujo `spec.md` contenha a referência `Issue: #N`. Por exemplo, a branch `docs/issue-86-sdd-documentacao` será associada à spec que declarar `Issue: #86`.

Branches comuns fora da `main` continuam válidas para o trabalho normal do projeto. A exigência acima vale para quem pretende usar os scripts do Spec Kit.

## O que deve ser versionado

Devem ir para o repositório:

- specs criadas em `specs/`;
- templates adaptados em `.specify/templates/`;
- constituição em `.specify/memory/constitution.md`;
- instruções em `AGENTS.md`;
- skills do projeto em `.agents/skills/`;
- documentação pública em `docs/`;
- alterações de navegação no `mkdocs.yml`.

## O que não deve ser versionado

Não devem ir para o repositório:

- instalação local do `uv`;
- instalação local do `specify`;
- cache do `uv`;
- cache do Python;
- `.venv/`;
- `node_modules/`;
- `site/` gerado pelo MkDocs;
- logs do `mkdocs serve`;
- arquivos pessoais de IDE;
- arquivos em `AppData`, `Downloads` ou outras pastas locais do usuário.

## Validação da documentação

Sempre que uma alteração afetar documentação pública, rode:

```powershell
mkdocs serve
```

Depois acesse a documentação local no navegador e confira:

- se a página aparece na navegação correta;
- se o texto está legível;
- se links, imagens e embeds possuem contexto;
- se não há sobreposição visual;
- se a página explica objetivo, contexto e critérios de validação.

## Resumo

O Spec Kit CLI é uma ferramenta recomendada, não uma dependência obrigatória para leitura ou revisão do projeto. O que torna o SDD do Squad 07 consistente é a estrutura versionada no repositório: specs, templates, AGENTS, skills e documentação.
