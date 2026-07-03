# Implementation Plan: Cálculo de Score de Legibilidade (Flesch-Kincaid) - R2

**Branch**: `feat/issue-132-calculo-score-legibilidade`
**Data**: 2026-06-22
**Spec**: [spec.md](spec.md)

## Resumo

Implementar uma função utilitária em Python puro para contagem heurística de sílabas e cálculo do IFL (Índice de Facilidade de Leitura) de Flesch adaptado para o português brasileiro. Expor este serviço sob o endpoint `POST /api/v1/laws/readability` com validação de payload através do Pydantic. Todo o desenvolvimento será guiado por testes unitários e de integração (TDD).

## Contexto Técnico ou Documental

- **Tipo de mudança**: backend
- **Áreas afetadas**: backend (novos módulos, novos testes, registro de rotas)
- **Dependências existentes**: FastAPI, pydantic, pytest, pytest-cov
- **Testes/validações**: Testes unitários (`pytest` no serviço) e testes de integração (`pytest` na rota com `TestClient`).
- **Restrições**: Sem novas dependências externas de pacotes no `requirements.txt`. Usar algoritmos lógicos internos e Expressões Regulares (Regex).

## Constitution Check

- [x] Existe spec antes da implementação.
- [x] Existe plano de TDD ou validação.
- [x] A mudança respeita branch/PR e não toca `main`.
- [x] A mudança não contradiz requisitos, escopo ou arquitetura.
- [x] A mudança é mínima para a responsabilidade proposta.

## Estrutura Planejada

```text
specs/004-readability-score/
|-- spec.md
|-- plan.md
|-- test-plan.md
|-- tasks.md
`-- quickstart.md
```

## Abordagem Técnica Detalhada

### 1. Heurística de Contagem de Sílabas (Português)

Como não adicionaremos bibliotecas externas de hifenização, usaremos uma heurística robusta em Python para identificar os núcleos silábicos. Em português, cada sílaba tem exatamente um núcleo vocálico.

**Algoritmo**:

1. Tratar a palavra: converter para minúsculas e limpar pontuações das extremidades.
2. Definir a classe das vogais em português (incluindo acentuações): `[aeiouyáéíóúâêîôûàèìòùãõäëïöü]`.
3. Contar as vogais consecutivas para identificar ditongos e tritongos (que contam como um único núcleo silábico/sílaba):
   - Tritongos comuns: `uai, uei, uia, uio, uou, uem, uam` (ex: *Uruguai*, *enxaguou*).
   - Ditongos comuns: `ai, ae, ao, au, ei, eo, eu, oi, oe, ou, ui, iu, ia, ie, io, ua, ue, uo, ão, ãe, õe, am, em` (na posição final de palavra agem como ditongos nasais).
4. **Hiatos de Vogais Idênticas**: Encontros como `ee` (*veem*), `oo` (*cooperar*) ou `ii` contam como duas sílabas distintas.
5. **Cálculo de Sílabas por Palavra**:
   $$\text{Sílabas} = \text{Total de vogais} - \text{Total de ditongos} - (2 \times \text{Total de tritongos})$$
   *Garantia*: Cada palavra terá no mínimo 1 sílaba.

### 2. Segmentação de Sentenças

Para textos legais que contêm abreviações como `Art. 1º`, `Inc. II`, usaremos uma expressão regular com lookbehind negativo para evitar que pontos finais após abreviações quebrem frases incorretamente:

- **Expressão Regular**: `r'(?<!\b[Aa]rt)(?<!\b[Ii]nc)(?<!\b[Aa]l)(?<!\b[Pp]ar)(?<!\b[Ff]l)(?<!\b[Dd]oc)[.!?](\s+|\n|$)'`
- Isso divide o texto somente onde há pontos finais reais seguidos de espaço/quebra de linha.

### 3. Modelos Pydantic (`backend/app/models/law.py`)

Criaremos estruturas Pydantic para tipagem e validação dos dados de tráfego:

```python
from pydantic import BaseModel, Field

class ReadabilityRequest(BaseModel):
    texto: str = Field(..., min_length=1)

class ReadabilityMetrics(BaseModel):
    palavras: int
    frases: int
    silabas: int

class ReadabilityResponse(BaseModel):
    score: float
    classificacao: str
    metricas: ReadabilityMetrics
```

### 4. Criação da Rota e Integração (`backend/app/api/laws.py`)

Para manter as rotas originais da R1 (como `/laws`) intactas e compatíveis, criaremos um novo router de versão 1 com o prefixo apropriado:

```python
router_v1 = APIRouter(prefix="/api/v1/laws", tags=["laws-v1"])

@router_v1.post("/readability", response_model=ReadabilityResponse)
async def analyze_readability(payload: ReadabilityRequest):
    ...
```

Esse novo router será registrado em `backend/app/main.py` usando `app.include_router(laws.router_v1)`.

## Riscos e Mitigações

| Risco | Mitigação |
| --- | --- |
| Divisão por Zero no cálculo do score para textos curtos ou vazios. | A função `calcular_score` terá verificações prévias: se a quantidade de palavras ou frases for 0, retorna score `0.0` de forma segura. |
| Inconsistência na heurística silábica para palavras estrangeiras. | Tratar apenas caracteres alfabéticos válidos em português; stubs e casos de testes cobrirão palavras comuns e termos jurídicos comuns. |
| Lentidão de regex em textos excessivamente longos (Backtracking). | Usar regex não recursiva e simplificada para contagem de sentenças. |

## Fora de Escopo

- Qualquer implementação no frontend (Next.js) ou integração com tela.
- Qualquer alteração ou persistência no banco de dados Prisma (o processamento é puramente sob demanda).
- Alinhamento de rotas antigas para o prefixo `/api/v1/`.
