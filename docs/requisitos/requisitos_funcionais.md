# Requisitos Funcionais

## Objetivo

Este documento consolida os requisitos funcionais do produto **CrivoAI** para a Release 1. A lista foi refinada a partir do backlog do GitHub, do User Story Map, do Figma/FigJam, do quadro de planejamento no Miro, da estrutura real presente no repositório e do planejamento das sprints da R1.

O objetivo da Release 1 é entregar um fluxo mínimo demonstrável e persistido: permitir que um usuário se cadastre, faça login, submeta um texto legislativo, tenha essa submissão recebida pelo backend, registrada no banco de dados e visualizada posteriormente. As análises reais de qualidade legislativa, score calculado e agente de IA permanecem como evolução planejada para a R2, mas a Release 1 deve deixar clara a base técnica, documental e visual para essa evolução.

## Visão dos arquivos presentes

A estrutura atual do projeto já separa as responsabilidades principais:

| Área | Arquivos observados | Papel no produto |
| --- | --- | --- |
| Backend | `backend/app/main.py`, `backend/app/api/health.py`, `backend/requirements.txt` | API FastAPI, configuração de CORS, rota de saúde e dependências Python. |
| Testes | `backend/tests/test_health.py` | Validação automatizada inicial da rota `/health`. |
| Frontend | `frontend/src/app/page.tsx`, `frontend/src/app/layout.tsx`, `frontend/src/app/globals.css`, `frontend/package.json` | Aplicação Next.js, layout, estilos globais e scripts de execução/build/lint. |
| Infraestrutura | `docker-compose.yml`, `backend/Dockerfile` | Ambiente com PostgreSQL e backend containerizado. |
| Documentação | `mkdocs.yml`, `docs/index.md`, `docs/architecture/estrutura_de_pastas.txt` | Portal MkDocs e documentação da organização arquitetural. |
| Métricas | `docs/metricas/AGENT.md`, `docs/metricas/collect_metrics.py`, `docs/metricas/index.html` | Dashboard de métricas de produtividade do projeto. |

## Artefatos de planejamento considerados

| Artefato | Uso na documentação |
| --- | --- |
| Issues do GitHub | Fonte principal para identificação, rastreabilidade e critérios de aceite das funcionalidades. |
| User Story Map | Base para entender a jornada do usuário e priorizar o fluxo mínimo da Release 1. |
| Figma/FigJam | Referência para persona, wireframes, protótipos e organização visual das telas. |
| Miro | Apoio ao refinamento do Product Backlog e à priorização das histórias de usuário. |
| Critérios da R1 | Referência para documentação, planejamento, processo e validação da entrega. |

