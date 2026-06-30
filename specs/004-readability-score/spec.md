# Feature Specification: Cálculo de Score de Legibilidade (Flesch-Kincaid) - R2

**Branch**: `feat/issue-132-calculo-score-legibilidade`
**Criado em**: 2026-06-22
**Status**: Draft
**Issue**: #132
**Entrada**: Texto legislativo bruto

## Objetivo

Implementar o cálculo real do score de legibilidade técnica de proposições legislativas no backend do CrivoAI. O cálculo utilizará o **Índice de Facilidade de Leitura de Flesch (IFL)** adaptado para a língua portuguesa, gerando métricas objetivas de contagem de palavras, frases e sílabas, e disponibilizando um endpoint de API REST sob o prefixo `/api/v1`.

## Contexto

Atualmente na Release 1, o score retornado pelo sistema é mockado. Na Release 2, o score de legibilidade fornecerá uma análise estática e objetiva, independente de modelos de Machine Learning (como o LegalBERT-pt), sendo útil para dar feedback imediato sobre a complexidade textual de um projeto de lei submetido pelo usuário.

## Público-Target

- **Usuários da plataforma (Cidadãos, POs, Assessores Legislativos)**: que desejam avaliar a facilidade de leitura de um texto legal sob análise.
- **Desenvolvedores do Frontend**: que consomem a rota para exibir o score em badges e painéis.

## Escopo

### Incluído

- Módulo utilitário `backend/app/services/readability.py` com a função `calcular_score(texto: str) -> dict`.
- Heurística otimizada em Python puro para contagem de frases, palavras e sílabas em português (sem dependências pesadas adicionais).
- Novo router `laws_v1` em `backend/app/api/laws.py` para expor o endpoint `POST /api/v1/laws/readability`.
- Registro do novo router no arquivo de entrada do FastAPI `backend/app/main.py`.
- Suite de testes unitários em `backend/tests/unit/test_readability_service.py` e testes de integração em `backend/tests/integration/test_readability_routes.py`.
- Meta de cobertura de código no novo serviço e rotas `>= 90%`.

### Fora de Escopo

- Integrar e exibir visualmente o score no frontend Next.js (será tratado na issue subsequente de frontend).
- Classificar por modelo NLP multi-label (LegalBERT-pt), que é tratada na spec de análise (`specs/003-analysis-classifier`).
- Migrações ou alterações no banco de dados (este endpoint realiza processamento sob demanda sem persistência direta).
- Refatoração ou alinhamento das rotas legadas da R1 (ex: `/laws`, `/health`) para o prefixo `/api/v1`.

## Cenários e Testes

### Cenário 1 - Cálculo de legibilidade de texto padrão (Prioridade: P1)

**Como** analista legislativo, **quero** submeter um texto em português, **para** obter o seu score de facilidade de leitura de Flesch e as métricas textuais correspondentes.

**Por que esta prioridade**: É a funcionalidade central do endpoint de legibilidade.

**Teste independente**: Fazer uma requisição HTTP POST para `/api/v1/laws/readability` com um texto de lei real conhecido e validar o retorno com status 200, checando a estrutura JSON e o intervalo do score.

**Critérios de aceite**:

1. **Dado** um payload válido com `"texto": "Art. 1º. Esta lei estabelece regras claras."`,  
   **quando** enviado para `POST /api/v1/laws/readability`,  
   **então** o endpoint retorna status `200 OK` e um objeto com o `score` (float entre 0 e 100), `classificacao` (string) e `metricas` (contendo `palavras`, `frases`, `silabas` como inteiros).

### Cenário 2 - Submissão de texto vazio ou inválido (Prioridade: P1)

**Como** sistema de integração, **quero** enviar requisições de validação, **para** garantir que o backend recuse textos vazios ou payloads malformados.

**Critérios de aceite**:

1. **Dado** um payload com campo `"texto"` vazio `""` ou ausente,  
   **quando** enviado para `POST /api/v1/laws/readability`,  
   **então** o backend retorna status `422 Unprocessable Entity` com detalhes da validação.

## Requisitos

