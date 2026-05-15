# Requisitos Funcionais

## Objetivo

Este documento consolida os requisitos funcionais do projeto Monitoramento de Qualidade de Leis para a Release 1. A lista foi refinada a partir do backlog do GitHub, do User Story Map, do Figma/FigJam, do quadro de planejamento no Miro, da estrutura real presente no repositório e do planejamento da Sprint 8.

O objetivo da Release 1 é entregar um fluxo mínimo demonstrável: permitir que um usuário submeta um texto legislativo, que o backend receba e registre essa submissão, e que o sistema permita visualizar os registros cadastrados. As análises de qualidade legislativa mais avançadas permanecem como evolução planejada, mas a Release 1 deve deixar clara a base técnica, documental e visual para essa evolução.

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

### RF01 - Submeter texto legislativo

**Origem:** Issues `#40` e `#75`.

**Descrição:** O sistema deve permitir que o usuário informe um título e o texto de uma proposição legislativa para cadastro e análise futura.

**Critérios de aceite:**

- A interface deve possuir formulário com campos mínimos de título e texto legislativo.
- O frontend deve validar campos obrigatórios antes do envio.
- O usuário deve conseguir acionar o envio por meio de um botão claro.
- O formulário deve enviar os dados para o endpoint de submissão.
- A interface deve apresentar feedback de sucesso ou erro.

**Arquivos relacionados:**

- `frontend/src/app/page.tsx`
- `frontend/src/app/globals.css`
- `backend/app/api/`

### RF02 - Receber submissão legislativa via API

**Origem:** Issue `#40`.

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

**Origem:** Issues `#29` e `#40`.

**Descrição:** O sistema deve registrar a submissão recebida em uma estrutura persistente, permitindo consulta posterior.

**Critérios de aceite:**

- O modelo de dados deve contemplar uma entidade para leis, proposições ou submissões legislativas.
- O texto submetido deve ser associado a um registro persistente.
- A conexão com PostgreSQL deve usar configuração via variável de ambiente.
- A persistência deve ser realizada por meio do Prisma, conforme definido na issue `#29`.

**Arquivos relacionados:**

- `docker-compose.yml`
- `backend/requirements.txt`
- `backend/app/db/`
- `backend/app/models/`

### RF04 - Listar submissões legislativas cadastradas

**Origem:** Issue `#76`.

**Descrição:** O sistema deve permitir visualizar as submissões cadastradas para demonstrar que os textos enviados foram recebidos e registrados.

**Critérios de aceite:**

- Deve existir endpoint ou tela para listar submissões cadastradas.
- A listagem deve exibir pelo menos título, data de criação e trecho do texto.
- A listagem deve usar dados persistidos no banco ou mock temporário documentado.
- A funcionalidade deve estar integrada ao fluxo de submissão.

**Arquivos relacionados:**

- `backend/app/api/`
- `frontend/src/app/page.tsx`
- `frontend/src/app/globals.css`

### RF05 - Consultar detalhes de uma submissão

**Origem:** Issue `#76`.

**Descrição:** O sistema deve permitir consultar as informações principais de uma submissão específica.

**Critérios de aceite:**

- O usuário deve conseguir selecionar ou acessar uma submissão cadastrada.
- O sistema deve exibir título, texto e data de criação.
- A visualização deve ser suficiente para apoiar a demonstração da R1.
- Caso a tela detalhada não seja implementada separadamente, a listagem deve exibir informações suficientes para cumprir a finalidade da R1.

**Arquivos relacionados:**

- `backend/app/api/`
- `frontend/src/app/page.tsx`

### RF06 - Consultar textos legislativos de exemplo

**Origem:** Issue `#60`.

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

**Origem:** Issues `#40`, `#60` e planejamento da Sprint 8.

**Descrição:** O sistema deve exibir ao usuário um resultado simples após a submissão, mesmo que a análise avançada ainda não esteja disponível.

**Critérios de aceite:**

- A interface deve indicar se a submissão foi registrada com sucesso.
- O sistema pode exibir um status inicial, como "recebida" ou "pendente de análise".
- Caso exista cálculo demonstrativo, a regra deve ser documentada.
- A R1 não deve depender de IA externa para cumprir este requisito.

