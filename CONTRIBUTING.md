# Como Contribuir — CrivoAI

Obrigado por querer contribuir com o CrivoAI! Este guia descreve o processo para abrir issues, criar branches, escrever código, rodar testes e submeter Pull Requests.

## Pré-requisitos

Antes de começar, certifique-se de ter lido:

- `README.md` — visão geral do projeto
- `AGENTS.md` — regras obrigatórias para branches, commits e PRs
- `docs/sdd/index.md` — fluxo SDD/TDD do CrivoAI

## Fluxo de Contribuição

### 1. Abrir ou localizar uma issue

Toda contribuição começa em uma issue. Se a funcionalidade ou correção não tem issue, abra uma antes de começar. Use os templates disponíveis em `.github/ISSUE_TEMPLATE/`.

### 2. Criar uma branch

Nunca trabalhe diretamente em `main` ou `dev`. Crie uma branch a partir de `dev`:

```bash
git checkout dev
git pull origin dev
git checkout -b tipo/descricao-curta
```

Exemplos de prefixos:
- `feat/` — nova funcionalidade
- `fix/` — correção de bug
- `docs/` — documentação
- `chore/` — manutenção e configuração

### 3. Seguir o fluxo SDD/TDD

Para funcionalidades relevantes, a spec em `specs/` deve existir antes da implementação. O fluxo obrigatório é:

1. `spec.md` com objetivo, contexto e critérios de aceite
2. `plan.md` com abordagem técnica
3. `test-plan.md` antes de qualquer tarefa de implementação
4. `tasks.md` com tarefas rastreáveis

Consulte `specs/AGENTS.md` para o fluxo completo.

### 4. Escrever testes (TDD)

Na R2, os testes são escritos **antes** do código de produção. Consulte a estratégia completa em:

**[Estratégia de TDD para R2 →](docs/sdd/tdd-estrategia-r2.md)**

Resumo do ciclo:
1. **RED** — escrever teste que falha
2. **GREEN** — escrever código mínimo para passar
3. **REFACTOR** — limpar código sem quebrar testes

Metas mínimas de cobertura para R2:
- Código novo: 80%
- Backend geral: 75%
- Frontend geral: 70%

### 5. Rodar validações locais

Antes de abrir o PR, execute:

**Backend:**
```bash
cd backend
pytest
```

**Frontend:**
```bash
cd frontend
npm run lint
npm run build
npm run test
```

**Documentação:**
```bash
mkdocs serve
```

### 6. Abrir o Pull Request

Abra o PR para a branch `dev` (nunca para `main`). Use o template disponível em `.github/PULL_REQUEST_TEMPLATE.md`. O PR deve:

- Referenciar a issue relacionada (`Closes #número`)
- Descrever o que foi feito e como validar
- Ter todos os checks de CI passando
- Ter ao menos uma revisão aprovada antes do merge

## Padrão de Commits

O projeto usa Conventional Commits:

```
feat: adicionar rota de detalhe de lei por ID
fix: corrigir cálculo de score para textos curtos
docs: atualizar estratégia de TDD na R2
chore: atualizar dependências do backend
test: adicionar testes de integração para /laws
```

## Documentação

Toda página de documentação deve:

- Explicar por que existe e qual problema resolve
- Ter texto explicativo próprio (não apenas links, imagens ou embeds)
- Estar em PT-BR com acentuação correta
- Ser testada localmente com `mkdocs serve` antes do merge

Consulte `docs/AGENTS.md` para o checklist completo de qualidade documental.

## Dúvidas

Em caso de dúvidas sobre escopo, arquitetura ou ambiguidades, marque a dúvida como `NEEDS CLARIFICATION` na spec ou na issue e solicite orientação ao time antes de implementar.
