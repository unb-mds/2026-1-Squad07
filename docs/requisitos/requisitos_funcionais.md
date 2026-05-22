# Requisitos Funcionais

## Objetivo

Este documento consolida os requisitos funcionais do projeto **Monitoramento de Qualidade de Leis** para a Release 1. A lista foi refinada a partir do backlog do GitHub, do User Story Map, do Figma, do quadro de planejamento no Miro e da estrutura real presente no repositório.

O objetivo da Release 1 é entregar uma base documentada e validável para o produto: permitir que uma proposição legislativa seja submetida, analisada por métricas iniciais e apresentada ao usuário por meio de um relatório simples de qualidade.

## Visão dos arquivos presentes

A estrutura atual do projeto já separa as responsabilidades principais:

| Área | Arquivos observados | Papel no produto |
| --- | --- | --- |
| Backend | `backend/app/main.py`, `backend/app/api/health.py`, `backend/requirements.txt` | API FastAPI, configuração de CORS, rota de saúde e dependências Python. |
| Testes | `backend/tests/test_health.py` | Validação automatizada inicial da rota `/health`. |
| Frontend | `frontend/src/app/page.tsx`, `frontend/src/app/layout.tsx`, `frontend/src/app/globals.css`, `frontend/package.json` | Aplicação Next.js, layout, estilos globais e scripts de execução/build/lint. |
| Infraestrutura | `docker-compose.yml`, `backend/Dockerfile` | Ambiente com PostgreSQL e backend containerizado. |
| Documentação | `mkdocs.yml`, `docs/index.md`, `docs/architecture/estrutura_de_pastas.txt` | Portal MkDocs e documentação da organização arquitetural. |

## Artefatos de planejamento considerados

Os requisitos funcionais foram derivados e organizados a partir dos seguintes artefatos de planejamento:

| Artefato | Uso na documentação |
| --- | --- |
| Issues do GitHub | Fonte principal para identificação, rastreabilidade e critérios de aceite das funcionalidades. |
| User Story Map | Base para entender a jornada do usuário e priorizar o fluxo mínimo da Release 1. |
| Figma/FigJam | Referência para persona, wireframes, protótipos e organização visual das telas. |
| Miro | Apoio ao refinamento do Product Backlog e à priorização das histórias de usuário. |

