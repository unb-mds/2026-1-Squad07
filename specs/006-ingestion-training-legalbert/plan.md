# Plano de Implementação: Ingestão de Leis e Treinamento do LegalBERT-pt

**Spec**: `specs/006-ingestion-training-legalbert/spec.md`

## Visão Geral

Este plano detalha a implementação técnica para o fine-tuning offline do classificador LegalBERT-pt, a ingestão automatizada do catálogo e a modificação do backend para carregar os pesos ajustados locais, culminando na integração real com o frontend.

```
+-----------------------------------+
|      backend/data/dataset_laws.json|
+-----------------+-----------------+
                  |
         +--------+--------+
         |                 |
         v                 v
+--------+--------+  +-----+-----------+
|train_classifier |  |ingest_catalog   |
+--------+--------+  +-----+-----------+
         |                 |
         v (pesos)         v (banco de dados)
+--------+--------+  +-----+-----------+
| fine_tuned_    |  | Laws/Analyses   |
| legalbert      |  | em PostgreSQL   |
+--------+--------+  +-----+-----------+
         |                 ^
         v (carrega local) |
+--------+--------+        |
|FastAPI Backend  +--------+
|(/evaluate)      | (busca/análise online)
+--------+--------+
         ^
         |
+--------+--------+
|Next.js Frontend |
+-----------------+
```

## Decisões de Design

| # | Decisão | Justificativa |
| --- | --- | --- |
| P1 | Dataset em formato JSON unificado em `backend/data/dataset_laws.json`. | Simplicidade e facilidade de leitura tanto para o script de treino quanto de ingestão. |
| P2 | Treinamento configurado com `Trainer` do Hugging Face voltado para CPU. | Permite que desenvolvedores rodem o fine-tuning localmente em poucos segundos (ex: 3 épocas, dataset pequeno ~30 registros focados) sem requerer GPUs dedicadas. |
| P3 | Carregamento dinâmico e preguiçoso no `LegalBERTProvider`. | O provider checa se o diretório `backend/app/models/fine_tuned_legalbert` existe e contém o arquivo de configuração e pesos. Em caso afirmativo, carrega os pesos locais. Caso contrário, faz fallback para o modelo remoto (preservando o funcionamento padrão se o treino não tiver sido executado). |
| P4 | O script de ingestão persiste tanto leis quanto análises associadas. | Garante que as leis do catálogo possuam resultados de análises pré-calculadas e consistentes com o modelo recém-treinado. |
| P5 | Filtro opcional `source_type` na rota `GET /laws`. | Permite obter submissões de usuários (padrão) ou leis do catálogo na mesma rota de forma flexível e sem quebrar contratos da R1. |
| P6 | Exclusão de pesos binários no `.gitignore`. | Arquivos de pesos binários (`*.bin`, `*.safetensors`) gerados no fine-tuning são ignorados no Git para manter o tamanho do repositório controlado. |

## Mapeamento de Arquivos e Alterações

### ML e Scripts Offline

#### [NEW] [dataset_laws.json](file:///c:/Users/pluca/2026-1-Squad07/backend/data/dataset_laws.json)
Contém o array de leis anotadas. Exemplo de estrutura:
```json
[
  {
    "id": "cat-dados-pessoais-2026",
    "title": "Lei de Proteção de Dados Pessoais",
    "text": "Art. 1º. Os dados pessoais devem ser protegidos contra acesso não autorizado. Art. 2º. O tratamento ocorrerá por tempo indeterminado nas hipóteses cabíveis.",
    "lawNumber": "L 13709",
    "jurisdiction": "Nacional",
    "publicationDate": "2026-05-01T00:00:00Z",
    "labels": {
      "ambiguidade": 0.0,
      "vagueza": 1.0,
      "falta_referencia": 0.0,
      "inconsistencia": 0.0
    }
  }
]
```

#### [NEW] [train_classifier.py](file:///c:/Users/pluca/2026-1-Squad07/backend/scripts/train_classifier.py)
Script Python que:
1. Inicializa o tokenizador e carrega o dataset JSON.
2. Cria um Dataset PyTorch estendendo `torch.utils.data.Dataset`.
3. Carrega o classificador remoto `raquelsilveira/legalbertpt_fp` com 4 labels de classificação multi-label.
4. Configura `TrainingArguments` com quantidade de épocas reduzida (~3-5), batch size adequado e otimizador leve para rodar em CPU.
5. Executa a classe `Trainer` e salva os pesos na pasta `backend/app/models/fine_tuned_legalbert`.

#### [NEW] [ingest_catalog.py](file:///c:/Users/pluca/2026-1-Squad07/backend/scripts/ingest_catalog.py)
Script Python que:
1. Conecta-se ao banco de dados via Prisma ORM (`db`).
2. Lê o arquivo JSON `dataset_laws.json`.
3. Cria a lei com `sourceType = CATALOG` se não existir.
4. Executa a inferência com o modelo treinado (ou salva as anotações do JSON como uma análise associada) e grava o registro na tabela `Analysis` (relacionada a `Law`).

### Core Backend FastAPI

#### [MODIFY] [analysis_provider.py](file:///c:/Users/pluca/2026-1-Squad07/backend/app/services/analysis_provider.py)
- Alterar o método `_ensure_loaded` do `LegalBERTProvider` para verificar se `backend/app/models/fine_tuned_legalbert` existe e contém arquivos.
- Se sim, carregar o tokenizer e o modelo a partir do diretório local.
- Se não, utilizar o valor padrão remoto `raquelsilveira/legalbertpt_fp`.

#### [MODIFY] [laws.py](file:///c:/Users/pluca/2026-1-Squad07/backend/app/api/laws.py)
- Alterar a rota `GET /laws` para receber um parâmetro de query opcional `source_type: str = "USER_UPLOAD"`.
- Modificar a consulta no Prisma: `where={"sourceType": source_type}`.
- Isso possibilita filtrar por catálogo (`CATALOG`) ou submissões de usuários (`USER_UPLOAD`).

#### [MODIFY] [.gitignore](file:///c:/Users/pluca/2026-1-Squad07/.gitignore)
- Adicionar a seguinte regra:
  ```text
  # Modelo local treinado do LegalBERT-pt
  backend/app/models/fine_tuned_legalbert/
  ```

#### [MODIFY] [requirements.txt](file:///c:/Users/pluca/2026-1-Squad07/backend/requirements.txt)
- Garantir a presença de `transformers`, `torch` e `scikit-learn` para execução local dos scripts de ML.

### Frontend Next.js

#### [MODIFY] [laws.ts](file:///c:/Users/pluca/2026-1-Squad07/frontend/src/lib/api/laws.ts)
- Atualizar a assinatura da função `listLawSubmissions(sourceType?: string)` para enviar o query parameter opcional:
  ```typescript
  export function listLawSubmissions(sourceType: string = "USER_UPLOAD") {
    return apiRequest<LawSubmissionListItem[]>(`/laws?source_type=${encodeURIComponent(sourceType)}`);
  }
  ```

## Estratégia de Testes

Os testes automatizados cobrirão os novos fluxos de carregamento de pesos e extensão de rotas. O treinamento em si será verificado por asserções de saída de pesos, e o pipeline de ML será validado com modelo mockado para não baixar pesos no CI do GitHub Actions.