**Arquivos relacionados:**

- `frontend/src/app/page.tsx`
- `backend/app/api/`

### RF08 - Disponibilizar documentação da Release 1

**Origem:** Issues `#57`, `#68`, `#72` e issue de correção do MkDocs/GitHub Pages.

**Descrição:** O projeto deve disponibilizar documentação navegável contendo requisitos, visão do produto, arquitetura, processo e métricas.

**Critérios de aceite:**

- A documentação deve conter requisitos funcionais e não funcionais.
- A documentação deve deixar claro o escopo da R1 e o que fica para R2.
- A documentação deve estar pronta para publicação no MkDocs/GitHub Pages.
- A correção da configuração do MkDocs deve ser tratada em issue própria.

**Arquivos relacionados:**

- `docs/`
- `mkdocs.yml`

## Requisitos Could Have

### RF09 - Calcular índice inicial de legibilidade

**Origem:** Issue `#41`.

**Descrição:** O sistema pode calcular uma métrica inicial de dificuldade de leitura do texto legislativo.

**Critérios de aceite:**

- O sistema deve receber um texto e retornar um valor numérico de legibilidade.
- A regra de cálculo deve ser documentada.
- A implementação inicial pode usar fórmula simples adaptada para português.

### RF10 - Calcular score final de qualidade legislativa

**Origem:** Issue `#42`.

**Descrição:** O sistema pode consolidar métricas de qualidade em uma nota final de 0 a 100.

**Critérios de aceite:**

- O score final deve estar no intervalo de 0 a 100.
- A regra de ponderação deve ser documentada.
- O retorno deve ser utilizável pelo frontend.

### RF11 - Exibir relatório visual de qualidade

**Origem:** Issues `#43`, `#44`, `#50` e `#51`.

**Descrição:** O sistema pode apresentar relatório com nota, média geral, gráfico ou alertas visuais de qualidade legislativa.

**Critérios de aceite:**

- O relatório deve destacar visualmente o resultado principal.
- A interface pode listar problemas simples, como frases longas ou termos ambíguos.
- A visualização deve seguir a identidade visual definida no protótipo.

## Fora do escopo da Release 1

Os requisitos abaixo permanecem relevantes para o produto, mas devem ser planejados para a Release 2 ou sprints futuras:

| Requisito | Issue | Justificativa |
| --- | --- | --- |
| Cadastro de usuário | `#36` | Depende de fluxo de identidade mais completo e não é essencial para demonstrar submissão legislativa. |
| Login de usuário | `#37` | Depende de autenticação e persistência de usuários. |
| Autenticação JWT | `#38` | Aumenta o risco técnico da R1. |
| CRUD completo de usuário | `#45` | Não é essencial para demonstrar o fluxo de qualidade legislativa. |
| Recuperação de senha | `#46` | Depende de envio de e-mail e segurança adicional. |
| Detecção avançada de ambiguidade | `#48` | Pode exigir NLP mais sofisticado. |
| Resumo inteligente com IA externa | `#49` | Depende de integração externa e política de uso de API. |
| Dashboard analítico completo de leis | `#50`, `#51` | Pode ser evoluído após o fluxo mínimo de submissão e persistência. |

## Evolução dos requisitos

Os requisitos descritos nesta documentação representam o entendimento atual do projeto para a Release 1 e o planejamento inicial da Release 2. Como o projeto segue uma abordagem ágil, estes requisitos podem ser refinados, reorganizados ou reavaliados ao longo das próximas sprints, conforme o time avance na implementação, valide o protótipo e receba novos feedbacks.

Dessa forma, os itens previstos para a R2 não devem ser entendidos como escopo imutável, mas como uma direção de evolução para a implementação completa do produto.

## Critério de conclusão da issue #57

A issue `#57` pode ser considerada concluída quando:

- Os requisitos funcionais estiverem descritos de forma clara.
- Os requisitos não funcionais estiverem documentados.
- Cada requisito tiver origem, descrição, critérios de aceite e rastreabilidade.
- O escopo da Release 1 estiver separado do que fica para Release 2.
- A documentação estiver pronta para publicação no MkDocs.
- A equipe conseguir usar estes documentos como referência para Sprint Planning, implementação, testes e apresentação da R1.
