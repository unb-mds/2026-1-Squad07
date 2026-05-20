# Matriz Esforço x Impacto

## Objetivo
Esta página apresenta a **Matriz de Esforço x Impacto** utilizada no planejamento da **Release 1 (R1)** do projeto. A ferramenta foi adotada para priorizar os requisitos e funcionalidades, permitindo à equipe focar na entrega de maior valor para o usuário com o menor custo de desenvolvimento viável nesta primeira etapa.

## Critérios de Avaliação
Para alocar as tarefas e User Stories na matriz, a equipe utilizou os seguintes parâmetros:

- **Impacto (Eixo Y):** Grau de valor entregue ao usuário final e relevância para o fluxo principal de negócio do sistema (core).
- **Esforço (Eixo X):** Complexidade técnica, tempo de pesquisa, implementação e configuração de infraestrutura exigidos da equipe.

## Análise e Justificativa da Priorização
A distribuição das tarefas reflete a estratégia arquitetural da equipe para isolar complexidades e garantir uma fundação sólida na Release 1:

- **Isolamento de Complexidade (Quick Wins):** A decisão de simular o cálculo do Score no backend foi estratégica para garantir alto impacto visual sem o esforço massivo de integrar uma IA real agora. A implementação dos gráficos com **D3.js** também foi classificada como baixo esforço sob a premissa de um escopo gráfico inicial bem delimitado e direto.
- **Foco na Espinha Dorsal (Major Projects):** O fluxo de autenticação e o envio do texto da lei concentram o maior esforço. A criação do endpoint de submissão no backend foi posicionada em **Alto Esforço** porque não contempla apenas a criação da rota, mas toda a configuração inicial de persistência de dados (setup do banco relacional, ORM e migrations).
- **Refinamento de Escopo:** A ausência total de itens no quadrante de "Time Wasters" (Alto Esforço / Baixo Impacto) demonstra que o escopo foi bem refinado antes da priorização. As tarefas de **Baixo Esforço / Baixo Impacto** (como a exibição da média geral) foram mapeadas apenas como complementos opcionais.

## Relação com os Requisitos da Release 1
Com base nessa análise, o escopo da Release 1 foi estruturado consumindo os itens mapeados na matriz:

**Alto Impacto e Baixo Esforço (Quick Wins)**

- Iniciar repositório de back e front end.
- Definir e aplicar a identidade visual base do projeto.
- Implementar os gráficos e métricas no front utilizando a biblioteca JavaScript D3.js.
- Implementar cálculo de Score no backend para alimentar os gráficos sem depender da IA real.
- Exportar a versão final do usim para o portal de documentação.

**Alto Impacto e Alto Esforço (Major Projects)**

- Criar endpoint de submissão no backend para receber e salvar os textos enviados.
- Como usuário, quero colar o texto da lei em uma área de submissão na Home para enviá-la para avaliação.
- Como usuário, quero me autenticar de forma básica em uma tela simples de login para conseguir acessar o dashboard.

**Baixo Impacto e Baixo Esforço (Fill-ins)**

- Como usuário, quero acessar a Tela de Dashboard para ver o meu texto ao lado da nota principal renderizada (gráfico).
- Como usuário, quero visualizar a Média Geral das Leis no topo da Home para ter um referencial de qualidade.

**Definição do Escopo da R1**
A priorização determinou que a **Release 1 focará 100% nos Quick Wins e Major Projects**, garantindo a infraestrutura e o fluxo central de submissão. Os itens complementares (Fill-ins) serão tratados como tarefas de oportunidade.

## Visualização da Matriz
Abaixo, você pode interagir com a matriz gerada pela equipe:

<iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src="https://embed.figma.com/board/36xgX88dsxdaDOt55acXei/Squad7?node-id=7163-492&embed-host=share" allowfullscreen></iframe>