Link do quadro de planejamento no Miro: [Product Backlog / User Story Mapping](https://miro.com/app/board/uXjVHdj61Cg=/).

### Quadro do Miro

O quadro abaixo reúne o planejamento visual utilizado para apoiar o refinamento dos requisitos. Caso a visualização incorporada não carregue, acesse o link direto do Miro.

<iframe width="768" height="432" src="https://miro.com/app/live-embed/uXjVHdj61Cg=/?embedMode=view_only_without_ui&moveToViewport=-2711,-1001,2754,1419&embedId=347951037551" frameborder="0" scrolling="no" allow="fullscreen; clipboard-read; clipboard-write" allowfullscreen></iframe>

## Escopo funcional da Release 1

Para manter a Release 1 viável até 27/05/2026, os requisitos estão organizados por prioridade MoSCoW:

- **Must have**: necessário para demonstrar o fluxo mínimo do produto.
- **Should have**: importante para a qualidade da apresentação, mas pode ser simplificado se houver risco de prazo.
- **Could have**: desejável, mas pode ficar para a Release 2.
- **Won't have na R1**: explicitamente fora da Release 1.

## Requisitos Must Have

### RF00 - Autenticar usuário de forma básica

**Origem:** Issues [`#36`](https://github.com/unb-mds/2026-1-Squad07/issues/36), [`#37`](https://github.com/unb-mds/2026-1-Squad07/issues/37), [`#38`](https://github.com/unb-mds/2026-1-Squad07/issues/38), [`#92`](https://github.com/unb-mds/2026-1-Squad07/issues/92), [`#93`](https://github.com/unb-mds/2026-1-Squad07/issues/93) e spec `001-integracao-frontend-backend`.

**Descrição:** O sistema deve permitir cadastro e login básicos para apoiar o fluxo integrado da R1, usando token de autenticação para manter o usuário autenticado durante a demonstração.

**Critérios de aceite:**

- O usuário deve conseguir criar uma conta comum por meio da interface.
- O usuário deve conseguir realizar login com credenciais válidas.
- A API deve retornar token de autenticação para sessões válidas.
- O frontend deve armazenar o token de forma suficiente para a demonstração local.
- Erros de credenciais inválidas, conflito de e-mail e payload inválido devem ser apresentados de forma compreensível.
- Fluxos avançados de identidade, como SSO, recuperação de senha e administração completa de usuários, ficam fora da R1.

**Arquivos relacionados:**

- `frontend/src/app/login/`
- `frontend/src/app/register/`
- `backend/app/api/auth.py`
- `backend/app/api/users.py`

### RF01 - Submeter texto legislativo

**Origem:** Issues [`#40`](https://github.com/unb-mds/2026-1-Squad07/issues/40), [`#75`](https://github.com/unb-mds/2026-1-Squad07/issues/75) e [`#95`](https://github.com/unb-mds/2026-1-Squad07/issues/95).

**Descrição:** O sistema deve permitir que o usuário informe um título e o texto de uma proposição legislativa para cadastro e análise futura.

**Critérios de aceite:**

- A interface deve possuir formulário com campos mínimos de título e texto legislativo.
- O frontend deve validar os campos obrigatórios `título` e `texto legislativo` antes do envio.
- O campo `título` não deve ser enviado vazio.
- O campo `texto legislativo` não deve ser enviado vazio.
- O usuário deve conseguir acionar o envio por meio de um botão claro.
- O formulário deve enviar os dados para o endpoint de submissão.
- A submissão deve usar chamada real ao backend, não apenas simulação no frontend.
- A interface deve apresentar feedback de sucesso ou erro.

**Arquivos relacionados:**

- `frontend/src/app/page.tsx`
- `frontend/src/app/globals.css`
- `backend/app/api/`

### RF02 - Receber submissão legislativa via API

**Origem:** Issues [`#40`](https://github.com/unb-mds/2026-1-Squad07/issues/40) e [`#95`](https://github.com/unb-mds/2026-1-Squad07/issues/95).

**Descrição:** O backend deve disponibilizar uma rota para receber o texto legislativo enviado pelo frontend.

**Critérios de aceite:**

- Deve existir uma rota `POST` para submissões legislativas.
- A rota deve aceitar payload com título e texto.
- A rota deve validar dados obrigatórios.
- A rota deve retornar resposta compreensível para o frontend.
- Em caso de erro, a API deve retornar mensagem e código HTTP adequados.

**Arquivos relacionados:**

- `backend/app/main.py`
- `backend/app/api/`
- `backend/tests/`

### RF03 - Persistir submissão legislativa

**Origem:** Issues [`#29`](https://github.com/unb-mds/2026-1-Squad07/issues/29), [`#40`](https://github.com/unb-mds/2026-1-Squad07/issues/40), [`#95`](https://github.com/unb-mds/2026-1-Squad07/issues/95) e [`#96`](https://github.com/unb-mds/2026-1-Squad07/issues/96).

**Descrição:** O sistema deve registrar a submissão recebida em uma estrutura persistente, permitindo consulta posterior.

**Critérios de aceite:**

- O modelo de dados deve contemplar uma entidade para leis, proposições ou submissões legislativas.
- O texto submetido deve ser associado a um registro persistente.
- A conexão com PostgreSQL deve usar configuração via variável de ambiente.
- A persistência deve ser realizada por meio do Prisma, conforme definido na issue [`#29`](https://github.com/unb-mds/2026-1-Squad07/issues/29).

**Arquivos relacionados:**

- `docker-compose.yml`
- `backend/requirements.txt`
- `backend/app/db/`
- `backend/app/models/`

### RF04 - Listar submissões legislativas cadastradas

**Origem:** Issues [`#76`](https://github.com/unb-mds/2026-1-Squad07/issues/76), [`#94`](https://github.com/unb-mds/2026-1-Squad07/issues/94) e [`#96`](https://github.com/unb-mds/2026-1-Squad07/issues/96).

**Descrição:** O sistema deve permitir visualizar as submissões cadastradas para demonstrar que os textos enviados foram recebidos e registrados.

**Critérios de aceite:**

- Deve existir endpoint ou tela para listar submissões cadastradas.
- A listagem deve exibir pelo menos título, data de criação e trecho do texto.
- A listagem deve usar dados persistidos no banco.
- Dados mockados podem permanecer apenas para indicadores demonstrativos de análise, não como fonte principal das submissões reais.
- A funcionalidade deve estar integrada ao fluxo de submissão.

**Arquivos relacionados:**

- `backend/app/api/`
- `frontend/src/app/page.tsx`
- `frontend/src/app/globals.css`

### RF05 - Consultar detalhes de uma submissão

**Origem:** Issues [`#76`](https://github.com/unb-mds/2026-1-Squad07/issues/76), [`#94`](https://github.com/unb-mds/2026-1-Squad07/issues/94) e [`#96`](https://github.com/unb-mds/2026-1-Squad07/issues/96).

**Descrição:** O sistema deve permitir consultar as informações principais de uma submissão específica.

**Critérios de aceite:**

- O usuário deve conseguir selecionar ou acessar uma submissão cadastrada.
- O sistema deve exibir título, texto e data de criação.
- A visualização deve ser suficiente para apoiar a demonstração da R1.
- A visualização pode exibir indicadores demonstrativos, desde que fique claro que eles não são calculados por IA real na R1.

**Arquivos relacionados:**

- `backend/app/api/`
- `frontend/src/app/page.tsx`

### RF06 - Consultar textos legislativos de exemplo

**Origem:** Issue [`#60`](https://github.com/unb-mds/2026-1-Squad07/issues/60).

**Descrição:** O projeto deve possuir uma base inicial de textos legislativos reais ou realistas para apoiar a demonstração da Release 1.

**Critérios de aceite:**

- A documentação deve indicar a fonte dos textos usados.
- A base inicial deve conter textos suficientes para demonstração.
- As fontes recomendadas são Dados Abertos da Câmara, Senado Federal e LexML.
- Caso os dados sejam mockados, isso deve estar documentado.

**Arquivos relacionados:**

- `docs/`
- `backend/app/services/`

## Requisitos Should Have

### RF07 - Exibir resultado básico ou status da submissão

**Origem:** Issues [`#40`](https://github.com/unb-mds/2026-1-Squad07/issues/40), [`#60`](https://github.com/unb-mds/2026-1-Squad07/issues/60), [`#94`](https://github.com/unb-mds/2026-1-Squad07/issues/94), [`#95`](https://github.com/unb-mds/2026-1-Squad07/issues/95) e planejamento da Sprint 8.

**Descrição:** O sistema deve exibir ao usuário um resultado simples após a submissão, mesmo que a análise avançada ainda não esteja disponível.

**Critérios de aceite:**

- A interface deve indicar se a submissão foi registrada com sucesso.
- O sistema pode exibir um status inicial, como "recebida" ou "pendente de análise".
- Caso existam indicadores demonstrativos, eles devem ser apresentados como simulação visual.
- A R1 não deve depender de IA externa para cumprir este requisito.

**Arquivos relacionados:**

- `frontend/src/app/page.tsx`
- `backend/app/api/`

### RF08 - Disponibilizar documentação da Release 1

**Origem:** Issues [`#57`](https://github.com/unb-mds/2026-1-Squad07/issues/57), [`#68`](https://github.com/unb-mds/2026-1-Squad07/issues/68), [`#72`](https://github.com/unb-mds/2026-1-Squad07/issues/72), [`#86`](https://github.com/unb-mds/2026-1-Squad07/issues/86), [`#99`](https://github.com/unb-mds/2026-1-Squad07/issues/99) e issue de correção do MkDocs/GitHub Pages.

**Descrição:** O projeto deve disponibilizar documentação navegável contendo requisitos, visão do produto, arquitetura, processo e métricas.

**Critérios de aceite:**

- A documentação deve conter requisitos funcionais e não funcionais.
- A documentação deve deixar claro o escopo da R1 e o que fica para R2.
- A documentação deve estar pronta para publicação no MkDocs/GitHub Pages.
- A correção da configuração do MkDocs deve ser tratada em issue própria.

**Arquivos relacionados:**

- `docs/`
- `mkdocs.yml`

## Requisitos Could Have e evolução para R2

### RF09 - Calcular índice inicial de legibilidade

**Origem:** Issue [`#41`](https://github.com/unb-mds/2026-1-Squad07/issues/41).

**Descrição:** O sistema deve evoluir para calcular uma métrica inicial de dificuldade de leitura do texto legislativo. Na R1, qualquer indicador exibido é demonstrativo e não representa cálculo real de NLP.

**Critérios de aceite:**

- O sistema deve receber um texto e retornar um valor numérico de legibilidade.
- A regra de cálculo deve ser documentada.
- A implementação inicial pode usar fórmula simples adaptada para português.

### RF10 - Calcular score final de qualidade legislativa

**Origem:** Issue [`#42`](https://github.com/unb-mds/2026-1-Squad07/issues/42).

**Descrição:** O sistema deve evoluir para consolidar métricas de qualidade em uma nota final de 0 a 100. Na R1, o score exibido no protótipo ou nos registros de demonstração é simulado.

**Critérios de aceite:**

- O score final deve estar no intervalo de 0 a 100.
- A regra de ponderação deve ser documentada.
- O retorno deve ser utilizável pelo frontend.

### RF11 - Exibir relatório visual de qualidade

**Origem:** Issues [`#43`](https://github.com/unb-mds/2026-1-Squad07/issues/43), [`#44`](https://github.com/unb-mds/2026-1-Squad07/issues/44), [`#50`](https://github.com/unb-mds/2026-1-Squad07/issues/50) e [`#51`](https://github.com/unb-mds/2026-1-Squad07/issues/51).

**Descrição:** O sistema deve evoluir para apresentar relatório com nota, média geral, gráfico ou alertas visuais de qualidade legislativa. Na R1, a visualização serve para demonstrar a direção da experiência.

**Critérios de aceite:**

- O relatório deve destacar visualmente o resultado principal.
- A interface pode listar problemas simples, como frases longas ou termos ambíguos.
- A visualização deve seguir a identidade visual definida no protótipo.

## Fora do escopo da Release 1

Os requisitos abaixo permanecem relevantes para o produto, mas devem ser planejados para a Release 2 ou sprints futuras:

| Requisito | Issue | Justificativa |
| --- | --- | --- |
| SSO e autenticação institucional | A definir | Não é necessário para a demonstração local da R1 e depende de integração externa. |
| CRUD administrativo completo de usuários | [`#45`](https://github.com/unb-mds/2026-1-Squad07/issues/45) | A R1 entrega autenticação básica; administração completa fica para refinamento posterior. |
| Recuperação de senha | [`#46`](https://github.com/unb-mds/2026-1-Squad07/issues/46) | Depende de envio de e-mail e segurança adicional. |
| Detecção avançada de ambiguidade | [`#48`](https://github.com/unb-mds/2026-1-Squad07/issues/48) | Pode exigir NLP mais sofisticado. |
| Resumo inteligente com IA externa | [`#49`](https://github.com/unb-mds/2026-1-Squad07/issues/49) | Depende de integração externa e política de uso de API. |
| Agente de IA para apoio jurídico | A definir | Deve ser especificado e validado na R2, após estabilização do fluxo base. |
| Dashboard analítico completo de leis | [`#50`](https://github.com/unb-mds/2026-1-Squad07/issues/50), [`#51`](https://github.com/unb-mds/2026-1-Squad07/issues/51) | Pode ser evoluído após o fluxo mínimo de submissão e persistência. |

## Evolução dos requisitos

Os requisitos descritos nesta documentação representam o entendimento atual do projeto para a Release 1 e o planejamento inicial da Release 2. Como o projeto segue uma abordagem ágil, estes requisitos podem ser refinados, reorganizados ou reavaliados ao longo das próximas sprints, conforme o time avance na implementação, valide o protótipo e receba novos feedbacks.

Dessa forma, os itens previstos para a R2 não devem ser entendidos como escopo imutável, mas como uma direção de evolução para a implementação completa do produto.
