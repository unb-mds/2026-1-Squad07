# Test Plan: Cálculo de Score de Legibilidade (Flesch-Kincaid) - R2

**Spec**: [spec.md](spec.md)
**Data**: 2026-06-22

## Objetivo do Teste

Validar a precisão matemática do cálculo da Facilidade de Leitura de Flesch para o português. Isso inclui provar o correto funcionamento da heurística de contagem silábica e segmentação de sentenças legislativas, bem como validar as regras de validação Pydantic e contratos de rede do endpoint `/api/v1/laws/readability`.

## Estratégia TDD

1. **Fase RED**: Escrever e registrar os testes unitários e de integração no pytest antes de programar a solução. Executar os testes e confirmar que falham.
2. **Fase GREEN**: Desenvolver o serviço e a rota de forma incremental para que todos os casos de teste passem sem erros.
3. **Fase REFACTOR**: Limpar e otimizar o código de produção mantendo a suite de testes verde. A cobertura mínima do novo código deve ser de 90%.

## Casos de Teste

### Área 1: Contagem de Palavras

* **TDD-001 (Happy Path)**:

    * *Tipo*: Unitário
    * *Procedimento*: Executar `contar_palavras("O gato subiu no telhado.")`
    * *Resultado esperado*: Retorna `5` (contagem de palavras alfabéticas padrão).
* **TDD-002 (Bad Path)**:
    * *Tipo*: Unitário
    * *Procedimento*: Executar `contar_palavras("A lei - conforme previsto - deve passar § 2º.")`
    * *Resultado esperado*: Retorna `6` (conta apenas palavras alfabéticas, descartando pontuações e símbolos soltos como `-`, `§` e `2º`).

### Área 2: Segmentação de Frases
*   **TDD-003 (Happy Path)**:
    *   *Tipo*: Unitário
    *   *Procedimento*: Executar `contar_frases("Esta lei é clara. Ela dispõe sobre o tema.")`
    *   *Resultado esperado*: Retorna `2` (frases separadas por pontos finais padrão).
*   **TDD-004 (Bad Path)**:
    *   *Tipo*: Unitário
    *   *Procedimento*: Executar `contar_frases("Art. 1º. Esta lei dispõe sobre qualidade legislativa. Inc. I. Aplica-se ao processo.")`
    *   *Resultado esperado*: Retorna `2` (ignora os pontos finais após as abreviações legislativas `Art.` e `Inc.`, delimitando as frases reais).

### Área 3: Cálculo do Score & Faixas de Classificação
*   **TDD-005 (Happy Path)**:
    *   *Tipo*: Unitário
    *   *Procedimento*: Forçar scores específicos na função de classificação em limites críticos: `29.9`, `30.0`, `30.1`, `50.0`, `50.1`, `70.0`, `70.1`, `100.0`.
    *   *Resultado esperado*: Retorna respectivamente: `"Muito dificil"`, `"Muito dificil"`, `"Dificil"`, `"Dificil"`, `"Medio"`, `"Medio"`, `"Facil"`, `"Facil"`.
*   **TDD-006 (Bad Path)**:
    *   *Tipo*: Unitário
    *   *Procedimento*: Executar `calcular_score` passando texto vazio `""` ou contendo apenas caracteres especiais como `"@#$ %^&*"`
    *   *Resultado esperado*: Retorna de forma segura `score = 0.0`, `classificacao = "Muito dificil"`, e `metricas = {"palavras": 0, "frases": 0, "silabas": 0}`, evitando erros de divisão por zero.

### Área 4: Endpoint HTTP (Integração)
*   **TDD-007 (Happy Path)**:
    *   *Tipo*: Integração
    *   *Procedimento*: Submeter via `TestClient` o `POST /api/v1/laws/readability` com o payload `{"texto": "Fica instituído o regime especial."}`
    *   *Resultado esperado*: Retorna status `200 OK` com o JSON de resposta exato:<br>`{ "score": 6.88, "classificacao": "Muito dificil", "metricas": { "palavras": 5, "frases": 1, "silabas": 14 } }`.
*   **TDD-008 (Bad Path)**:
    *   *Tipo*: Integração
    *   *Procedimento*: Submeter via `TestClient` o `POST /api/v1/laws/readability` com payload inválido de texto vazio `{"texto": ""}` ou tipagem incorreta `{"texto": 12345}`.
    *   *Resultado esperado*: Retorna status `422 Unprocessable Entity` com os detalhes da validação do Pydantic/FastAPI, impedindo a requisição de seguir para a camada de serviços.

## Amostras de Leis Reais para Validação

Para validar manualmente a calibração do score, usaremos dois trechos conhecidos com níveis de complexidade contrastantes:

1. **Amostra 1 (Decreto Administrativo Simples)**:
    * *Texto*: `"Fica instituído o regime especial."`
    * *Métricas esperadas*: 5 palavras, 1 frase, 13 sílabas.
    * *Score calculado*:
        $$\text{IFL} = 248.835 - 1.015 \times \left(\frac{5}{1}\right) - 84.6 \times \left(\frac{13}{5}\right) = 248.835 - 5.075 - 219.96 = 23.8$$
        *(Atenção: Frases excessivamente curtas podem produzir scores baixos de IFL quando a média de sílabas por palavra é alta. Faremos testes detalhados de calibração no TDD).*
2. **Amostra 2 (Complexidade Legislativa Real - Art. 1º da CF/88)**:
    * *Texto*: `"A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito e tem como fundamentos:"`
    * *Métricas estimadas*: 29 palavras, 1 frase, 73 sílabas.
    * *Score calculado*:
        $$\text{IFL} = 248.835 - 1.015 \times \left(\frac{29}{1}\right) - 84.6 \times \left(\frac{73}{29}\right) \approx 248.835 - 29.435 - 212.937 \approx 6.46$$
        *(Classificação: `"Muito dificil"`, condizente com a alta carga de termos técnicos e prolixidade).*

## Validação Manual

-[ ] Executar o backend localmente com `uvicorn app.main:app --reload`.
-[ ] Acessar `http://localhost:8000/docs` (Swagger UI) e fazer a requisição manual no endpoint `POST /api/v1/laws/readability`.
-[ ] Certificar que o tempo de resposta é $< 50\text{ ms}$.

## Validação Automatizada

-[ ] Executar os testes via terminal:

  ```bash
  cd backend
  pytest tests/unit/test_readability_service.py tests/integration/test_readability_routes.py
  ```

-[ ] Executar testes de cobertura para validar o limite mínimo de 90%:

  ```bash
  pytest --cov=app --cov-report=term-missing --cov-fail-under=90
  ```

## Evidências Esperadas

-Saída no terminal atestando a aprovação de todos os testes da suite (`pytest`).
-Relatório de cobertura de código do pytest demonstrando 100% de cobertura no arquivo `backend/app/services/readability.py`.
