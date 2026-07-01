# Feature Specification: Ingestão de Leis e Treinamento do LegalBERT-pt (R2)

**Branch**: `feat/ingestion-training-legalbert`
**Criado em**: 2026-07-01
**Status**: Draft
**Issue**: #86 (motor-inteligência-nlp)
**Depende de**: spec arquitetural [`specs/002-requirements-r2/ai-integration.md`](../002-requirements-r2/ai-integration.md) e [`specs/003-analysis-classifier/spec.md`](../003-analysis-classifier/spec.md)

## Objetivo

Implementar a ingestão de leis em lote para o Catálogo do CrivoAI e realizar o treinamento (fine-tuning) do modelo **LegalBERT-pt** para classificação multi-label real das 4 categorias de problemas legislativos (`ambiguidade`, `vagueza`, `falta_referencia`, `inconsistencia`). O classificador real no backend deve ser carregado a partir dos pesos ajustados localmente e estar totalmente integrado ao frontend Next.js.

## Contexto

Na Release 1, as análises de qualidade de leis eram baseadas em dados simulados (mockados). Na Release 2, o backend FastAPI foi estruturado para suportar a inferência online por meio do `LegalBERTProvider` que carrega de forma preguiçosa o modelo remoto base `raquelsilveira/legalbertpt_fp`.
Como o modelo remoto base é inicializado com uma cabeça de classificação linear aleatória para a nossa taxonomia de 4 classes, as predições online são aleatórias e não calibradas. Esta especificação detalha o fluxo offline de preparação do dataset, fine-tuning do modelo com PyTorch/Transformers, persistência do catálogo de leis e sua integração real com as interfaces de visualização do frontend.

## Público-Target

- **Assessores Legislativos, POs e Cidadãos**: que desejam classificar textos sob demanda e no catálogo obtendo métricas de qualidade reais e calibradas.
- **Desenvolvedores de IA/Backend**: que executam e avaliam o ciclo de vida de treinamento e ingestão do motor de NLP.

## Escopo

### Incluído

- Dataset inicial rotulado em formato JSON `backend/data/dataset_laws.json` contendo exemplos de proposições legislativas anotadas para treino e catálogo.
- Script de fine-tuning `backend/scripts/train_classifier.py` que treina a cabeça de classificação multi-label do LegalBERT-pt utilizando Hugging Face `Trainer`/PyTorch, salvando o modelo ajustado localmente.
- Script de ingestão `backend/scripts/ingest_catalog.py` que popula as tabelas `Law` (com `sourceType = CATALOG`) e `Analysis` no banco de dados.
- Alteração no `LegalBERTProvider` (`backend/app/services/analysis_provider.py`) para carregar o modelo ajustado localmente a partir de `backend/app/models/fine_tuned_legalbert` se ele estiver presente.
- Atualização da rota `GET /laws` do backend (`backend/app/api/laws.py`) e do client de API do frontend para permitir a listagem e o filtro de leis do catálogo.
- Atualização do arquivo `.gitignore` do repositório para evitar o versionamento de arquivos de pesos binários gerados pelo treino.
- Testes unitários para o script de treinamento, ingestão e validações da API.

### Fora de Escopo

- Interface gráfica no frontend para realizar o upload ou disparo do treinamento (o treinamento é considerado uma tarefa offline disparada via terminal pelo time de desenvolvimento).
- Criação de novas categorias além das 4 previstas na taxonomia da R2.
- Processamento assíncrono com filas distribuidas (ex.: Celery/Redis) para o treinamento.

## Requisitos

- **REQ-001**: O sistema DEVE fornecer um dataset inicial em `backend/data/dataset_laws.json` com exemplos textuais curtos/dispositivos em português anotados binariamente para as classes `ambiguidade`, `vagueza`, `falta_referencia` e `inconsistencia`.
- **REQ-002**: O script `train_classifier.py` DEVE ler o dataset JSON e treinar o classificador baseado no `raquelsilveira/legalbertpt_fp` para a classificação multi-label.
- **REQ-003**: O script de treinamento DEVE exportar os pesos ajustados para a pasta `backend/app/models/fine_tuned_legalbert/`.
- **REQ-004**: O `LegalBERTProvider` no backend DEVE carregar o modelo a partir do diretório local `backend/app/models/fine_tuned_legalbert/` se ele contiver pesos válidos, mantendo a carga de forma preguiçosa.
- **REQ-005**: O script `ingest_catalog.py` DEVE persistir as leis do dataset no banco de dados PostgreSQL com `sourceType = CATALOG`, e opcionalmente persistir a análise de qualidade inicial associada a cada uma delas.
- **REQ-006**: A rota `GET /laws` (ou `/api/v1/laws`) do backend DEVE suportar um parâmetro opcional de query `source_type` (podendo assumir `USER_UPLOAD` ou `CATALOG`) para filtrar as leis retornadas. Se não especificado, deve retornar `USER_UPLOAD` para compatibilidade retrógrada.
- **REQ-007**: O frontend Next.js DEVE permitir que o usuário liste as leis do catálogo e veja as suas análises reais.
- **REQ-008**: O arquivo `.gitignore` DEVE excluir a pasta `backend/app/models/fine_tuned_legalbert/`.
- **REQ-009**: A cobertura de código de backend dos novos scripts e arquivos modificados DEVE ser `>= 90%`.

## Critérios de Aceite

- **SC-001**: O script `train_classifier.py` executa com sucesso no terminal e salva o modelo treinado localmente na pasta especificada.
- **SC-002**: O script `ingest_catalog.py` executa e insere leis do tipo `CATALOG` com suas análises no banco.
- **SC-003**: A chamada `POST /api/v1/analysis/evaluate` com o modelo local carregado retorna métricas de qualidade não-aleatórias e coerentes com o texto de teste.
- **SC-004**: A rota `GET /laws?source_type=CATALOG` retorna as leis ingeridas no catálogo.
- **SC-005**: O frontend lista corretamente as leis do catálogo e renderiza suas pontuações e warnings reais.
- **SC-006**: Os testes unitários e de integração passam com sucesso e respeitam a cobertura estabelecida.
