# CrivoAI — Monitoramento de Qualidade de Leis

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=unb-mds_2026-1-Squad07&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=unb-mds_2026-1-Squad07)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=unb-mds_2026-1-Squad07&metric=coverage)](https://sonarcloud.io/summary/new_code?id=unb-mds_2026-1-Squad07)

Plataforma para avaliação técnica, legibilidade e consistência de proposições legislativas através de inteligência artificial.

---

## 1. Visão Geral

O CrivoAI é uma plataforma web projetada para apoiar a avaliação técnica de proposições legislativas. Textos legais costumam ser densos, extensos e de difícil interpretação, gerando ambiguidades e inconsistências com legislações já consolidadas.

A solução resolve esse cenário por meio de uma plataforma centralizada de submissão e análise automatizada de textos, permitindo:

* **Avaliação Textual e Legibilidade:** Identificação de frases longas, baixa clareza e termos ambíguos.
* **Score de Qualidade Legislativa:** Geração de um indicador métrico preciso que quantifica o nível de maturidade técnica do documento normativo analisado.

Este projeto faz parte da disciplina de Métodos de Desenvolvimento de Software (MDS) da Universidade de Brasília (UnB), campus FGA.

---

## 2. Links Importantes

* **Documentação Oficial (MkDocs):** [Acessar Documentação](https://unb-mds.github.io/2026-1-Squad07/)
* **Protótipo de Alta Fidelidade (Figma):** [Acessar Figma](https://hurry-dash-52266534.figma.site/)

---

## 3. Tecnologias Utilizadas

O ecossistema do projeto é composto pelas seguintes tecnologias:

* **Frontend:** Next.js (App Router), TailwindCSS
* **Backend:** FastAPI (Python), Prisma ORM
* **Banco de Dados:** PostgreSQL
* **Infraestrutura:** Docker, GitHub Actions (CI/CD)
* **Documentação e Automação:** MkDocs, Speckit

---

## 4. Arquitetura e Estrutura do Repositório

O repositório adota um padrão arquitetural desacoplado, utilizando o Modelo C4 para a representação e abstração dos componentes do sistema. A estrutura de pastas está organizada da seguinte forma:

```text
.
├── .agents/         # Configurações e competências dos agentes de IA do Squad
├── .github/         # Workflows de CI/CD (GitHub Actions) e templates de Issues/PRs
├── .specify/        # Estrutura de automação e integração de tarefas (Speckit)
├── backend/         # API desenvolvida em FastAPI e modelagem Prisma
├── docs/            # Documentação oficial do projeto e arquivos do MkDocs
├── estudios/        # Documentos de estudo e pesquisas das Sprints
├── frontend/        # Interface web desenvolvida em Next.js (App Router)
├── specs/           # Especificações técnicas e planos de tarefas/testes
├── docker-compose.yml
└── mkdocs.yml
```
---

## 5. Diretrizes para Agentes de Inteligência Artificial

## SDD e TDD com Suporte de Agentes

* Toda feature relevante deve possuir uma spec em `specs/` antes da implementação.
* Toda spec deve possuir plano de TDD ou validação antes de gerar tarefas.
* Nenhuma feature deve avançar para implementação se `test-plan.md` estiver ausente ou incompleto.
* O arquivo `AGENTS.md` serve como o guia contextual de comportamento e restrições para que os agentes de IA possam auxiliar o time na escrita e validação dessas especificações e planos de teste.
* Specs devem separar claramente R1 demonstrável, R2 completa e futuro.
* Ambiguidades devem ser marcadas como `NEEDS CLARIFICATION`.

---

## Agentes de IA no Ciclo de Design

* Este projeto não depende de um agente específico. As instruções em `AGENTS.md`, `docs/AGENTS.md`, `specs/AGENTS.md`, specs e skills devem permitir que qualquer agente de IA atue como auxiliar do time.
* Durante o processo de SDD e TDD, o arquivo `AGENTS.md` centraliza as regras arquiteturais e de qualidade documental, garantindo que qualquer IA gere planos de teste e especificações consistentes com os padrões do Squad.
* O Codex é a integração inicial configurada no Spec Kit porque é a ferramenta usada atualmente pelo grupo, mas o processo de SDD/TDD deve continuar compreensível para outros agentes, ferramentas e pessoas.
* Agentes de IA devem apoiar análise, documentação, planejamento, revisão e implementação, sempre seguindo Scrum, SDD/TDD, XP na R2 e as regras de branch/PR do projeto.
* Nenhum agente deve tomar decisões arquiteturais, alterar escopo ou implementar mudanças ambíguas sem registrar dúvida e solicitar orientação.
---

## 6. Escopo das Releases

### Release 1 (R1)
Focada na modelagem de requisitos, matriz de rastreabilidade, arquitetura da aplicação e consolidação da experiência visual através do protótipo no Figma. Exibe relatórios e scores de forma simulada e opinativa.

### Release 2 (R2)
Implementação funcional ponta a ponta. O sistema executa o envio de propostas legislativas, persiste os dados de forma estruturada no PostgreSQL, integra os agentes de IA e calcula os scores de legibilidade reais.

---

## 7. Equipe
Squad 07 – MDS 2026/1 – FGA/UnB

Jonathan Carpaneda — @Jonathan-Carpaneda

Paulo Alencar — @Paulodemczuk

Pedro Luca — @pedrolrm

Pedro Paulo Almeida — @Pedrop06

Victor Amaral — @valexim

Vinicius Araruna — @ViniciusA05