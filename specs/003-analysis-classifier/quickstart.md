# Quickstart: validar o classificador de análise

Dois níveis de validação: a **suíte automatizada** (modelo mockado, rápida, é a
que roda no CI) e a **validação manual** com o modelo real + Postgres.

## 1. Suíte automatizada (mockada)

```bash
cd backend
python -m pytest -v            # todos os testes
python -m pytest --cov         # cobertura (meta >= 90%)
black --check app/ tests/
flake8 app/ tests/ --max-line-length=88 --extend-ignore=E501,W503
```

## 2. Validação manual com o modelo real

Requer **Python 3.12** (o `torch` tem wheel para 3.12; em 3.14 ainda não) e
Postgres. O modelo roda em **CPU** (não precisa de GPU).

```bash
# Postgres
docker compose up -d db

# venv 3.12 + dependências (torch CPU-only é bem mais leve)
uv venv --python 3.12 .venv312
source .venv312/bin/activate
uv pip install torch --index-url https://download.pytorch.org/whl/cpu
uv pip install -r backend/requirements.txt

# schema + seed do acervo
export DATABASE_URL="postgresql://postgres:troque_esta_senha@localhost:5432/app_db"
cd backend
prisma generate --schema=prisma/schema.prisma
prisma db push --schema=prisma/schema.prisma
python -m scripts.seed_demo_laws

# subir a API (a 1a inferência baixa e carrega o modelo)
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Em outro terminal:

```bash
LAW=demo-transparencia-algoritmica-2026
TEXT=$(curl -s http://127.0.0.1:8000/laws/$LAW | python -c 'import sys,json;print(json.load(sys.stdin)["text"])')

# evaluate com lei real -> persiste; repetir mostra cached:true e nova entrada no historico
curl -s -X POST http://127.0.0.1:8000/api/v1/analysis/evaluate \
  -H 'Content-Type: application/json' \
  -d "$(python -c 'import json,os;print(json.dumps({"text":os.environ["TEXT"],"type":"bill","lawId":os.environ["LAW"]}))' TEXT="$TEXT" LAW="$LAW")"

# mais recente e historico
curl -s http://127.0.0.1:8000/api/v1/laws/$LAW/analysis
curl -s http://127.0.0.1:8000/api/v1/laws/$LAW/history
```

### O que esperar

- `evaluate` retorna `score`, `metrics` (4 categorias), `warnings`
  (`code`/`message`/`confidence`), `model_version` e `cached`.
- Segunda chamada idêntica: `cached: true` (e ainda assim grava no histórico
  quando há `lawId`).
- Texto acima de 512 tokens é dividido em chunks e agregado por média.
- `lawId` inexistente → `404`; lei sem análise em `/analysis` → `404`.

> Observação: enquanto não houver checkpoint treinado, o head de classificação é
> não treinado e os scores ficam em torno de 0.5 — o objetivo desta validação é a
> integração, não a qualidade das predições.
