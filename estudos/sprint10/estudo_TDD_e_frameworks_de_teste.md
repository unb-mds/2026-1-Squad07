# Estudo: TDD e Frameworks de Teste

**Conceito:** Test-Driven Development (TDD) e Frameworks de Teste Automatizado
**Quem será o coelho:** Vinicius Silva Araruna
**Sprint:** Sprint 10
**Issue:** #113

---

## O que é?

TDD é uma metodologia de desenvolvimento em que **testes são escritos antes do código de produção**. O objetivo não é apenas verificar que o código funciona, mas usar os testes como ferramenta de design: ao escrever o teste primeiro, o desenvolvedor é forçado a pensar no comportamento esperado antes de pensar na implementação.

A diferença central em relação ao teste convencional (feito depois da implementação) é que no TDD o teste guia o que será escrito, enquanto no teste posterior o teste apenas confirma o que já foi escrito.

---

## Como funciona: Ciclo Red-Green-Refactor

O TDD opera em um ciclo curto e repetitivo de três fases:

### 1. RED — Escrever um teste que falha

O desenvolvedor escreve um teste que descreve o comportamento desejado para uma funcionalidade que ainda não existe. O teste obrigatoriamente falha porque o código ainda não foi implementado. Esse passo força a definição clara do que se espera do código antes de qualquer linha de implementação.

### 2. GREEN — Escrever o mínimo de código para passar

O desenvolvedor escreve apenas o código necessário para o teste passar. Não importa se a solução é "feia" ou ingênua nesse momento. O objetivo é simplesmente fazer o teste ficar verde. Soluções hardcoded são aceitáveis nessa fase.

### 3. REFACTOR — Limpar o código sem quebrar os testes

Com os testes passando, o desenvolvedor refatora o código: melhora legibilidade, elimina duplicações, aplica padrões de projeto e melhora a estrutura. Os testes garantem que o comportamento não foi alterado durante a limpeza.

Esse ciclo se repete para cada nova funcionalidade ou comportamento.

---

## TDD vs. Teste após implementação

| Aspecto | TDD | Teste Posterior |
|---|---|---|
| Quando testa? | Antes do código | Depois do código |
| Guia o design? | Sim | Não |
| Cobertura? | Tende a ser alta naturalmente | Depende de disciplina |
| Regressão? | Detectada imediatamente | Detectada mais tarde |
| Custo de correção? | Baixo (bug recente) | Alto (bug já integrado) |
| Dificuldade inicial? | Alta (requer mudança de hábito) | Baixa |

---

## Benefícios do TDD

**Design mais limpo:** Escrever testes primeiro incentiva código desacoplado e com responsabilidade única, porque código difícil de testar geralmente é código mal estruturado.

**Documentação viva:** Os testes descrevem o comportamento esperado do sistema de forma executável. Qualquer pessoa pode ler os testes e entender o que o código faz.

**Feedback rápido:** Falhas são detectadas no momento em que são introduzidas, não semanas depois.

**Refatoração segura:** Com uma suite de testes robusta, o desenvolvedor refatora com confiança sabendo que qualquer regressão será capturada automaticamente.

**Redução de bugs em produção:** Estudos práticos em projetos como o IBM Rational Suite e o Microsoft Windows relataram redução de 40-90% nos defeitos após adoção de TDD.

---

## Desafios do TDD

**Curva de aprendizado:** Mudar o hábito de escrever código antes de testes leva tempo e prática.

**Velocidade inicial:** As primeiras sprints com TDD costumam ser mais lentas. O ganho de velocidade vem nas sprints seguintes, com menos bugs e regressões.

**Código legado:** Aplicar TDD em código existente sem testes é difícil. É necessário refatorar para permitir testabilidade antes de adicionar testes.

**Mocks excessivos:** Uso incorreto de mocks pode criar testes que passam mas não detectam problemas reais.

---

## Pirâmide de Testes

A pirâmide de testes define a proporção ideal entre tipos de teste:

```
        /\
       /E2E\         <- Poucos, lentos, cobrem fluxos completos
      /------\
     /Integração\    <- Médios, testam interação entre componentes
    /------------\
   /   Unitários  \  <- Muitos, rápidos, isolados
  /----------------\
```

**Regra geral para o CrivoAI:**
- Unit tests: ~70% da suite
- Integration tests: ~20% da suite
- E2E tests: ~10% da suite

---

## Unit Testing — Testes Unitários

Testam uma única função, método ou classe em isolamento. Dependências externas (banco de dados, APIs, sistema de arquivos) são substituídas por mocks ou stubs.

### pytest — para Python (Backend FastAPI)

O pytest é o framework de testes padrão do Python. Simples de usar e extensível.

**Instalação:**
```bash
pip install pytest pytest-cov
```

**Exemplo básico (Arrange-Act-Assert):**
```python
def test_calcular_score_retorna_valor_valido():
    # Arrange (Given) — preparar os dados
    texto = "A presente lei dispõe sobre a regulamentação do setor energético nacional."

    # Act (When) — executar a ação
    resultado = calcular_score(texto)

    # Assert (Then) — verificar o resultado
    assert isinstance(resultado, float)
    assert 0.0 <= resultado <= 100.0
```

