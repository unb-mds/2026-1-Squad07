# Quickstart: Ingestão de Leis e Treinamento do LegalBERT-pt

**Spec**: `specs/006-ingestion-training-legalbert/spec.md`

Este guia rápido explica como preparar o ambiente, rodar o fine-tuning do classificador LegalBERT-pt e efetuar a ingestão das leis do catálogo no banco de dados.

## Pré-requisitos

Certifique-se de que as dependências do backend estão instaladas e o banco de dados PostgreSQL está ativo via Docker.

```bash
# Acessar a pasta backend e instalar dependências
cd backend
pip install -r requirements.txt
```

## Passo 1: Executar o Treinamento do Modelo (Fine-tuning)

O treinamento processa o dataset JSON local em `backend/data/dataset_laws.json` e realiza o fine-tuning da cabeça de classificação do `raquelsilveira/legalbertpt_fp` para as 4 categorias em português.

Para iniciar o treino (configurado por padrão para rodar em CPU local em poucos segundos com um conjunto de dados representativo reduzido):

```bash
# Executar a partir da raiz do backend
python scripts/train_classifier.py
```

Após a conclusão, confirme que a pasta `backend/app/models/fine_tuned_legalbert/` foi criada e contém os pesos (ex.: `config.json`, `pytorch_model.bin` ou `model.safetensors`).

> **Nota**: Essa pasta está no `.gitignore` e não será enviada ao repositório remoto.

## Passo 2: Executar a Ingestão do Catálogo no Banco

Com o modelo treinado, podemos carregar as leis de demonstração e catálogo no banco de dados do CrivoAI. O script de ingestão cria os registros de leis (`sourceType = CATALOG`) e calcula a qualidade de cada uma salvando o resultado em `Analysis`:

```bash
# Executar a partir da raiz do backend
python scripts/ingest_catalog.py
```

## Passo 3: Iniciar e Validar Localmente

Inicie os servidores de backend e frontend para validar a integração:

**Backend:**
```bash
cd backend
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Abra `http://localhost:3000` no seu navegador, acesse os detalhes de uma lei do catálogo e verifique que as pontuações e classificações de erros (`ambiguidade`, `vagueza`, `falta_referencia`, `inconsistencia`) mostram os valores e warnings reais gerados pelo classificador ajustado.
