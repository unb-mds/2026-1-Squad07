
## 1. O que é CI/CD?

CI/CD (Continuous Integration / Continuous Deployment) é a prática de automatizar a integração de código e a entrega da aplicação. São os "robôs" que garantem que o código está funcionando e o enviam para o ar automaticamente, eliminando trabalho manual, repetitivo e arriscado de juntar e publicar código. O objetivo é entregar software mais rápido, com menos bugs e sem esgotar a equipe.

### Os Três Pilares

| Pilar | Nome | Descrição |
| --- | --- | --- |
| **CI** | Integração Contínua | Prática de juntar o código de todos os desenvolvedores em um repositório central com alta frequência (várias vezes ao dia). A cada envio, testes automatizados rodam imediatamente para garantir que a nova alteração não quebrou nada. |
| **CD** | Entrega Contínua | Passo seguinte ao CI. O código que passou nos testes é automaticamente preparado e empacotado para poder ser enviado para qualquer ambiente a qualquer momento. A ida final para produção geralmente exige uma aprovação manual. |
| **CD** | Implantação Contínua | Nível máximo de automação. Se o código passou em todos os testes, ele vai direto para o usuário final em produção. Não há intervenção ou aprovação humana. |

---

## 2. As 4 Etapas de um Pipeline

O pipeline é a esteira automatizada que o código percorre. Ele funciona em 4 fases sequenciais:

1. **Fonte (Source):** Alguém fez push de código ou abriu um Pull Request, o que acorda a automação e inicia todo o processo.
2. **Compilação (Build):** O código é empacotado e preparado para rodar (ex: criação de contêineres Docker ou instalação de dependências). Se falhar aqui, há um problema estrutural.
3. **Teste (Test):** A rede de segurança. Rodam os testes automatizados para validar a lógica. Falhar aqui significa que um bug foi pego antes de chegar ao usuário.
4. **Implantação (Deploy):** O envio da versão aprovada e empacotada para o servidor (produção ou ambiente de testes).

---

## 3. O que faz um bom Pipeline?

Para que o time adote e confie no processo, o pipeline precisa ter três características fundamentais:

| Característica | Descrição |
| --- | --- |
| **Velocidade** | O feedback precisa ser rápido para não travar o fluxo de trabalho do desenvolvedor. |
| **Precisão** | A automação deve ser exata para eliminar o risco de erro humano no processo. |
| **Confiabilidade** | Os testes precisam ser à prova de falhas para que a equipe confie no resultado verde ou vermelho. |

---

## 4. Principais Benefícios

- **Prevenção de Bugs:** Erros são pegos logo após o código ser escrito, sendo mais fáceis e baratos de corrigir.
- **Redução de Tarefas Manuais:** Os engenheiros não precisam mais gastar horas configurando servidores ou testando manualmente.
- **Entregas Ágeis:** O produto chega ao mercado muito mais rápido e de forma constante.

---

## 5. Por que usar Docker no CI/CD?

- **Padronização:** O mesmo contêiner que qualquer membro do time usa localmente será o que o pipeline vai testar e o servidor vai rodar, eliminando o clássico "funciona na minha máquina".
- **Isolamento:** Evita conflitos de versões de bibliotecas entre o projeto, a máquina dos desenvolvedores e o servidor de produção.
- **Velocidade:** Recuperar uma imagem Docker pronta é muito mais rápido do que configurar um servidor do zero a cada nova versão publicada.

---

## 6. Pipeline do Projeto — GitHub Actions

A ferramenta escolhida foi o **GitHub Actions**, por já estar integrada ao repositório e eliminar a necessidade de configurar serviços externos. O pipeline roda automaticamente a cada push e Pull Request nas branches `main` e `develop`.

### 6.1 Estrutura dos Jobs

| Job | Roda quando | O que valida |
| --- | --- | --- |
| `backend` | Todo push/PR | flake8 (lint), black (formatação), pytest (testes), cobertura de código |
| `frontend` | Todo push/PR | ESLint (lint), TypeScript (tipos), Jest (testes), build de produção |
| `docker` | Após backend + frontend passarem | Build das imagens, saúde dos containers, endpoints `/health` e porta 3000 |

### 6.2 Ferramentas por Categoria

| Ferramenta | Camada | Função |
| --- | --- | --- |
| `pytest` + `pytest-cov` | Backend | Testes unitários e cobertura de código |
| `httpx` | Backend | Testa endpoints FastAPI de forma assíncrona |
| `flake8` | Backend | Detecta erros de sintaxe e má formatação Python |
| `black` | Backend | Formata código Python automaticamente |
| `Jest` | Frontend | Testes unitários de componentes React/Next.js |
| `ESLint` | Frontend | Padrão de código JavaScript/TypeScript |
| `TypeScript (tsc)` | Frontend | Checa erros de tipagem antes do build |
| `Codecov` | Ambos | Dashboard visual de cobertura de testes |
| `Dependabot` | Ambos | Alertas automáticos de vulnerabilidades |

### 6.3 Fluxo Visual do Pipeline

```text
push / pull request
        │
        ▼
┌───────────────┐     ┌───────────────┐
│   backend     │     │   frontend    │  ← rodam em PARALELO
│               │     │               │
│ flake8        │     │ ESLint        │
│ black         │     │ TypeScript    │
│ pytest        │     │ Jest          │
│ cobertura     │     │ build         │
└──────┬────────┘     └──────┬────────┘
       │                     │
       └──────────┬──────────┘
                  │ só começa se os dois passarem
                  ▼
         ┌────────────────┐
         │     docker     │
         │                │
         │ build imagens  │
         │ health check   │
         └────────┬───────┘
                  │
            ✅ verde → merge liberado
            ❌ vermelho → merge bloqueado
```

---

## 7. Status dos Tópicos de Estudo

| Status | Tópico | Observação |
| --- | --- | --- |
| ✅ | Entender os conceitos de CI e CD | Documentado neste arquivo — seções 1 a 5 |
| ✅ | Avaliar a ferramenta de automação | GitHub Actions escolhido por integração nativa com o repositório |
| ✅ | Definir regras do CI no Pull Request | lint + testes + build obrigatórios para todo PR — arquivo `ci.yml` configurado |
| ⚠️ | Definir onde a aplicação será hospedada | Em discussão — candidatos: Railway, Render + Vercel |
| ✅ | Criar uma PoC com arquivo `.yml` | Pipeline completo criado em `.github/workflows/ci.yml` |

---

## 8. Referências

- [GitLab — O que é um pipeline CI/CD?](https://about.gitlab.com/pt-br/topics/ci-cd/cicd-pipeline/)
- [Stack Overflow Blog — Building a QA process for your deep learning pipeline](https://stackoverflow.blog/2021/11/15/building-a-qa-process-for-your-deep-learning-pipeline-in-practice/)
- [YouTube — CI/CD explicado (vídeo de referência)](https://www.youtube.com/watch?v=R8_veQiYBjI)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
