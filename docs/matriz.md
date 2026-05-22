# Matriz Esforço x Impacto

## Objetivo
Esta página apresenta a **Matriz de Esforço x Impacto** utilizada no planejamento da **Release 1 (R1)** do projeto. A ferramenta foi adotada para priorizar os requisitos e funcionalidades, permitindo à equipe focar na entrega de maior valor e na estruturação arquitetural do sistema com o menor custo viável nesta primeira etapa.

## Critérios de Avaliação
Para alocar os Requisitos Funcionais (RFs) na matriz, a equipe utilizou os seguintes parâmetros:

- **Impacto (Eixo Y):** Grau de valor entregue ao usuário final e relevância para a validação do fluxo principal de negócio (core) na Release 1.
- **Esforço (Eixo X):** Complexidade técnica, tempo de pesquisa, implementação e configuração de infraestrutura exigidos da equipe.

## Análise e Justificativa da Priorização
A distribuição dos requisitos reflete a estratégia da equipe de garantir uma fundação sólida para o sistema, isolando regras de negócio complexas que poderiam travar o ciclo de desenvolvimento da R1:

- **Isolamento de Complexidade (Time Wasters):** O cálculo real das métricas de legibilidade (RF09), a consolidação do score final (RF10) e a geração de relatórios visuais avançados (RF11) foram mapeados como Alto Esforço e Baixo Impacto *para o contexto da R1*. Tentar desenvolvê-los agora consumiria o tempo da equipe sem validar o fluxo básico de dados. Eles foram postergados conscientemente.
- **Foco na Espinha Dorsal (Major Projects):** O fluxo de persistência concentra o maior esforço necessário. O recebimento (RF02) e a persistência (RF03) da submissão no backend exigem a configuração inicial de infraestrutura, banco de dados e rotas, justificando o posicionamento em **Alto Esforço**, mas com **Alto Impacto** por estruturarem o core do sistema.
- **Aceleração de Valor (Quick Wins):** Para destravar a demonstração e o frontend sem depender da lógica complexa citada acima, a equipe priorizou o uso de textos de exemplo (RF06) e a estruturação da documentação (RF08). Isso entrega valor imediato de visualização e transparência do processo.

## Relação com os Requisitos da Release 1
Com base nessa análise, o escopo da Release 1 foi estruturado consumindo os itens mapeados na matriz:

**Alto Impacto e Baixo Esforço (Quick Wins)**

- **RF06 - Consultar textos legislativos de exemplo:** O projeto deve possuir uma base inicial de textos reais ou realistas para apoiar a demonstração da Release 1.
- **RF08 - Disponibilizar documentação da Release 1:** O projeto deve disponibilizar documentação navegável contendo requisitos, visão do produto, arquitetura, processo e métricas.

**Alto Impacto e Alto Esforço (Major Projects)**

- **RF01 - Submeter texto legislativo:** O sistema deve permitir que o usuário informe um título e o texto de uma proposição legislativa para cadastro e análise futura.
- **RF02 - Receber submissão legislativa via API:** O backend deve disponibilizar uma rota para receber o texto legislativo enviado pelo frontend.
- **RF03 - Persistir submissão legislativa:** O sistema deve registrar a submissão recebida em uma estrutura persistente, permitindo consulta posterior.
- **RF04 - Listar submissões legislativas cadastradas:** O sistema deve permitir visualizar as submissões cadastradas para demonstrar que os textos enviados foram recebidos.

**Baixo Impacto e Baixo Esforço (Fill-ins)**

- **RF05 - Consultar detalhes de uma submissão:** O sistema deve permitir consultar as informações principais de uma submissão específica.
- **RF07 - Exibir resultado básico ou status da submissão:** O sistema deve exibir ao usuário um resultado simples após a submissão, mesmo que a análise avançada ainda não esteja disponível.

**Baixo Impacto e Alto Esforço (Time Wasters) - *Fora do escopo da R1***

- **RF09 - Calcular índice inicial de legibilidade:** O sistema pode calcular uma métrica inicial de dificuldade de leitura.
- **RF10 - Calcular score final de qualidade legislativa:** O sistema pode consolidar métricas de qualidade em uma nota final.
- **RF11 - Exibir relatório visual de qualidade:** O sistema pode apresentar relatório visual de qualidade legislativa.

**Definição do Escopo da R1**
A priorização determinou que a **Release 1 focará integralmente nos quadrantes de Quick Wins e Major Projects**, garantindo a infraestrutura base e o fluxo central de envio e salvamento de dados. Os itens classificados como Fill-ins entrarão como oportunidades caso haja sobra na sprint, enquanto os Time Wasters ficam retidos para o planejamento das próximas releases.

## Visualização da Matriz
Abaixo, você pode interagir com a matriz gerada pela equipe:

<iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src="https://embed.figma.com/board/36xgX88dsxdaDOt55acXei/Squad7?node-id=7163-492&embed-host=share" allowfullscreen></iframe>