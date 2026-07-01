# Test Plan: Ingestão de Leis e Treinamento do LegalBERT-pt

**Spec**: `specs/006-ingestion-training-legalbert/spec.md`

Este documento especifica a estratégia de validação e TDD para a funcionalidade de ingestão e treinamento real do LegalBERT-pt.

## Estratégia de Mocking e Testes de Backend

Para os testes de integração e unitários no CI (que não dispõem de pesos locais treinados nem devem fazer download remoto), a lógica de carregamento do classificador continuará utilizando injeção de dependências e tokenizadores/modelos dublês (mockados). 

### Cenários

#### Rota de Leis com Filtro — `api/laws.py`

| ID | Cenário | Critério |
| --- | --- | --- |
| LW-1 | `GET /laws` sem query parameter | Retorna apenas leis de tipo `USER_UPLOAD` (compatibilidade). |
| LW-2 | `GET /laws?source_type=CATALOG` | Retorna apenas as leis persistidas no catálogo. |
| LW-3 | `GET /laws?source_type=INVALID` | Retorna erro ou array vazio (conforme tratamento adotado). |

#### Provedor de Análise Local — `services/analysis_provider.py`

| ID | Cenário | Critério |
| --- | --- | --- |
| PV-1 | Carregamento sem modelo local | O provider faz fallback para o modelo remoto configurado. |
| PV-2 | Carregamento com modelo local presente | O provider carrega os pesos da pasta local `fine_tuned_legalbert` e a inferência funciona. |

#### Script de Treinamento — `scripts/train_classifier.py`

| ID | Cenário | Critério |
| --- | --- | --- |
| TR-1 | Carregamento de dataset JSON | O script lê com sucesso e valida que possui os campos requeridos (`text`, `labels`). |
| TR-2 | Execução de Treino (CPU) | O script executa o fine-tuning sobre uma massa de dados mínima e gera arquivos de pesos binários. |

#### Script de Ingestão — `scripts/ingest_catalog.py`

| ID | Cenário | Critério |
| --- | --- | --- |
| IG-1 | Ingestão no catálogo | O script cria a lei com `sourceType = CATALOG` e associa o registro de `Analysis` no banco de dados. |

## Validação Manual e Integração de Interface

A validação de que a classificação é de fato **real e integrada** com o frontend Next.js será efetuada localmente por meio dos seguintes passos:

1. **Treinamento e Pesos Locais**:
   Executar o script de treino para gerar o modelo local.
   Verificar que a pasta `backend/app/models/fine_tuned_legalbert/` foi criada e populada com os arquivos do modelo (como `config.json`, `pytorch_model.bin` ou `model.safetensors`).
   
2. **Ingestão**:
   Executar o script de ingestão e verificar que as tabelas `laws` e `analyses` possuem registros correspondentes ao tipo `CATALOG`.

3. **Inferência sob demanda**:
   Fazer upload de um texto novo no frontend (ex.: contendo jargão vago ou ambíguo) e validar que a análise gerada apresenta predições calibradas que variam de acordo com o texto submetido.

4. **Navegação do Catálogo**:
   Validar que o frontend consome a rota atualizada e permite a listagem das leis do Catálogo na tela.
