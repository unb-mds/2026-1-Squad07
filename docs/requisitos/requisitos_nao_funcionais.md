# Requisitos Não Funcionais

## Objetivo

Este documento registra os requisitos não funcionais da Release 1 do projeto Monitoramento de Qualidade de Leis. Eles definem restrições, qualidades esperadas e critérios mínimos para que o produto seja demonstrável, sustentável e coerente com a arquitetura definida pelo time.

## RNF01 - Interface responsiva

**Categoria:** Usabilidade.

**Descrição:** A interface deve funcionar em telas desktop e em resoluções menores, mantendo legibilidade e organização visual.

**Critério de validação:**

- As telas principais da R1 devem ser utilizáveis em desktop.
- A interface não deve apresentar sobreposição de textos ou componentes.
- O layout deve seguir o protótipo de alta fidelidade quando aplicável.

**Issues relacionadas:** `#65`, `#75`, `#76`.

## RNF02 - API organizada e testável

**Categoria:** Manutenibilidade.

**Descrição:** O backend deve manter rotas organizadas por responsabilidade e permitir validação local do fluxo principal.

**Critério de validação:**

- As rotas da R1 devem estar separadas em módulos coerentes.
- A rota `/health` deve continuar funcionando.
- O endpoint de submissão deve ser testável localmente.

**Issues relacionadas:** `#40`.

## RNF03 - Persistência estruturada

**Categoria:** Dados.

**Descrição:** Os dados de submissões legislativas devem ser modelados de forma estruturada, permitindo consulta posterior.

**Critério de validação:**

- O schema deve conter entidade para submissões, leis ou proposições legislativas.
- A conexão com o banco deve usar variável de ambiente.
- A modelagem deve estar alinhada ao Prisma e ao PostgreSQL definidos no projeto.

**Issues relacionadas:** `#29`, `#40`, `#76`.

## RNF04 - Separação entre frontend, backend e banco

**Categoria:** Arquitetura.

**Descrição:** O projeto deve preservar a separação de responsabilidades entre interface, API e persistência.

**Critério de validação:**

- O frontend deve consumir a API sem acessar diretamente o banco.
- O backend deve concentrar validação, persistência e regras de negócio.
- O banco deve ser acessado por meio da camada definida no backend.

**Issues relacionadas:** `#29`, `#40`, `#75`, `#76`.

## RNF05 - Configuração por variáveis de ambiente

**Categoria:** Segurança e configuração.

**Descrição:** Configurações sensíveis ou dependentes de ambiente devem ser controladas por variáveis de ambiente.

**Critério de validação:**

- A URL do banco deve ser configurada via `DATABASE_URL`.
- Credenciais não devem ser hardcoded no código-fonte.
- Arquivos de exemplo podem documentar variáveis necessárias, sem expor segredos reais.

**Issues relacionadas:** `#29`.

## RNF06 - Documentação navegável

**Categoria:** Documentação.

**Descrição:** A documentação da R1 deve ser organizada para publicação no portal do projeto.

**Critério de validação:**

- Os documentos devem estar em `docs/`.
- O conteúdo deve estar em português brasileiro com acentuação adequada.
- A integração com o MkDocs/GitHub Pages deve ser tratada na issue específica de correção da documentação.

**Issues relacionadas:** `#57`, `#68`, `#72`.

## RNF07 - Fluxo versionado por Pull Requests

**Categoria:** Processo.

**Descrição:** Toda alteração destinada à integração deve passar por branch própria e Pull Request.

**Critério de validação:**

- Nenhuma alteração deve ser feita diretamente na `main`.
- As integrações devem ocorrer por Pull Requests.
- As mensagens de commit devem seguir Conventional Commits quando possível.

**Issues relacionadas:** `#61`, `#77`.

## RNF08 - Execução local mínima

**Categoria:** Operação.

**Descrição:** O projeto deve permitir que o time execute e valide o fluxo mínimo da R1 em ambiente local.

**Critério de validação:**

- O backend deve possuir instrução ou comando de execução local.
- O frontend deve possuir script de desenvolvimento.
- O banco deve ser executável via Docker Compose ou instrução equivalente.

**Issues relacionadas:** `#29`, `#40`, `#75`, `#76`.

## RNF09 - Escopo controlado para a R1

**Categoria:** Gestão de produto.

**Descrição:** A Release 1 deve priorizar o fluxo mínimo demonstrável, evitando dependências externas ou funcionalidades que aumentem risco de entrega.

**Critério de validação:**

- O documento de requisitos deve separar R1 e R2.
- Funcionalidades de autenticação, IA externa e análise avançada devem ficar fora do caminho crítico da R1.
- O PO e o Scrum Master devem validar qualquer mudança de escopo.

**Issues relacionadas:** `#57`, `#68`, `#77`.

## RNF10 - Métricas de acompanhamento do projeto

**Categoria:** Processo e transparência.

**Descrição:** O projeto deve possuir uma forma de acompanhar produtividade e andamento do time por dados públicos do repositório.

**Critério de validação:**

- O dashboard de métricas deve ser gerado sem credenciais externas além do `GITHUB_TOKEN`.
- Os dados devem ser reproduzíveis.
- A página de métricas deve carregar dados do arquivo `metrics.json`.

**Issues relacionadas:** `#72`.