- **REQ-001**: O sistema DEVE calcular a facilidade de leitura usando a fórmula adaptada para o português brasileiro:  
  $$Score = 248.835 - 1.015 \times \left(\frac{\text{palavras}}{\text{frases}}\right) - 84.6 \times \left(\frac{\text{sílabas}}{\text{palavras}}\right)$$
- **REQ-002**: O sistema DEVE classificar o score calculado nas seguintes faixas:
  - $0 \le Score \le 30$: `"Muito dificil"`
  - $30 < Score \le 50$: `"Dificil"`
  - $50 < Score \le 70$: `"Medio"`
  - $70 < Score \le 100$: `"Facil"`
- **REQ-003**: O sistema DEVE delimitar frases de forma a ignorar falsos positivos de pontos finais causados por abreviações legislativas comuns (`Art.`, `Al.`, `Inc.`, `Par.`, `fl.`).
- **REQ-004**: O sistema DEVE normalizar e limpar pontuações antes da contagem de palavras, descartando pontuações e símbolos não-alfabéticos isolados (ex: `§`, `º`, `-`).
- **REQ-005**: O endpoint DEVE aceitar apenas requisições POST contendo o payload `{ "texto": str }` e validar que o texto não é vazio.
- **REQ-006**: A cobertura de testes do módulo de legibilidade (`readability.py`) e suas rotas DEVE ser de no mínimo `90%`.

## Dados de Entrada e Saída

### Entradas

- HTTP POST Payload:

  ```json
  {
    "texto": "Art. 1º Este regulamento dispõe sobre as regras aplicáveis."
  }
  ```

> **Nota**: O símbolo ordinal `1º` não é contabilizado como palavra, pois a contagem considera apenas tokens estritamente alfabéticos (REQ-004). O articulador `Art.` também é excluído da contagem por ser uma abreviação (REQ-003).
>
> **Nota sobre Siglas**: Siglas como STF e AGU têm pronúncias soletradas (S-T-F = 3 sílabas; A-G-U = 3 sílabas) que a contagem baseada em núcleos vocálicos nativos subestima (STF vira 1 e AGU vira 2). Essa é uma limitação estatística inerente aceitável.

### Saídas

- HTTP Response (200 OK):

  ```json
  {
    "score": 39.79,
    "classificacao": "Dificil",
    "metricas": {
      "palavras": 8,
      "frases": 1,
      "silabas": 19
    }
  }
  ```

## Regras de Negócio

- **RN-001 (Limites do Score)**: Se o cálculo matemático resultar em um valor menor que 0.0, o score deve ser truncado para `0.0`. Se resultar em um valor maior que 100.0, deve ser truncado para `100.0`.
- **RN-002 (Divisão por zero)**: Se o texto possuir zero palavras ou zero frases após processamento, o score retornado deve ser `0.0` e a classificação deve ser `"Muito dificil"` para evitar exceções de divisão por zero.
- **RN-003 [NEEDS CLARIFICATION]**: A classificação informada na issue possui limites inclusivos duplicados (ex: 30-50, 50-70). Adotaremos o padrão matemático exclusor do limite inferior (`30 < score <= 50` para "Dificil", etc.) para sanar a ambiguidade.

## Casos de Erro e Estados Inválidos

- **ERR-001**: **Dado** um payload malformado (ex: JSON corrompido ou campo `"texto"` tipado como número), **quando** submetido a `POST /api/v1/laws/readability`, **então** retorna `422 Unprocessable Entity`.
- **ERR-002**: **Dado** um texto composto exclusivamente por caracteres especiais, pontuações ou espaços (ex: `" @#$ %^&* "`), **quando** processado, **então** o sistema lança um erro de negócio resultando em HTTP `400 Bad Request`, impedindo análises de textos sem palavras válidas.

## Critérios de Sucesso

- **SC-001**: Endpoint retorna o JSON de resposta corretamente estruturado.
- **SC-002**: O cálculo do score bate com os casos de teste pré-definidos para textos em português.
- **SC-003**: Cobertura de código testado do backend `>= 90%`.

## Referências

- Issue #132 do GitHub
- Estratégia de TDD para R2: `docs/sdd/tdd-estrategia-r2.md`
- Padrões de Projeto do Backend: `docs/architecture/design-patterns.md`
- Estrutura de Pastas do Backend: `docs/architecture/directory-structure.md`
