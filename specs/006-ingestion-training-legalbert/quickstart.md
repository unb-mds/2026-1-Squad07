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

## Passo 3: Testar a Inferência no Terminal (Opcional)

Se desejar testar a inferência real do classificador e ver os resultados numéricos diretamente no terminal (sem subir o servidor HTTP), execute:

```bash
# Executar a partir da raiz do backend
python scripts/test_classifier_local.py
```

Você também pode passar um texto personalizado como argumento:
```bash
python scripts/test_classifier_local.py "Art. 1º. Esta regra é muito vaga e obscura sempre que viável."
```

## Passo 4: Iniciar e Validar Localmente (API & Interface)

Inicie os servidores de backend e frontend para validar a integração de ponta a ponta:

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

## Passo 4: Fazer Upload do Modelo para o Hugging Face (Deploy / Produção)

Para evitar que outros membros do time ou servidores (como o Vercel) precisem rodar o script de treinamento localmente, você pode subir o modelo treinado local diretamente para o Hugging Face Hub:

```bash
# Executar o script de upload (a partir da raiz do backend)
python scripts/upload_model.py
```

O script solicitará o ID do repositório no Hugging Face (ex: `seu-usuario/crivoai-legalbert-classifier`) e seu token de acesso de escrita (`HF Write Token`).

Após o upload, configure a variável de ambiente no seu ambiente de nuvem ou Vercel:

```text
MODEL_NAME=seu-usuario/crivoai-legalbert-classifier
```

Isso garante que o backend FastAPI fará o download e carregamento direto deste modelo treinado automaticamente, eliminando a necessidade de treinamento local.

