# Test Plan: Integração com SonarCloud — R2

**Feature**: Integração com SonarCloud
**ID da Spec**: `specs/006-sonarcloud-integration`

## Objetivos do Teste

Garantir que a esteira de CI consiga extrair, compilar e exportar os relatórios de cobertura de testes do backend (Pytest) e do frontend (Jest), que a Action do SonarCloud seja acionada no momento correto, e que os dados de qualidade estática sejam injetados com êxito no dashboard do SonarCloud sem quebrar o pipeline principal.

---

## 1. Verificações Locais (Pré-CI)

| ID | Cenário | Ações | Resultado Esperado |
|---|---|---|---|
| **TC-01** | Validação sintática do properties | Analisar a raiz do projeto e verificar a presença do arquivo `sonar-project.properties` | O arquivo deve estar no diretório raiz e com chaves bem declaradas (Organization, ProjectKey, caminhos corretos). |
| **TC-02** | Geração de cobertura no backend | Ir para `backend/` e executar os testes gerando o XML de cobertura: `pytest tests/unit/ --cov=app --cov-report=xml` | Gerar o arquivo `backend/coverage.xml` de forma íntegra contendo o mapeamento XML de linhas testadas. |
| **TC-03** | Geração de cobertura no frontend | Ir para `frontend/` e rodar os testes: `npm run test:coverage` | Criar o arquivo `frontend/coverage/lcov.info` mapeando as linhas testadas dos componentes. |

---

## 2. Testes de Integração na Esteira (GitHub Actions)

Uma vez que a branch for submetida ao repositório remoto, validar os seguintes estados de execução no GitHub Actions:

### Cenário 1: Sequenciamento dos Jobs (Grafo de Execução)
1. Acessar a aba **Actions** no repositório do GitHub.
2. Abrir a execução correspondente ao Pull Request da branch `ci/issue-153-integracao-sonarcloud`.
3. Validar se o job `sonarcloud` só inicia a execução **após** a conclusão com sucesso (ícone verde) dos jobs `tests` (backend) e `frontend-tests` (frontend).

### Cenário 2: Upload & Download de Artefatos
1. Entrar nos detalhes de log dos jobs `tests` e `frontend-tests` e verificar a etapa de upload (`actions/upload-artifact@v4`).
2. Entrar no log do job `sonarcloud` e verificar a etapa de download (`actions/download-artifact@v4`).
3. Confirmar que os caminhos baixados correspondem a:
   * `backend/coverage.xml`
   * `frontend/coverage/lcov.info`

### Cenário 3: Autenticação e Envio ao SonarCloud
1. No log do job `sonarcloud`, verificar o andamento do passo `SonarCloud Scan`.
2. Validar o log de saída do scanner da action:
   * Deve localizar o arquivo `sonar-project.properties`.
   * Deve reportar: `INFO: Sensor Python Code Quality [sonarpython] ...`
   * Deve reportar: `INFO: Sensor JavaScript/TypeScript Analysis [javascript] ...`
   * Deve processar com sucesso a leitura dos relatórios de cobertura do Python e JavaScript.
   * Deve retornar: `INFO: ANALYSIS SUCCESSFUL, you can find the results at: https://sonarcloud.io/dashboard?id=...`

---

## 3. Validação do Dashboard (Painel SonarCloud)

1. Acessar a URL do painel do SonarCloud: `https://sonarcloud.io/project/overview?id=unb-mds_2026-1-Squad07`.
2. Verificar se a branch `ci/issue-153-integracao-sonarcloud` foi analisada.
3. Validar se o indicador de **Coverage (Cobertura)** exibe o percentual consolidado dos testes unitários de backend e frontend.
4. Validar se os indicadores de **Bugs**, **Vulnerabilidades**, **Security Hotspots** e **Code Smells** estão povoados corretamente com os dados da branch.
