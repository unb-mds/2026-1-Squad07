# Estratégia de TDD para a R2

## Por que este documento existe

Este documento define como o Squad 07 aplicará Test-Driven Development (TDD) durante a Release 2 do CrivoAI. A R2 marca a transição da documentação e prototipagem (R1) para a implementação funcional ponta a ponta, incluindo análise real de texto legislativo, cálculo de score e integração com agente de IA.

Sem uma estratégia clara de TDD, cada desenvolvedor pode adotar interpretações diferentes de quando e como testar, gerando inconsistências, baixa cobertura e dificuldade para revisão de código.

## Como se relaciona com o projeto

Este documento complementa o fluxo SDD/TDD descrito em `docs/sdd/index.md`. Enquanto aquele documento descreve o processo de especificação antes da implementação, este define especificamente como os testes devem ser escritos e revisados durante o desenvolvimento da R2.

A estratégia é derivada do estudo realizado na Sprint 10 (Issue #113) e foi formalizada para orientar o time na Issue #117.

---

## O Ciclo Red-Green-Refactor

Todo desenvolvimento de nova funcionalidade na R2 deve seguir o ciclo TDD:

**RED — Escrever o teste antes**

O desenvolvedor escreve um teste que descreve o comportamento esperado de uma funcionalidade que ainda não existe. O teste deve falhar porque o código de produção ainda não foi implementado. Essa falha é esperada e correta: ela confirma que o teste está testando algo real.

Se o teste passar sem código implementado, o teste está errado ou testando a coisa errada.

**GREEN — Implementar o mínimo para passar**

O desenvolvedor escreve apenas o código necessário para o teste passar. A solução pode ser simples ou até ingênua nesse momento. O objetivo exclusivo é fazer o teste ficar verde. Soluções hardcoded são aceitáveis enquanto há mais testes a serem escritos.

**REFACTOR — Limpar sem quebrar**

Com os testes passando, o desenvolvedor refatora: melhora legibilidade, elimina duplicação, aplica padrões arquiteturais. Os testes garantem que nenhum comportamento foi alterado durante a limpeza. Se algum teste quebrar durante a refatoração, a mudança introduziu uma regressão.

---

## Quando aplicar TDD obrigatoriamente

TDD é obrigatório nas seguintes situações na R2:

**Novas features:** qualquer funcionalidade nova, endpoint de API, componente com lógica de negócio ou integração com o agente de IA.

**Correção de bugs:** o fluxo correto é escrever um teste que reproduza o bug antes de corrigir. O teste falha com o bug presente e passa após a correção. Isso garante que o bug não retorne.

**Modificação de código existente:** quando a alteração muda o comportamento de uma função ou componente, o teste deve ser atualizado ou escrito antes da mudança.

TDD é recomendado (mas não obrigatório) para refatorações que não alteram comportamento externo, quando já existe cobertura de testes adequada.

---

## Padrões de escrita de testes

### Arrange-Act-Assert (AAA)

Estrutura padrão para testes unitários e de integração. Cada seção tem responsabilidade clara.

```python
def test_calcular_score_retorna_valor_entre_zero_e_cem():
    # Arrange — configurar o estado inicial e as dependências
    texto = "Art. 1º. Esta lei dispõe sobre o Programa Nacional de Qualidade Legislativa."

    # Act — executar a ação que está sendo testada
    resultado = calcular_score(texto)

    # Assert — verificar o resultado esperado
    assert isinstance(resultado, float)
    assert 0.0 <= resultado <= 100.0
```

```typescript
it("exibe mensagem de erro quando submissão falha", async () => {
    // Arrange
    mockApi.postLei.mockRejectedValue(new Error("Erro de conexão"));

    // Act
    render(<FormularioSubmissao />);
    await userEvent.click(screen.getByRole("button", { name: /enviar/i }));

    // Assert
    expect(await screen.findByText(/erro de conexão/i)).toBeInTheDocument();
});
```

### Given-When-Then

Variante mais próxima da linguagem de negócio, útil para descrever cenários de integração ou E2E:

```
Dado: usuário autenticado com token válido
Quando: submete texto legislativo com título, número e conteúdo
Então: recebe confirmação de persistência com status 201
```

---

## Estrutura de testes no CrivoAI

### Backend (Python + pytest)

Os testes do backend ficam em `backend/tests/`. A estrutura espelha a de `backend/app/`:

```
backend/
├── app/
│   ├── api/
│   │   ├── auth.py
│   │   └── laws.py
│   └── services/
│       └── score_service.py
└── tests/
    ├── unit/
    │   └── test_score_service.py
    └── integration/
        ├── test_auth_routes.py
        └── test_laws_routes.py
```

**Execução:**
```bash
cd backend
pytest
pytest --cov=app --cov-report=term-missing
```

### Frontend (TypeScript + Jest + React Testing Library)

Os testes ficam próximos aos componentes ou em `__tests__/`:

```
frontend/src/
├── components/
│   ├── ScoreBadge/
│   │   ├── ScoreBadge.tsx
│   │   └── ScoreBadge.test.tsx
│   └── FormularioSubmissao/
│       ├── FormularioSubmissao.tsx
│       └── FormularioSubmissao.test.tsx
└── lib/
    ├── api.ts
    └── api.test.ts
```

**Execução:**
```bash
cd frontend
npm run test
npm run test -- --coverage
```

---

## Metas de cobertura para R2

| Escopo | Cobertura mínima |
|---|---|
| Código novo | 90% |
| Código modificado | 90% |
| Backend (geral) | 90% |
| Frontend (geral) | 90% |

A meta de 90% é definida pelo plano de ensino da disciplina e é obrigatória para todos os PRs da R2.

Cobertura é um indicador, não um objetivo final. Um teste que percorre uma linha de código sem verificar nada não conta como cobertura significativa. O reviewer deve avaliar se os assertions fazem sentido, não apenas se a porcentagem foi atingida.

### Ferramentas de cobertura

**Backend — pytest-cov:**

```bash
pip install pytest-cov
pytest --cov=app --cov-report=term-missing --cov-fail-under=90
```

A flag `--cov-fail-under=90` garante que o CI falhe automaticamente se a cobertura cair abaixo da meta. Para relatório HTML:

```bash
pytest --cov=app --cov-report=html
```

**Frontend — Jest coverage:**

```bash
npm run test -- --coverage
```

O threshold pode ser fixado no `jest.config.js`:

```js
coverageThreshold: {
  global: { lines: 90, functions: 90, branches: 90 },
}
```

### SonarQube — Qualidade de código no CI/CD

> **Nota:** SonarQube é uma ferramenta de CI/CD, não um framework de teste. Sua configuração pertence ao pipeline (`.github/workflows/`). Em relação a cobertura, ele apenas lê e exibe os relatórios gerados pelo pytest-cov e Jest — não executa testes.

O que o SonarQube analisa:

- **Code smells:** código funcional mas difícil de manter (métodos longos, complexidade alta)
- **Bugs:** padrões com alta probabilidade de falha em produção
- **Vulnerabilidades:** segredos expostos, injeção SQL, imports inseguros
- **Duplicações:** blocos repetidos que devem ser extraídos
- **Cobertura:** lida a partir do `coverage.xml` (pytest-cov) ou `lcov.info` (Jest)

**Fluxo de integração:**

```
pytest --cov=app --cov-report=xml  →  coverage.xml
Jest --coverage                    →  lcov.info
              ↓
      CI envia para SonarQube
              ↓
   SonarQube exibe painel + Quality Gate
```

O **Quality Gate** do SonarQube pode bloquear merges se a cobertura cair abaixo da meta ou se forem introduzidos bugs e vulnerabilidades críticas. A configuração de Quality Gate e a integração com GitHub Actions deve ser documentada e implementada dentro do escopo de CI/CD do projeto, não aqui.

---

## Pirâmide de testes do CrivoAI

```
           /\
          /E2E\           Playwright — fluxos completos (R2)
         /------\
        / Integra-\       pytest + TestClient / MSW — rotas, banco
       / ção        \
      /--------------\
     /   Unitários    \   pytest / Jest — funções, componentes
    /------------------\
```

A proporção esperada: ~70% unitários, ~20% integração, ~10% E2E.

---

## Checklist de TDD para Pull Requests

Todo PR que inclui implementação na R2 deve atender os itens abaixo antes de ser revisado:

**Sobre os testes:**

- [ ] Testes foram escritos antes ou junto ao código de produção
- [ ] Testes são determinísticos (mesmo resultado em qualquer ambiente)
- [ ] Happy path está coberto
- [ ] Pelo menos um edge case ou cenário de erro está coberto
- [ ] Nenhum teste depende de estado externo não controlado (banco real, hora do sistema, variável de ambiente ausente)
- [ ] Mocks e stubs estão usados apenas onde necessário

**Sobre a cobertura:**

- [ ] Coverage mínima de 90% foi atingida para o código alterado
- [ ] `pytest` passa sem erros e warnings inesperados
- [ ] `npm run test` passa sem erros

**Sobre a revisão:**

- [ ] O reviewer avaliou a qualidade dos testes, não apenas a do código
- [ ] Testes novos não foram adicionados apenas para aumentar métricas de coverage

---

## O que não fazer

**Não escrever testes depois da implementação e chamar de TDD.** Testes escritos depois tendem a cobrir apenas o que o código já faz, não o que deveria fazer. TDD real exige a sequência correta: teste → código → refatoração.

**Não usar mocks em excesso.** Mockar tudo além do necessário cria testes que passam mas não detectam problemas reais de integração.

**Não ignorar testes que falham intermitentemente (flaky tests).** Um teste que falha às vezes é tão prejudicial quanto nenhum teste. Corrija ou remova antes de mergear.

**Não considerar coverage como garantia de qualidade.** 100% de coverage com assertions vazias ou triviais é pior que 70% com assertions significativas.

---

## Relação com CI/CD

Na R2, o pipeline de CI deve executar automaticamente a suite de testes a cada push e bloquear merge se:

- Algum teste falhar
- A cobertura cair abaixo da meta definida
- `npm run lint` ou `npm run build` falharem

A configuração de CI está em `.github/workflows/`. Alterações no pipeline devem seguir as regras do `AGENTS.md` (análise prévia, sem CI/CD impulsivo).

---

## Referências

- `estudos/sprint10/estudo_TDD_e_frameworks_de_teste.md` — Estudo aprofundado realizado na Sprint 10 (Issue #113)
- `docs/sdd/index.md` — Visão geral do processo SDD/TDD do Squad 07
- `specs/AGENTS.md` — Fluxo obrigatório de specs antes da implementação
- Issue #113 — TDD e Frameworks de Teste (estudo base)
- Issue #117 — Documentar Estratégia de TDD para R2
- CONTRIBUTING.md — Guia de contribuição do projeto