Link do quadro de planejamento no Miro: [Product Backlog / User Story Mapping](https://miro.com/app/board/uXjVHdj61Cg=/).

### Quadro do Miro

O quadro abaixo reúne o planejamento visual utilizado para apoiar o refinamento dos requisitos. Caso a visualização incorporada não carregue, acesse o link direto do Miro.

<iframe width="768"
 height="432" src="https://miro.com/app/live-embed/uXjVHdj61Cg=/?embedMode=view_only_without_ui&moveToViewport=-2711,-1001,2754,1419&embedId=347951037551" frameborder="0" scrolling="no" allow="fullscreen; clipboard-read; clipboard-write" allowfullscreen></iframe>

## Escopo funcional da Release 1

Para manter a Release 1 viável até 27/05/2026, os requisitos abaixo estão organizados por prioridade:

- **Must have**: necessário para demonstrar o fluxo mínimo do produto.
- **Should have**: importante, mas pode ser simplificado se houver risco de prazo.
- **Could have**: desejável, mas pode ficar para a Release 2.
- **Won't have na R1**: explicitamente fora da Release 1.

## Requisitos Must Have

### RF01 - Submeter texto legislativo para análise

**Origem:** Issues `#39` e `#40`.

**Descrição:** O sistema deve permitir que o usuário insira ou cole o texto de uma proposição legislativa para iniciar a avaliação de qualidade.

**Critérios de aceite:**

- A tela inicial deve apresentar uma área de texto ou campo equivalente para submissão da lei.
- O usuário deve conseguir acionar a análise por meio de um botão claro.
- O backend deve possuir uma rota preparada para receber o texto submetido.
- A submissão deve retornar uma resposta compreensível para o frontend.

**Arquivos relacionados:**

- `frontend/src/app/page.tsx`
- `backend/app/main.py`
- `backend/app/api/`

### RF02 - Registrar texto submetido para análise futura

**Origem:** Issues `#29` e `#40`.

**Descrição:** O sistema deve persistir o texto legislativo recebido, permitindo que ele seja usado em análises posteriores.

**Critérios de aceite:**

- O modelo de dados deve contemplar uma entidade para leis ou proposições legislativas.
- O texto submetido deve ser associado a um registro persistente.
- A conexão com PostgreSQL deve usar configuração padronizada via ambiente.

**Arquivos relacionados:**

- `docker-compose.yml`
- `backend/requirements.txt`
- `backend/app/db/`

### RF03 - Calcular índice inicial de legibilidade

**Origem:** Issue `#41`.

**Descrição:** O sistema deve calcular uma métrica inicial de dificuldade de leitura do texto legislativo.

**Critérios de aceite:**

- O sistema deve receber um texto e retornar um valor numérico de legibilidade.
- A regra de cálculo deve ser documentada.
- A implementação inicial pode usar uma fórmula simples adaptada para português, desde que seja reprodutível.

**Arquivos relacionados:**

- `backend/app/services/`
- `backend/tests/`

### RF04 - Calcular score final de qualidade legislativa

**Origem:** Issue `#42`.

**Descrição:** O sistema deve consolidar métricas de qualidade em uma nota final de 0 a 100.

**Critérios de aceite:**

- O score final deve estar no intervalo de 0 a 100.
- A regra de ponderação deve ser documentada.
- O score deve considerar, no mínimo, a legibilidade na versão inicial.
- O retorno deve ser utilizável pelo frontend.

**Arquivos relacionados:**

- `backend/app/services/`
- `frontend/src/app/page.tsx`

### RF05 - Exibir resultado da análise ao usuário

**Origem:** Issues `#43` e `#44`.

**Descrição:** O sistema deve apresentar ao usuário um relatório inicial com o texto analisado, a nota de qualidade e os principais problemas detectados.

**Critérios de aceite:**

- A interface deve exibir a nota principal da lei analisada.
- A interface deve destacar visualmente o resultado.
- A interface deve listar problemas simples, como frases muito longas ou termos marcados como ambíguos.
- O relatório pode ser simplificado na R1, desde que demonstre o fluxo ponta a ponta.

**Arquivos relacionados:**

- `frontend/src/app/page.tsx`
- `frontend/src/app/globals.css`

## Requisitos Should Have

### RF06 - Consultar textos legislativos de exemplo

**Origem:** Issue `#60`.

**Descrição:** O sistema deve utilizar uma base inicial de textos legislativos reais para demonstrar as análises da Release 1.

**Critérios de aceite:**

- A documentação deve indicar a fonte dos textos usados.
- A base inicial deve conter textos suficientes para demonstração.
- As fontes recomendadas são Dados Abertos da Câmara, Senado Federal e LexML.

### RF07 - Exibir média geral das leis analisadas

**Origem:** Issue `#50`.

**Descrição:** O sistema deve apresentar uma média geral dos scores das leis analisadas.

**Critérios de aceite:**

- A tela inicial deve reservar espaço para a média geral.
- Na R1, a média pode ser demonstrativa caso a persistência completa ainda não esteja finalizada.
- A documentação deve deixar claro se o dado é real, calculado ou mockado.

## Requisitos Could Have

### RF08 - Exibir gráfico circular do score

**Origem:** Issue `#51`.

**Descrição:** O sistema pode apresentar a nota da lei por meio de um componente visual circular.

**Critérios de aceite:**

- O componente deve mudar de cor conforme a faixa da nota.
- A visualização deve ser consistente com a identidade visual do Figma.

### RF09 - Listar leis já avaliadas

**Origem:** Issue `#47`.

**Descrição:** O sistema pode permitir que o usuário consulte leis previamente avaliadas.

**Critérios de aceite:**

- A listagem deve exibir título, data e score.
- A busca deve permitir filtro simples por título ou data.

## Fora do escopo da Release 1

Os requisitos abaixo permanecem relevantes para o produto, mas devem ser planejados para a Release 2 ou sprints futuras:

| Requisito | Issue | Justificativa |
| --- | --- | --- |
| Cadastro de usuário | `#36` | Depende de fluxo de identidade mais completo. |
| Login de usuário | `#37` | Depende de autenticação e persistência de usuários. |
| Autenticação JWT | `#38` | Aumenta o risco técnico da R1. |
| CRUD completo de usuário | `#45` | Não é essencial para demonstrar qualidade legislativa. |
| Recuperação de senha | `#46` | Depende de envio de e-mail e segurança adicional. |
| Detecção avançada de ambiguidade | `#48` | Pode exigir NLP mais sofisticado. |
| Resumo inteligente com IA externa | `#49` | Depende de integração externa e política de uso de API. |

## Rastreabilidade

| Requisito | Issues relacionadas | Prioridade R1 |
| --- | --- | --- |
| RF01 | `#39`, `#40` | Must have |
| RF02 | `#29`, `#40` | Must have |
| RF03 | `#41` | Must have |
| RF04 | `#42` | Must have |
| RF05 | `#43`, `#44` | Must have |
| RF06 | `#60` | Should have |
| RF07 | `#50` | Should have |
| RF08 | `#51` | Could have |
| RF09 | `#47` | Could have |

## Critério de conclusão da issue #64

A issue `#64` pode ser considerada concluída quando:

- Os requisitos funcionais estiverem descritos de forma clara.
- Cada requisito tiver origem, descrição, critérios de aceite e arquivos relacionados.
- A documentação estiver publicada no MkDocs.
- O escopo da Release 1 estiver separado do que fica para Release 2.
- A equipe conseguir usar esta página como referência para Sprint Planning, implementação e validação.
