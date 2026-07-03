# Guia de Implantação e Deploy Contínuo (CD)

Este documento descreve a infraestrutura de produção do **CrivoAI** e o fluxo de **CD (Continuous Deployment)** para a implantação automatizada das atualizações.

## 🎯 Por que este documento existe?

Configurar e manter ambientes de nuvem saudáveis exige padronização. Este documento serve para:

1. **Padronizar a Infraestrutura:** Explicar a divisão de responsabilidades de hospedagem entre o frontend e backend.
2. **Justificar a Arquitetura Híbrida:** Explicar os motivos arquiteturais para a divisão do deploy (Next.js na Vercel e FastAPI no Render).
3. **Documentar Configurações de CD:** Registrar as variáveis de ambiente necessárias e o comportamento dos triggers do git.

---

## 🏗️ Arquitetura de Hospedagem Híbrida

Adotamos uma hospedagem híbrida de produção para garantir escalabilidade gratuita e compatibilidade nativa com rotas dinâmicas do Next.js:

```mermaid
graph TD
    User([Usuário]) -->|Acessa o site| Frontend[Vercel - Frontend Next.js]
    Frontend -->|Chamadas de API| Backend[Render/Koyeb - API FastAPI Web Service]
    Backend -->|Persistência Prisma| DB[Neon - PostgreSQL]
```

### 1. Frontend (Next.js) $\rightarrow$ Vercel (Hobby Tier)

O Vercel hospeda o aplicativo cliente. Como o Next.js App Router adota páginas interativas baseadas em cliente (`"use client"`) para rotas dinâmicas como `/law/[id]`, a compilação do Next.js requer um runtime dinâmico na nuvem.

* **Por que Vercel e não Render Static Site?** No Next.js, compilar como *Static Site* puro (`output: "export"`) para rodar em CDNs tradicionais exige que todas as rotas dinâmicas tenham uma função `generateStaticParams()` declarada em um Server Component. Como o `page.tsx` de detalhes da lei é inteiramente um Client Component (`"use client"`), o Next.js impede a compilação estática direta. O Vercel gerencia e resolve essa renderização dinâmica na nuvem automaticamente de forma nativa e gratuita, sem exigir refatorações no código-fonte.

### 2. Backend (FastAPI) $\rightarrow$ Render ou Koyeb (Web Service)

O backend processa a classificação de qualidade com o modelo LegalBERT-pt e a orquestração concorrente de resumos via IA (Gemini). É empacotado e executado como um contêiner Docker a partir do `Dockerfile` do projeto.

### 3. Banco de Dados (PostgreSQL) $\rightarrow$ Neon (Neon.tech)

O banco PostgreSQL é hospedado no **Neon.tech**, um provedor serverless gratuito de PostgreSQL que oferece conectividade IPv4 nativa completa, superando as restrições e custos de IPv6 dedicados do Supabase e livre da expiração do plano de banco do Render.

---

## 🔑 Variáveis de Ambiente e Configuração

Estas chaves são cadastradas no painel seguro de cada plataforma:

### Configuração do Frontend (Vercel)

* **Root Directory:** `frontend`
* **Framework Preset:** `Next.js`
* **Environment Variables:**
  * `NEXT_PUBLIC_API_URL`: A URL pública do seu Web Service FastAPI gerado no Render (ex: `https://crivoai-api.onrender.com`).

### Configuração do Backend (Render/Koyeb Web Service)

* **Build Command:** Escolher Docker (compilar a partir do `backend/Dockerfile`).
* **Environment Variables:**
  * `DATABASE_URL`: A URL de conexão segura com o PostgreSQL obtida no Neon (ex: `postgresql://neondb_owner:senha@ep-host.aws.neon.tech/neondb?sslmode=require`).
  * `ENVIRONMENT`: Defina como `production` para desligar as saídas de simulação de IA (Mock).
  * `GEMINI_API_KEY`: Sua chave de API do Google Gemini para a geração dos resumos automáticos.
  * `AUTH_SECRET_KEY`: Uma sequência de caracteres criptograficamente segura para a criptografia dos tokens JWT de autenticação.
  * `ACCESS_TOKEN_EXPIRE_MINUTES`: Tempo de expiração do token de sessão (ex: `60` minutos).
  * `MODEL_NAME`: ID do repositório do modelo fine-tunado no Hugging Face (ex: `usuario/legalbertpt-crivoai`). **Sem esta variável**, o backend cai no modelo base (`raquelsilveira/legalbertpt_fp`) com cabeça de classificação aleatória e os scores ficam sem sentido. Veja a seção "Publicação do Modelo".
  * `HF_TOKEN`: Token de leitura do Hugging Face — **obrigatório** porque o repositório do modelo é privado; sem ele o download em runtime falha com 401. (Um token de leitura basta no Render; use um de escrita só na hora do upload.)

