# Regras de Aprovação de Código e Merge

## Por que este documento existe

Sem regras claras, PRs podem ser mergeadas sem revisão adequada, com código não testado ou com conflitos não resolvidos. Este documento define o processo obrigatório de aprovação e merge para todas as branches do CrivoAI, garantindo que apenas código revisado, testado e sem conflitos chegue às branches protegidas.

## Branches protegidas

| Branch | Proteção |
|---|---|
| `main` | Merge apenas via PR aprovado, CI obrigatório, nunca diretamente |
| `dev` | Merge apenas via PR aprovado, CI obrigatório, nunca diretamente |

Nenhum membro do time, independente de permissão, deve fazer push direto em `main` ou `dev`.

---

## Condições obrigatórias para merge

Todo PR deve satisfazer **todos** os itens abaixo antes de ser mergeado:

### 1. CI aprovado

Todos os checks do pipeline devem estar verdes:

- Build sem erros
- Lint sem warnings bloqueantes (`flake8`, `eslint`, `tsc`)
- Testes passando (`pytest`, `jest`)
- Cobertura mínima de 90% atingida

Um PR com CI vermelho não pode ser mergeado, independente do conteúdo.

### 2. Mínimo de 1 aprovações

O PR precisa de ao menos **1 aprovações** de membros do time. Todos os participantes das áreas afetadas podem realizar revisão.

### 3. Branch atualizada com a base

A branch do PR deve estar atualizada com `dev` (ou `main`, se for o caso) antes do merge. Conflitos devem ser resolvidos pelo autor do PR, não pelo reviewer.

### 4. Todas as conversas resolvidas

Nenhum comentário de revisão pode estar em aberto no momento do merge. O autor deve responder ou resolver cada thread antes de solicitar re-revisão.

### 5. PR vinculado a uma issue

Todo PR deve referenciar a issue correspondente com na descrição. PRs sem issue vinculada não são aceitos.

---

## Estratégia de merge

O projeto adota **Merge Commit** em todos os PRs. Isso preserva o histórico completo de commits, facilitando a rastreabilidade de quem fez o quê e quando importante tanto para revisão do time quanto para avaliação acadêmica.

---

## Checklist do revisor

Ao revisar um PR, avalie os itens abaixo. O reviewer é responsável por não aprovar PRs que não atendam esses critérios:

**Código:**

- [ ] O código faz o que a issue descreve
- [ ] Segue as convenções do projeto (nomenclatura, estrutura de pastas, padrões da stack)
- [ ] Não introduz código duplicado que poderia ser extraído
- [ ] Não há secrets, tokens ou dados sensíveis hardcoded
- [ ] Performance não foi degradada de forma perceptível

**Testes:**

- [ ] Testes foram escritos antes ou junto ao código (TDD)
- [ ] Happy path está coberto
- [ ] Pelo menos um cenário de erro está coberto
- [ ] Cobertura mínima de 90% foi atingida para o código alterado

**Documentação:**

- [ ] Documentação foi atualizada se o comportamento mudou
- [ ] Comentários no código são necessários e claros (sem comentários óbvios)

**PR em si:**

- [ ] Commits seguem Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`)
- [ ] Título do PR é claro e descreve o que foi feito
- [ ] Issue está referenciada

---

## Política de stale reviews

Quando o autor faz um novo commit após uma revisão com "Request Changes", as aprovações anteriores **são invalidadas automaticamente** (dismiss stale reviews habilitado). O PR precisa ser re-revisado após cada atualização significativa.

Isso evita que aprovações dadas antes de uma mudança grande continuem válidas sem nova análise.

---

## Fluxo resumido

```
Criar branch a partir de dev
        ↓
Desenvolver seguindo TDD (Red → Green → Refactor)
        ↓
Rodar validações locais (pytest, npm run test, lint, build)
        ↓
Abrir PR para dev com template preenchido
        ↓
CI roda automaticamente
        ↓
Aguardar aprovação
        ↓
Resolver todas as conversas abertas
        ↓
Merge Commit
```

---

## Referências

- `CONTRIBUTING.md` — fluxo completo de contribuição
- `AGENTS.md` — regras obrigatórias de branch e commit
- `docs/sdd/tdd-estrategia-r2.md` — estratégia de TDD e checklist de testes
