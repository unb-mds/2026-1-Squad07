# Tasks: Integração com SonarCloud — R2

**Feature**: Integração com SonarCloud
**ID da Spec**: `specs/006-sonarcloud-integration`

Mapeamento de tarefas e status de implementação da integração da análise de qualidade estática contínua com SonarCloud e relatórios de testes na esteira de CI/CD.

---

## Lista de Tarefas (Tasks)

- [x] **Task 1: Elaboração das especificações e planos SDD/TDD**
  - Mapear escopo, critérios de aceitação e plano de testes para monorepo.
  - Criar os arquivos `spec.md`, `plan.md` e `test-plan.md` em `specs/006-sonarcloud-integration/`.
  
- [x] **Task 2: Configuração de propriedades do SonarCloud**
  - Criar o arquivo `sonar-project.properties` na raiz do projeto com metadados do projeto, exclusões e caminhos de cobertura.

- [x] **Task 3: Atualização do pipeline de CI/CD no backend**
  - Ajustar o pytest no workflow `.github/workflows/main.yml` para gerar o arquivo de cobertura em XML (`--cov-report=xml`).
  - Adicionar a etapa de upload do relatório `backend/coverage.xml` como artefato (`actions/upload-artifact@v4`).

- [x] **Task 4: Atualização do pipeline de CI/CD no frontend**
  - Adicionar a etapa de upload do relatório de cobertura do Jest (`frontend/coverage/lcov.info`) no job do frontend em `main.yml`.

- [x] **Task 5: Criação do estágio de análise do SonarCloud no pipeline**
  - Criar o job `sonarcloud` no workflow `.github/workflows/main.yml`.
  - Configurar dependências do job com `needs: [tests, frontend-tests]`.
  - Adicionar etapas de download de artefatos (`actions/download-artifact@v4`) para backend e frontend.
  - Integrar a action oficial `sonarsource/sonarcloud-github-action@master` parametrizada com o `SONAR_TOKEN`.

- [x] **Task 6: Vinculação e Configuração do Token no SonarCloud e GitHub (Administrativa)**
  - Realizar o login na plataforma SonarCloud.
  - Adicionar o repositório `2026-1-Squad07` e obter o token.
  - Salvar o token como a Repository Secret `SONAR_TOKEN` nas configurações do GitHub.

- [ ] **Task 7: Execução de fumaça e validação do pipeline de PR**
  - Abrir o Pull Request para a branch `dev`.
  - Validar a execução de ponta a ponta do GitHub Actions (verificar logs do SonarCloud Scan e download de artefatos).
  - Confirmar a injeção do comentário de qualidade no PR no GitHub e hidratação do painel na UI do SonarCloud.
