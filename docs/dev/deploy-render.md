# Deploy do CrivoAI — Backend + Modelo no Render (e Frontend no Vercel)

Tutorial passo a passo para colocar o CrivoAI em produção com:

- **Frontend (Next.js)** → **Vercel**
- **Backend (FastAPI + ML)** → **Render** (via Docker)
- **Banco (PostgreSQL)** → **Render Postgres** (managed)
- **Modelo fine-tunado (LegalBERT-pt)** → **Hugging Face Hub**, "assado" na imagem Docker no build

> ⚠️ **Por que não dá pra rodar o backend no Vercel:** `torch` + `transformers` + os
> pesos do modelo (~416 MB) estouram o limite de 250 MB de bundle serverless do
> Vercel. Por isso o backend vai num container no Render.

> ⚠️ **Por que precisa levar o modelo treinado:** carregado sem os pesos
> fine-tunados, o classificador fica com a **cabeça de classificação aleatória**
> (previsões sem sentido). O modelo atual é *weak-label* (F1-macro ~0.53, com
> falsos positivos) — funciona como v1, mas ainda não é "confiável". Reveja os
> rótulos com humanos antes de tratar as métricas como critério de produção.

---

## Visão geral da arquitetura

| Componente | Onde | Observação |
|---|---|---|
| Frontend (Next.js 16) | Vercel | Aponta pro backend via `NEXT_PUBLIC_API_URL` |
| Backend (FastAPI + torch/transformers) | Render (Docker) | Instância com **≥ 1 GB RAM** |
| PostgreSQL | Render Postgres (ou Neon/Supabase) | Prisma via `DATABASE_URL` |
| Modelo LegalBERT-pt | Hugging Face Hub | Baixado no **build** da imagem |

---

## Pré-requisitos