---

## 🧠 Publicação do Modelo (LegalBERT-pt fine-tunado)

Os pesos do modelo (`backend/app/models/fine_tuned_legalbert/`, ~435 MB) **não são versionados no git** (`.gitignore`) — grandes demais e mutáveis a cada treino. Portanto o merge do código **não** leva o modelo junto; ele precisa ser publicado separadamente e baixado pelo backend em runtime.

### Fluxo de publicação (após treinar)

1. Autentique-se no Hugging Face na sua máquina (o token **nunca** vai pro git nem pro chat):

   ```bash
   hf auth login   # ou: huggingface-cli login
   ```

2. Rode o script de upload apontando para um repositório **privado**:

   ```bash
   HF_REPO_ID="usuario/legalbertpt-crivoai" python backend/scripts/upload_model.py
   ```

   O script cria o repo (se não existir) e envia todos os arquivos de `fine_tuned_legalbert/`.

3. No Render, configure `MODEL_NAME=usuario/legalbertpt-crivoai` e `HF_TOKEN=<token de leitura>` e redeploy. O backend carrega o modelo preguiçosamente na primeira análise (`analysis_provider.py`).

> **Atenção (recursos do Render):** LegalBERT-pt + torch consomem memória; valide se o plano do Web Service tem RAM suficiente para carregar o modelo (o tier gratuito de 512 MB é apertado). O primeiro request após um cold start também baixa os ~435 MB do Hugging Face.
>
> **Qualidade:** o checkpoint atual foi treinado com rótulos *weak* (F1-macro ~0.53). Segue experimental até a revisão de rótulos GOLD.

---

## 🔄 Fluxo de Deploy Contínuo (CD)

O pipeline de CD é disparado de forma automática a partir dos commits do GitHub:

```mermaid
sequenceDiagram
    participant Dev as Desenvolvedor
    participant Git as GitHub (dev/main)
    participant CI as CI (GitHub Actions)
    participant Vercel as Vercel (Front)
    participant Render as Render (Back)

    Dev->>Git: git push
    Git->>CI: Dispara Testes e Lint
    CI-->>Git: Sucesso (Verde)
    Git->>Vercel: Gatilho Git Hook (Auto-build Next.js)
    Git->>Render: Gatilho Git Hook (Auto-build Docker)
    Vercel-->>User: Frontend Atualizado
    Render-->>User: Backend Atualizado (Zero Downtime)
```

1. **Staging / Homologação (Branch `dev`):**
   * Commits enviados para a branch `dev` disparam deploys automáticos em ambientes de homologação (ex: `crivoai-staging.vercel.app`). Isso permite testar a integração ponta a ponta na nuvem antes do lançamento final.
2. **Produção (Branch `main`):**
   * Commits mesclados na branch `main` atualizam os ambientes oficiais de produção do site.
3. **Zero Downtime:**
   * O Render compila o `Dockerfile` do backend em uma máquina paralela e só direciona o tráfego do domínio público para ela quando o container estiver saudável, garantindo que a aplicação nunca fique fora do ar durante atualizações.

---

## 📌 Nota sobre Deploy Manual do Frontend (Restrições de Organização)

Devido às restrições de permissão da organização `unb-mds` no GitHub (que impede a integração automática de aplicativos de terceiros como a Vercel sem privilégios de Owner), o deploy do frontend Next.js é gerenciado manualmente pelos desenvolvedores autorizados através da **Vercel CLI**.

### Fluxo de Atualização do Frontend:

1. Após mesclar alterações na branch `dev` ou `main`, puxe a versão atualizada na sua máquina local (`git pull`).
2. Navegue até a pasta do frontend no terminal:

   ```bash
   cd frontend
   ```

3. Execute o comando de compilação e publicação de produção na Vercel:

   ```bash
   vercel --prod
   ```
   
4. O CLI compilará o Next.js e propagará a atualização do site de produção de forma imediata.
