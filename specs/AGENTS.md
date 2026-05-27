# AGENTS.md - Specs SDD/TDD

## Propósito

Use este guia ao criar ou revisar specs em `specs/`.

## Fluxo Obrigatório

1. Criar ou revisar `spec.md`.
2. Resolver `NEEDS CLARIFICATION` antes de planejar.
3. Criar `plan.md`.
4. Criar `test-plan.md`.
5. Só então criar `tasks.md`.
6. Validar consistência entre todos os artefatos.

## Regras

- Toda spec deve separar R1 demonstrável, R2 completa e futuro quando aplicável.
- Toda spec deve possuir critérios de aceite verificáveis.
- Toda spec deve possuir plano de TDD ou validação.
- Tarefas de teste devem vir antes de tarefas de implementação.
- Specs documentais usam TDD documental.
- Specs funcionais devem planejar testes backend/frontend conforme a área.
- Não invente endpoints, contratos ou modelos sem evidência ou decisão explícita.

## Estrutura Recomendada

```text
specs/000-nome-da-spec/
|-- spec.md
|-- plan.md
|-- test-plan.md
|-- tasks.md
|-- quickstart.md
|-- contracts/
`-- data-model.md
```
