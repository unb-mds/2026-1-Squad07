# Tasks: Cálculo de Score de Legibilidade (Flesch-Kincaid) - R2

**Input**: `spec.md`, `plan.md`, `test-plan.md`, `quickstart.md`

**Regra obrigatória**: Tarefas de teste/validação devem aparecer antes das tarefas de implementação correspondentes (TDD - Test-Driven Development).

---

## Fase 1 - Preparação e Design (SDD)

- [x] T001 [SPEC] Confirmar que `spec.md` não possui ambiguidades e foi aprovado pelo usuário.
- [x] T002 [TEST] Confirmar que `test-plan.md` está estruturado em pares de Happy e Bad Paths com saídas determinísticas.
- [x] T003 [OPS] Realizar Commit 1:
  * *Engloba*: Criação da pasta `specs/004-readability-score/` contendo os arquivos de especificação e planos do SDD (`spec.md`, `plan.md`, `test-plan.md`, `tasks.md` e `quickstart.md`).
  * *Mensagem*: `docs: adiciona especificacoes SDD para calculo de legibilidade (#132)`

---

## Fase 2 - Validação Primeiro (TDD - RED)

- [x] T004 [TEST] Criar o arquivo de testes unitários `backend/tests/unit/test_readability_service.py` cobrindo Happy e Bad Paths da heurística (TDD-001 a TDD-006).
- [x] T005 [TEST] Criar o arquivo de testes de integração `backend/tests/integration/test_readability_routes.py` cobrindo Happy e Bad Paths de tráfego do endpoint (TDD-007 e TDD-008).
- [x] T006 [OPS] Realizar Commit 2:
  * *Engloba*: Criação dos arquivos de testes unitários e de integração no backend (TDD RED).
  * *Mensagem*: `test: adiciona testes unitarios e integrados para legibilidade (RED) (#132)`

---

## Fase 3 - Implementação (TDD - GREEN)

- [x] T007 [BACKEND] [P] Definir e criar os Schemas Pydantic `ReadabilityRequest` e `ReadabilityResponse` em `backend/app/models/law.py` (ou módulo próprio).
- [x] T008 [OPS] Realizar Commit 3:
  * *Engloba*: Schemas Pydantic de dados e payloads.
  * *Mensagem*: `feat: adiciona schemas pydantic para endpoint de legibilidade (#132)`
- [x] T009 [BACKEND] Implementar a lógica de negócios e heurística silábica em `backend/app/services/readability.py` até passar nos testes de unidade (`test_readability_service.py`).
- [x] T010 [OPS] Realizar Commit 4:
  * *Engloba*: O módulo de serviços `readability.py` com o algoritmo.
  * *Mensagem*: `feat: implementa heuristica de silabas e formula de legibilidade (IFL) (#132)`
- [x] T011 [BACKEND] Adicionar a rota `@router_v1.post("/readability")` em `backend/app/api/laws.py` e registrá-la em `backend/app/main.py` até passar nos testes de integração (`test_readability_routes.py`).
- [x] T012 [OPS] Realizar Commit 5:
  * *Engloba*: Inclusão do endpoint FastAPI e registro no roteador central do main.
  * *Mensagem*: `feat: expoem endpoint POST /api/v1/laws/readability (#132)`

---

## Fase 4 - Revisão e Qualidade (TDD - REFACTOR)

- [x] T013 [REVIEW] Executar ferramentas de linting (`black` e `flake8`) no diretório do backend.
- [x] T014 [TEST] Executar a suite de testes localmente com `pytest` e garantir que a cobertura de código é `>= 90%` com o modelo mockado.
- [x] T015 [OPS] Realizar Commit 6:
  * *Engloba*: Refatorações não-funcionais, ajustes de styleguide ou correções de linting.
  * *Mensagem*: `refactor: otimiza heuristica de silabas e aplica padroes de lint (#132)`
- [ ] T016 [REVIEW] Abrir Pull Request da branch `feat/issue-132-calculo-score-legibilidade` para a branch `dev` com relatórios de testes bem-sucedidos.

---

## Fase 5 - Correções Pré-PR

- [x] T017 [BACKEND] Correção de bug na regex de segmentação de frases em `backend/app/services/readability.py` para cobrir os sufixos ordinais ASCII `o` e `a` (`\d+[ºoaª]?`), resolvendo erros de quebra de frase com abreviações do tipo `Art. 1o.`.
- [x] T018 [TEST] Inclusão de teste de cobertura do bloco `try/except Exception` de `analyze_readability` em `backend/tests/integration/test_readability_routes.py` (usando mock de RuntimeError em `calcular_score`), garantindo cobertura do tratamento defensivo e elevando a cobertura geral.
- [x] T019 [SPEC] Alinhamento da seção "Dados de Entrada e Saída" de `specs/004-readability-score/spec.md` com os valores computados pela implementação real (`palavras: 8`, `silabas: 19`, `score: 39.79`, `classificacao: "Dificil"`), adicionando uma nota explicativa sobre os critérios de contagem de termos alfabéticos.
