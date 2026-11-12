# Feature Specification: Integração com SonarCloud — R2

**Branch**: `ci/issue-153-integracao-sonarcloud`
**Criado em**: 2026-06-30
**Status**: Draft
**Issue**: #153

## Objetivo

Implementar a análise de qualidade estática contínua de código do CrivoAI por meio da integração do **SonarCloud** (SonarQube) na esteira de CI/CD do GitHub Actions. O objetivo é mensurar automaticamente métricas de legibilidade, bugs potenciais, falhas de segurança (vulnerabilidades), duplicações e cobertura de testes em cada commit e Pull Request enviado aos branches `dev` e `main`.

---

## Contexto

Atualmente, o projeto possui linters estáticos locais (`black`, `flake8` no backend, `eslint` no frontend) e testes automatizados. Contudo, não há um painel unificado e histórico de débito técnico ou qualidade. O **SonarCloud** é o padrão recomendado para equipes ágeis, provendo visualizações em tempo real das barreiras de qualidade (*Quality Gates*).

---

## Escopo

### Incluído

- **Configuração de Propriedades (`sonar-project.properties`)**:
  - Definição de escopo de fontes e testes para monorepo (pasta `/backend` e `/frontend`).
  - Exclusão de ruídos de arquivos gerados (builds do Next.js, dependências `node_modules`, `.venv`, pastas de cache e banco local do Prisma).
- **Geração de Cobertura de Testes (Coverage)**:
  - Backend: Ajuste do `pytest` para gerar relatório XML de cobertura (`coverage.xml`).
  - Frontend: Configuração de upload de cobertura Jest (`lcov.info`).
- **Integração no GitHub Actions (`.github/workflows/main.yml`)**:
  - Upload e download de artefatos de cobertura entre estágios de jobs.
  - Job específico de análise SonarCloud rodando após a conclusão bem-sucedida dos testes do backend e do frontend.

### Fora de Escopo

- Configuração de análise SonarCloud em ambientes de nuvem locais (auto-hospedados).
- Correção de débitos técnicos legados que a ferramenta apontar (devem ser abertos como issues futuras).

---

## Critérios de Aceite

1. O arquivo `sonar-project.properties` na raiz do projeto deve estar configurado corretamente para o escopo do monorepo (separando código de backend em Python e frontend em TypeScript).
2. O workflow de CI/CD no GitHub Actions deve ser atualizado para incluir um job final de análise que consiga importar os relatórios de cobertura gerados nos jobs de testes anteriores.
3. O build do pipeline do GitHub Actions deve completar com sucesso em Pull Requests, publicando os resultados no painel da organização no SonarCloud.