- Conta no [Hugging Face](https://huggingface.co) e no [Render](https://render.com).
- O modelo treinado localmente em `backend/app/models/fine_tuned_legalbert/`
  (rode `scripts/train_classifier.py` se ainda não tiver).
- O `venv` do backend configurado (com `huggingface_hub` instalado — já vem como
  dependência de `transformers`).

---

## Etapa 1 — Subir o modelo treinado no Hugging Face Hub

O repositório já tem o script [`backend/scripts/upload_model.py`](../../backend/scripts/upload_model.py).

1. **Crie um token de escrita** em https://huggingface.co/settings/tokens
   (tipo **Write**).

2. **Crie o repositório do modelo** (pode ser feito pelo próprio script). Decida:
   - **Público** → mais simples, o build não precisa de token. Lembre que o
     modelo weak-label ficará visível.
   - **Privado** → exige o token no build (Etapa 2b).

3. **Rode o upload** (PowerShell, a partir de `backend/`):

   ```powershell
   $env:HF_REPO_ID = "seu-usuario/crivoai-legalbert"
   $env:HF_TOKEN   = "hf_xxxxxxxxxxxxxxxxxxxxx"
   .\.venv\Scripts\python.exe scripts\upload_model.py
   ```

   Ao final ele imprime a URL do modelo e lembra que o backend pode usá-lo via
   `MODEL_NAME=seu-usuario/crivoai-legalbert`.

> 💡 Toda vez que retreinar e quiser publicar uma nova versão, basta rodar o
> `upload_model.py` de novo.

---

## Etapa 2 — Preparar o backend para o Render

Três ajustes no código/infra. Aplique e faça commit **antes** de conectar no Render.

### 2a. Instalar `torch` da wheel **CPU** (corta ~1 GB da imagem)

No PyPI, `pip install torch` no Linux traz a build com CUDA embutido (enorme e
inútil no Render, que é CPU-only). Instale a wheel CPU **antes** do
`requirements.txt` — como `torch` no requirements não tem versão fixa, o pip
considera satisfeito e não reinstala.

Em [`backend/Dockerfile`](../../backend/Dockerfile), troque:

```dockerfile
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt
```

por:

```dockerfile
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir torch \
       --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt
```

### 2b. "Assar" o modelo do HF na imagem no build

Filesystem do Render é **efêmero**: baixar o modelo em runtime faria o download
se repetir a cada deploy/restart. Melhor baixar **uma vez no build**.

No estágio `final` do [`backend/Dockerfile`](../../backend/Dockerfile), **logo após**
`COPY --chown=appuser:appgroup . .` e **antes** do `RUN prisma generate ...`,
acrescente:

```dockerfile
# Baixa o modelo fine-tunado do HF Hub para dentro da imagem (opcional).
# Se MODEL_REPO ficar vazio, a imagem sobe sem modelo (fallback do app).
ARG MODEL_REPO=""
ARG HF_TOKEN=""
RUN if [ -n "$MODEL_REPO" ]; then \
      python -c "from huggingface_hub import snapshot_download; snapshot_download(repo_id='$MODEL_REPO', local_dir='app/models/fine_tuned_legalbert', token=('$HF_TOKEN' or None))"; \
    else echo '>> MODEL_REPO vazio: imagem sem modelo fine-tunado (fallback base).'; fi
```

O `RUN prisma generate ... && chown -R appuser:appgroup ... /app` que já existe
depois disso cuida de dar posse dos arquivos baixados ao usuário da aplicação.
Nada muda no código do app: o `LegalBERTProvider` já prefere o diretório local
quando existe `config.json` (veja `_ensure_loaded` em
[`analysis_provider.py`](../../backend/app/services/analysis_provider.py)).

> 🔐 O `HF_TOKEN` passado como build-arg fica no histórico de layers da imagem.
> Para repositório **privado**, prefira um token **read-only** e descartável, ou
> deixe o repo do modelo **público** (aí não precisa de token no build).

### 2c. Liberar o CORS para o domínio do Vercel

Hoje o CORS aceita só `localhost` ([`main.py`](../../backend/app/main.py)). O
frontend no Vercel seria **bloqueado**. Torne a lista configurável por env:

```python
import os

origins = [
    "http://localhost:3000",
    "http://localhost:8080",
]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)
```

Depois é só definir `FRONTEND_URL=https://seu-app.vercel.app` no Render (Etapa 5).

---

## Etapa 3 — Criar o banco PostgreSQL no Render

1. No dashboard do Render: **New → Postgres**.
2. Dê um nome, escolha a região (a mesma do backend) e crie.
3. Copie a **Internal Database URL** (use a interna quando o backend estiver no
   mesmo Render — é mais rápida e não sai pra internet).

---

## Etapa 4 — Criar o Web Service do backend no Render

1. **New → Web Service** e conecte o repositório do GitHub.
2. Configurações principais:
   - **Root Directory:** `backend`
   - **Runtime / Language:** `Docker` (ele acha o `backend/Dockerfile`)
   - **Instance Type:** **≥ 1 GB RAM** (recomendado 2 GB). O plano **Free
     (512 MB) provavelmente dá OOM** com torch + BERT.
3. **Build Args** (aba Advanced → Build Arguments):
   - `MODEL_REPO = seu-usuario/crivoai-legalbert`
   - `HF_TOKEN = hf_xxx` *(só se o repo do modelo for privado)*
4. **Pre-Deploy Command** (roda as migrações antes de cada deploy):
   ```
   prisma migrate deploy --schema=prisma/schema.prisma
   ```
   *(Alternativa rápida, igual ao CI: `prisma db push --schema=prisma/schema.prisma`.)*
5. O **Start Command** já vem do Dockerfile:
   `uvicorn app.main:app --host 0.0.0.0 --port 8000` — o Render injeta a porta;
   como o app escuta na 8000 e o Dockerfile faz `EXPOSE 8000`, funciona direto.

---

## Etapa 5 — Variáveis de ambiente do backend (no Render)

| Variável | Obrigatória | Valor / observação |
|---|---|---|
| `DATABASE_URL` | ✅ | Internal Database URL do Postgres do Render |
| `AUTH_SECRET_KEY` | ✅ | **Troque o default!** Gere um segredo forte (ex.: `openssl rand -hex 32`) |
| `FRONTEND_URL` | ✅ | URL do frontend no Vercel (pro CORS — Etapa 2c) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ➖ | Opcional (default 60) |
| `MODEL_NAME` | ➖ | **Não precisa** se o modelo foi assado na imagem (o dir local tem prioridade). Use só se quiser carregar de outro repo do HF em runtime |

> O modelo já vem embutido na imagem (Etapa 2b), então `MODEL_NAME` fica de fora.

---

## Etapa 6 — Frontend no Vercel

1. **New Project** no Vercel apontando pra pasta `frontend/`.
2. Variável de ambiente:
   - `NEXT_PUBLIC_API_URL = https://seu-backend.onrender.com`
3. Deploy. Anote a URL final (ex.: `https://crivoai.vercel.app`) e use-a no
   `FRONTEND_URL` do backend (Etapa 5) — se mudar, redeploy do backend pro CORS
   pegar.

---

## Etapa 7 — Verificar se subiu certo

1. **Health check:** abra `https://seu-backend.onrender.com/health` (ou veja as
   rotas em `/docs`).
2. **Logs do Render:** no primeiro uso da análise, deve aparecer algo como
   `Modelo CARREGADO LOCALMENTE de: fine_tuned_legalbert` — confirma que os pesos
   fine-tunados foram usados (e não o fallback aleatório).
3. **Teste ponta a ponta:** faça uma análise pelo frontend e cheque se volta
   classificação (sem erro de CORS no console do navegador).

---

## Troubleshooting

| Sintoma | Causa provável | Solução |
|---|---|---|
| Deploy morre / "Out of memory" | Instância pequena demais | Suba pra ≥ 1 GB (ideal 2 GB) RAM |
| Predições sem sentido / aleatórias | Modelo não foi assado | Confira `MODEL_REPO` nos Build Args e o log "CARREGADO LOCALMENTE" |
| Erro de CORS no navegador | `FRONTEND_URL` errado/ausente | Ajuste a env e redeploy do backend (Etapa 2c/5) |
| Imagem gigante / build lento | torch com CUDA | Aplique a wheel CPU (Etapa 2a) |
| `relation ... does not exist` | Migrações não rodaram | Configure o Pre-Deploy Command (Etapa 4.4) |
| Primeira requisição lenta | Free tier "dorme" após 15 min | Use plano pago ou aceite o cold start |

---

## Notas finais

- **Custo:** o backend com ML precisa de RAM — na prática, instância **paga** do
  Render. O Postgres tem tier grátis com limite de linhas/idade.
- **Sem Git LFS:** o modelo vai pelo HF Hub, então os 416 MB **não** entram no
  git nem gastam a cota de LFS do `unb-mds`.
- **Modelo weak-label:** é um v1. O ganho real de qualidade virá da **revisão
  humana dos rótulos**, não de mais infra. Veja
  [`plano-expansao-ml.md`](./plano-expansao-ml.md).