**Exemplo com exceção esperada:**
```python
def test_calcular_score_rejeita_texto_vazio():
    with pytest.raises(ValueError, match="Texto não pode ser vazio"):
        calcular_score("")
```

**Exemplo com fixture (reutilização de setup):**
```python
@pytest.fixture
def texto_legislativo():
    return "Art. 1º. Esta lei institui o Programa Nacional de Transparência Legislativa."

def test_score_texto_curto(texto_legislativo):
    resultado = calcular_score(texto_legislativo)
    assert resultado >= 0
```

### Jest — para TypeScript/JavaScript (Frontend Next.js)

O Jest é o framework de testes padrão para projetos JavaScript e TypeScript, especialmente React.

**Instalação:**
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

**Exemplo básico:**
```typescript
describe("formatarData", () => {
  it("formata data ISO para formato brasileiro", () => {
    // Arrange
    const dataISO = "2026-06-08T00:00:00Z";

    // Act
    const resultado = formatarData(dataISO);

    // Assert
    expect(resultado).toBe("08/06/2026");
  });

  it("retorna string vazia quando data é inválida", () => {
    expect(formatarData("data-invalida")).toBe("");
  });
});
```

**Testando componente React:**
```typescript
import { render, screen } from "@testing-library/react";
import { ScoreBadge } from "@/components/ScoreBadge";

it("exibe score com cor verde para valor acima de 70", () => {
  render(<ScoreBadge score={85} />);
  const badge = screen.getByText("85");
  expect(badge).toHaveClass("text-green-500");
});
```

---

## Integration Testing — Testes de Integração

Testam a interação entre múltiplos componentes reais: rota HTTP + serviço + banco de dados, por exemplo.

**Com FastAPI + pytest:**
```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_criar_submissao_retorna_201():
    payload = {
        "title": "PL 001/2026",
        "text": "Texto legislativo de exemplo.",
        "lawNumber": "001"
    }
    response = client.post("/laws", json=payload)
    assert response.status_code == 201
    assert response.json()["title"] == "PL 001/2026"
```

---

## E2E Testing — Testes Ponta a Ponta

Simulam um usuário real interagindo com a aplicação no navegador, do login até a ação final.

### Playwright (recomendado para R2)

```typescript
import { test, expect } from "@playwright/test";

test("usuário consegue submeter texto legislativo", async ({ page }) => {
  await page.goto("/login");
  await page.fill('[name="email"]', "usuario@teste.com");
  await page.fill('[name="password"]', "senha123");
  await page.click('button[type="submit"]');

  await page.goto("/upload");
  await page.fill('[name="title"]', "PL 001/2026");
  await page.fill('[name="text"]', "Texto legislativo de exemplo");
  await page.click('button[type="submit"]');

  await expect(page.locator(".success-message")).toBeVisible();
});
```

### Cypress (alternativa popular)

Cypress tem uma interface visual que facilita depuração. A sintaxe é similar mas usa `cy.` como prefixo para todos os comandos.

---

## Mocking e Stubbing

**Mock:** Substituto de uma dependência que verifica se foi chamado corretamente (foco em comportamento).

**Stub:** Substituto de uma dependência que apenas retorna um valor fixo (foco no estado).

**Quando usar:**
- Chamadas a banco de dados em testes unitários → stub/mock
- Chamadas a APIs externas → mock
- Sistema de arquivos → mock
- Funções de tempo (`datetime.now()`, `Date.now()`) → mock

**Exemplo com pytest (usando `unittest.mock`):**
```python
from unittest.mock import patch, MagicMock

def test_buscar_lei_chama_repositorio_uma_vez():
    with patch("app.services.lei_service.LeiRepository") as MockRepo:
        mock_repo = MagicMock()
        MockRepo.return_value = mock_repo
        mock_repo.buscar_por_id.return_value = {"id": 1, "title": "PL 001"}

        service = LeiService()
        resultado = service.buscar_lei(1)

        mock_repo.buscar_por_id.assert_called_once_with(1)
        assert resultado["title"] == "PL 001"
```

**Exemplo com Jest:**
```typescript
jest.mock("@/lib/api", () => ({
  fetchLei: jest.fn().mockResolvedValue({ id: 1, title: "PL 001" }),
}));

it("exibe título da lei ao carregar", async () => {
  render(<LeiDetalhe id={1} />);
  expect(await screen.findByText("PL 001")).toBeInTheDocument();
});
```

---

## Code Coverage — Cobertura de Código

Coverage mede a porcentagem de linhas, branches e funções do código que são exercitadas pelos testes.

**Gerar relatório com pytest:**
```bash
pytest --cov=app --cov-report=term-missing
```

**Gerar relatório com Jest:**
```bash
jest --coverage
```

**Metas de cobertura para o CrivoAI (R2):**

| Escopo | Mínimo |
|---|---|
| Código novo | 90% |
| Código modificado | 90% |
| Backend (geral) | 90% |
| Frontend (geral) | 90% |

