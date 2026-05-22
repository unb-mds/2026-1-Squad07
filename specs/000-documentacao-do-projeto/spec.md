# Feature Specification: Documentação do Projeto

**Branch**: `docs/issue-86-sdd-documentacao`
**Criado em**: 2026-05-21
**Status**: Draft
**Issue**: #86

## Objetivo

Definir o padrão de documentação do projeto **Monitoramento de Qualidade de Leis**, garantindo que o MkDocs, as specs SDD/TDD, os AGENTS e os artefatos de planejamento sejam claros, rastreáveis e úteis para a equipe, professora, PO e avaliadores externos.

## Contexto

A documentação atual já possui requisitos, arquitetura e métricas, mas ainda precisa de um padrão comum para evitar páginas soltas, embeds sem explicação, inconsistência entre R1/R2 e falta de validação antes de PR. A issue #86 cria essa base para orientar a R1 e preparar a R2 com SDD e TDD.

## Público-Alvo

- Professora e avaliadores da disciplina.
- Scrum Master, PO e devs do Squad 07.
- Agentes de IA que auxiliam documentação, specs e implementação, sem dependência exclusiva de uma ferramenta específica.
- Pessoas que entram no projeto e precisam entender escopo, arquitetura e processo.

## Escopo

### Incluído

- Padrão de qualidade para páginas do MkDocs.
- Padrão para specs SDD/TDD.
- Critérios de validação documental.
- Regras para contexto, rastreabilidade e separação R1/R2.
- Orientação para AGENTS e skills locais.

### Fora de Escopo

- Implementar funcionalidades de frontend ou backend.
- Alterar banco de dados, Docker ou workflows.
- Criar todas as specs funcionais da R2 nesta etapa.
- Resolver conteúdo pendente de páginas que pertencem a outras issues.

## R1 Demonstrável

Para a R1, a documentação deve permitir apresentar o problema, a solução, requisitos, escopo, arquitetura, protótipo, métricas, fluxo mínimo e próximos passos sem depender de explicações improvisadas. Páginas de R1 podem descrever protótipos e fluxos demonstrativos, desde que deixem claro o que está implementado, mockado ou planejado.

## R2 Completa

Para a R2, toda funcionalidade relevante deve nascer de uma spec SDD/TDD, com comportamento esperado, plano técnico, plano de testes e tarefas rastreáveis. A documentação deve evoluir junto com código e decisões técnicas.

## Cenários e Testes

### Cenário 1 - Avaliador entende o projeto (Prioridade: P1)

**Como** avaliador, **quero** navegar pela documentação e entender objetivo, escopo, requisitos e arquitetura, **para** avaliar a R1 sem depender apenas da apresentação oral.

**Por que esta prioridade**: A documentação é critério de avaliação da disciplina e sustentação da entrega.

**Teste independente**: Abrir o MkDocs e validar se uma pessoa externa entende o projeto, o que entra na R1 e o que fica para R2.

**Critérios de aceite**:

1. **Dado** o MkDocs publicado ou local, **quando** o avaliador acessa a documentação, **então** encontra visão geral, requisitos, arquitetura, métricas e SDD/TDD na navegação.
2. **Dado** uma página com imagem, iframe ou embed, **quando** ela é lida sem abrir o link externo, **então** ainda existe contexto textual suficiente.

### Cenário 2 - Dev abre uma nova feature com SDD/TDD (Prioridade: P1)

**Como** dev, **quero** usar templates de spec, plano, testes e tarefas, **para** implementar features com menos ambiguidade.

**Por que esta prioridade**: A R2 terá foco em implementação e precisa de specs testáveis antes do código.

**Teste independente**: Usar a spec de documentação como exemplo e verificar se os templates indicam o que preencher antes de implementar.

**Critérios de aceite**:

1. **Dado** uma nova issue de implementação, **quando** o dev consulta `specs/AGENTS.md`, **então** entende a ordem `spec.md -> plan.md -> test-plan.md -> tasks.md`.
2. **Dado** uma spec sem `test-plan.md`, **quando** ela é revisada, **então** ela não pode ser considerada pronta para implementação.

### Cenário 3 - PO revisa rastreabilidade (Prioridade: P2)

**Como** PO, **quero** ver relação entre documentação, issues, requisitos e releases, **para** validar se o escopo está coerente.

**Por que esta prioridade**: A documentação deve apoiar priorização e evitar retrabalho.

**Teste independente**: Escolher uma página relevante e verificar se ela aponta sua origem ou relação com artefatos do projeto.

**Critérios de aceite**:

1. **Dado** uma página de requisito, escopo ou spec, **quando** o PO revisa o conteúdo, **então** encontra relação com issues, R1/R2 ou artefatos de planejamento.

## Requisitos

- **REQ-001**: Toda página relevante DEVE ter objetivo claro.
- **REQ-002**: Toda página relevante DEVE possuir contexto do projeto.
- **REQ-003**: A documentação DEVE diferenciar implementado, prototipado, mockado, planejado e fora de escopo.
- **REQ-004**: Embeds, imagens e links externos DEVEM possuir explicação textual própria.
- **REQ-005**: Specs DEVEM possuir `test-plan.md` antes de serem consideradas prontas.
- **REQ-006**: O MkDocs DEVE possuir seção pública sobre SDD/TDD.
- **REQ-007**: AGENTS DEVEM orientar agentes de IA sobre documentação e specs.
- **REQ-008**: Textos documentais DEVEM usar PT-BR com acentuação correta.
- **REQ-009**: A documentação DEVE deixar claro que o Codex é integração inicial, enquanto o processo deve ser compreensível para qualquer agente de IA auxiliar.

## Entidades ou Conceitos

- **Página documental**: arquivo em `docs/` publicado ou planejado para MkDocs.
- **Spec**: conjunto de artefatos em `specs/` que descreve comportamento antes da implementação.
- **TDD documental**: checklist de validação usado antes de aprovar documentação.
- **Release**: marco de entrega, como R1 e R2.
- **Artefato externo**: Figma, Miro, FigJam, GitHub Project, imagem, iframe ou link usado como referência.

## Critérios de Sucesso

- **SC-001**: A seção `SDD e TDD` aparece no MkDocs.
- **SC-002**: A spec `000-documentacao-do-projeto` possui spec, plano, plano de testes, tarefas, quickstart, contrato e modelo de dados.
- **SC-003**: `AGENTS.md`, `docs/AGENTS.md` e `specs/AGENTS.md` existem.
- **SC-004**: As skills locais de SDD/TDD e revisão documental existem.
- **SC-005**: Um integrante consegue usar o quickstart para revisar uma página antes de PR.
- **SC-006**: A seção SDD/TDD explica como Scrum, SDD, TDD, XP e agentes de IA se conectam no fluxo do projeto.

## Assumptions

- A issue #86 é documental e de processo nesta etapa.
- As specs funcionais serão criadas depois, usando este padrão.
- O Spec Kit CLI foi usado para inicializar a estrutura base.
- Não haverá alteração em frontend, backend, banco ou CI/CD nesta etapa.

## Referências

- Issue #86.
- `docs/requisitos/requisitos_funcionais.md`.
- `docs/architecture/index.md`.
- `docs/metricas/AGENT.md`.
- GitHub Spec Kit.
- AGENTS.md.
- Material de skills indicado pela professora.
