# Constituição do Squad 07

## Princípios Centrais

### I. SDD Antes de Implementação

Funcionalidades relevantes devem nascer de uma spec em `specs/`. A spec deve explicar problema, objetivo, público, comportamento esperado, critérios de aceite, limites de escopo e relação com R1/R2. Implementações sem spec são permitidas apenas para correções pequenas e manutenção claramente delimitada.

### II. TDD e Validação Obrigatórios

Toda spec deve conter `test-plan.md`. Backend deve priorizar testes com `pytest`. Frontend deve registrar validações manuais na R1 e planejar Vitest/React Testing Library para R2 quando aplicável. Documentação deve possuir TDD documental com critérios verificáveis antes da aprovação.

### III. Documentação Como Produto

A documentação deve ser compreensível para professora, PO, devs e avaliadores externos. Toda página deve ter objetivo, contexto, relação com o projeto, validação e texto explicativo próprio. Imagens, embeds e links externos não substituem explicação textual.

### IV. Arquitetura Incremental e Coerente

O projeto deve respeitar a separação entre frontend, backend, banco e documentação. Backend evolui por rotas, modelos, serviços e persistência. Frontend evolui por páginas, componentes e integrações em `lib/`. Regras de negócio complexas não devem ficar no frontend.

### V. Git Seguro e Revisável

Nunca trabalhar diretamente na `main`. Toda mudança deve ocorrer em branch separada, com PR obrigatório para integração. Commits devem ser pequenos, objetivos e seguir Conventional Commits. Alterações de CI/CD exigem análise prévia da estrutura real.

### VI. Agentes de IA Como Auxiliares, Não Como Base do Projeto

O projeto deve ser compreensível e executável por pessoas e por diferentes agentes de IA. O Codex é a integração inicial do Spec Kit nesta etapa, mas as instruções devem permanecer agnósticas a ferramenta sempre que possível. AGENTS, specs, skills e documentação devem orientar o comportamento esperado de qualquer agente auxiliar, sem transferir decisões de escopo, arquitetura ou produto para a ferramenta.

## Restrições do Projeto

- Não adicionar dependências sem necessidade real.
- Não alterar frontend, backend, banco ou workflows dentro de tarefas documentais.
- Não inventar endpoints, contratos, tabelas ou regras de negócio sem spec ou evidência no repositório.
- Não aceitar documentação sem acentuação correta em PT-BR.
- Não considerar uma spec pronta se houver `NEEDS CLARIFICATION` em pontos centrais.
- Não escrever documentação que torne o processo dependente exclusivamente do Codex ou de qualquer outro agente específico.

## Fluxo SDD/TDD

1. Criar ou atualizar `spec.md`.
2. Resolver ambiguidades com o PO/time.
3. Criar `plan.md` com abordagem técnica ou documental.
4. Criar `test-plan.md` antes de `tasks.md`.
5. Gerar `tasks.md` com tarefas rastreáveis.
6. Validar consistência entre spec, plano, testes e tarefas.
7. Só então iniciar implementação.

## Governança

Esta constituição orienta specs, documentação, agentes e revisões. Mudanças neste arquivo devem ser justificadas em PR e não podem contradizer decisões já aprovadas de arquitetura, escopo ou versionamento.

**Versão**: 1.0.0 | **Ratificada**: 2026-05-21 | **Última alteração**: 2026-05-21