Essa meta de 90% é definida pelo plano de ensino da disciplina e deve ser respeitada em todos os PRs da R2.

**Importante:** Coverage alta não garante qualidade. Testes ruins podem atingir 100% de coverage sem verificar nada relevante. O objetivo é cobertura significativa, não cobertura mecânica.

### Ferramentas de cobertura

**pytest-cov (backend):**

```bash
pip install pytest-cov
pytest --cov=app --cov-report=term-missing --cov-fail-under=90
```

A flag `--cov-fail-under=90` faz o comando retornar erro se a cobertura cair abaixo de 90%, bloqueando o CI automaticamente.

Para gerar um relatório HTML navegável:
```bash
pytest --cov=app --cov-report=html
# Abre htmlcov/index.html no navegador
```

**Jest coverage (frontend):**

```bash
npm run test -- --coverage --coverageThreshold='{"global":{"lines":90}}'
```

No `jest.config.js`, pode-se fixar o threshold permanentemente:
```js
module.exports = {
  coverageThreshold: {
    global: {
      lines: 90,
      functions: 90,
      branches: 90,
    },
  },
};
```

### SonarQube — Análise estática de qualidade

> **Atenção:** SonarQube é uma ferramenta de CI/CD, não um framework de teste. Sua configuração pertence ao pipeline (`.github/workflows/`), não ao processo TDD em si. O que ele faz em relação a testes é **receber e exibir** os relatórios de cobertura gerados pelo pytest-cov e Jest.

O SonarQube analisa o código em busca de:
- **Code smells:** código funcional mas difícil de manter
- **Bugs:** padrões que provavelmente causarão falhas em produção
- **Vulnerabilidades de segurança:** injeção SQL, segredos expostos, etc.
- **Duplicações:** blocos de código repetidos
- **Cobertura de testes:** lê o relatório gerado pelo pytest-cov ou Jest e exibe no painel

**Como o fluxo se conecta:**

```
pytest --cov=app --cov-report=xml   →   coverage.xml
Jest --coverage                     →   lcov.info
        ↓
SonarQube lê esses arquivos no CI e exibe no painel de qualidade
```

**Quality Gate:** O SonarQube pode bloquear o merge de um PR se a cobertura cair abaixo da meta ou se forem introduzidos bugs e vulnerabilidades críticas. Essa configuração fica no pipeline de CI/CD.

---

## Padrões de Nomenclatura e Organização

**Arrange-Act-Assert (AAA):** Estrutura clara para cada teste.

```python
def test_descricao_clara_do_comportamento():
    # Arrange — configurar estado inicial
    ...
    # Act — executar a ação testada
    ...
    # Assert — verificar o resultado
    ...
```

**Given-When-Then (BDD style):** Mais próximo da linguagem de negócio.

```
Given: usuário autenticado com token válido
When: submete texto legislativo com título, número e conteúdo
Then: recebe confirmação de persistência e é redirecionado para listagem
```

**Regras de nomenclatura para o CrivoAI:**
- Python: `test_<funcionalidade>_<cenário>_<resultado_esperado>()`
- TypeScript: `describe("<componente/função>") { it("<comportamento esperado>") }`

---

## Checklist para PRs com TDD

- [ ] Testes foram escritos antes ou junto ao código (não depois)
- [ ] Testes são determinísticos (mesmo resultado toda execução)
- [ ] Testes cobrem o happy path e os principais edge cases
- [ ] Nenhum teste depende de estado externo não controlado (banco real, hora do sistema)
- [ ] Mocks e stubs estão documentados ou são óbvios pelo contexto
- [ ] Coverage de 90% atingida (conforme plano de ensino da disciplina)
- [ ] `pytest` passa sem erros no backend
- [ ] `npm run test` (ou equivalente) passa sem erros no frontend
- [ ] Code review avaliou qualidade dos testes, não apenas do código

---

## Relação com o CrivoAI

Na R2, o CrivoAI implementará funcionalidades de análise legislativa real. Para garantir qualidade e sustentabilidade do código, o time adotará TDD nas seguintes áreas:

**Backend (pytest):**
- Cálculo de score de qualidade legislativa
- Identificação de frases longas e termos ambíguos
- Rotas de submissão, listagem e detalhe de leis
- Integração com agente de IA

**Frontend (Jest + Vitest + React Testing Library):**
- Componentes de exibição de score e métricas
- Fluxos de autenticação e submissão
- Estados de carregamento, erro e vazio

**E2E (Playwright — planejado para R2):**
- Fluxo completo: login → submissão → visualização de score

---

## Referências

- Beck, K. (2002). *Test Driven Development: By Example*. Addison-Wesley.
- Documentação oficial do pytest: https://docs.pytest.org
- Documentação oficial do Jest: https://jestjs.io/docs/getting-started
- Documentação do Playwright: https://playwright.dev/docs/intro
- Documentação do React Testing Library: https://testing-library.com/docs/react-testing-library/intro
- Issue #117 — Documentar Estratégia de TDD para R2
