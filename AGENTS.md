# AGENTS.md - Squad 07

## Projeto

O projeto **Monitoramento de Qualidade de Leis** é uma plataforma web para avaliar a qualidade técnica de proposições legislativas. O sistema deve permitir submissão de texto legislativo, persistência da submissão, listagem, visualização de detalhes e evolução futura para análise demonstrativa e score de qualidade legislativa.

## Regras Obrigatórias

- Nunca altere diretamente a branch `main`.
- Toda implementação deve ocorrer em branch separada e passar por Pull Request.
- Antes de editar arquivos, verifique a branch atual e confirme que não está na `main`.
- Não faça merge automático na `main`.
- Não implemente CI/CD sem analisar a estrutura real do projeto.
- Não adicione dependências sem justificativa técnica.
- Não misture múltiplas responsabilidades no mesmo diff.
- Não refatore código não relacionado à tarefa.
- Toda documentação deve estar em PT-BR com acentuação correta.

## SDD e TDD

- Toda feature relevante deve possuir uma spec em `specs/` antes da implementação.
- Toda spec deve possuir plano de TDD ou validação antes de gerar tarefas.
- Nenhuma feature deve avançar para implementação se `test-plan.md` estiver ausente ou incompleto.
- Specs devem separar claramente R1 demonstrável, R2 completa e futuro.
- Ambiguidades devem ser marcadas como `NEEDS CLARIFICATION`.

## Agentes de IA

- Este projeto não depende de um agente específico. As instruções em `AGENTS.md`, `docs/AGENTS.md`, `specs/AGENTS.md`, specs e skills devem permitir que qualquer agente de IA atue como auxiliar do time.
- O Codex é a integração inicial configurada no Spec Kit porque é a ferramenta usada atualmente pelo grupo, mas o processo de SDD/TDD deve continuar compreensível para outros agentes, ferramentas e pessoas.
- Agentes de IA devem apoiar análise, documentação, planejamento, revisão e implementação, sempre seguindo Scrum, SDD/TDD, XP na R2 e as regras de branch/PR do projeto.
- Nenhum agente deve tomar decisões arquiteturais, alterar escopo ou implementar mudanças ambíguas sem registrar dúvida e solicitar orientação.

## Fluxo de Trabalho

1. Leia a issue relacionada no GitHub.
2. Leia a spec correspondente em `specs/`, quando existir.
3. Leia o `AGENTS.md` mais próximo da área alterada.
4. Verifique branch e estado do Git.
5. Faça a menor alteração suficiente para cumprir a tarefa.
6. Valide com comandos existentes no projeto.
7. Abra PR para integração na `dev`.

## Estrutura Principal

- `backend/`: API FastAPI, Prisma e PostgreSQL.
- `frontend/`: interface Next.js.
- `docs/`: documentação pública em MkDocs.
- `specs/`: specs SDD/TDD do projeto.
- `.specify/`: infraestrutura do GitHub Spec Kit.
- `.agents/skills/`: skills locais para agentes de IA; a integração inicial é Codex, mas as regras devem ser reutilizáveis por outros agentes.

## Comandos Conhecidos

- Frontend:
  - `cd frontend`
  - `npm install`
  - `npm run dev`
  - `npm run build`
  - `npm run lint`
- Backend:
  - `cd backend`
  - `pytest`
  - `uvicorn app.main:app --reload`
- Documentação:
  - `mkdocs serve`

## Qualidade Documental

Toda página documental deve explicar por que existe, qual problema resolve, como se relaciona com o projeto e como pode ser validada. Não aceite páginas compostas apenas por links, imagens, iframes, embeds ou listas soltas.
