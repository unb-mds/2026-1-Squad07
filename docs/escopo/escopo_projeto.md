# Escopo do Projeto

## Objetivo

O projeto Monitoramento de Qualidade de Leis tem como objetivo desenvolver uma plataforma web para apoiar a avaliação técnica de proposições legislativas. A proposta é permitir que textos relacionados a leis, projetos de lei e demais documentos legislativos sejam submetidos, organizados e analisados com base em critérios de qualidade textual, clareza, legibilidade, complexidade e consistência técnica.

A longo prazo, a plataforma deve gerar um Score de Qualidade Legislativa, ajudando pessoas relacionadas ao campo do Direito, da jurisdição, da pesquisa legislativa e da análise normativa a compreenderem melhor a qualidade de um texto legal antes de sua discussão, revisão ou consolidação.

## Problema

Textos legislativos costumam ser extensos, técnicos e, muitas vezes, difíceis de interpretar. A ausência de uma avaliação inicial estruturada pode dificultar a identificação de problemas como baixa legibilidade, excesso de complexidade, ambiguidades, uso inadequado de referências legais e inconsistências com legislações já existentes.

Esse cenário afeta estudantes, pesquisadores, profissionais do Direito, assessores, analistas legislativos e demais pessoas que precisam compreender, revisar ou acompanhar proposições normativas. O projeto busca reduzir essa dificuldade por meio de uma plataforma que centralize a submissão, organização e futura análise automatizada desses textos.

## Proposta de Solução

A solução planejada é uma plataforma web em que o usuário possa submeter um texto legislativo, visualizar o registro dessa submissão e obter uma análise técnica sobre a qualidade da proposição. Essa análise deve evoluir para incluir métricas de legibilidade, detecção de ambiguidade, identificação de pontos críticos e cálculo de um score final.


## Público-Alvo

A plataforma deve ser pensada para qualquer pessoa que trabalhe, estude ou tenha interesse em textos legislativos e jurídicos. O público-alvo inclui:

- estudantes de Direito e áreas relacionadas;
- pesquisadores de legislação, políticas públicas e ciência política;
- advogados e profissionais jurídicos;
- assessores legislativos;
- analistas de proposições normativas;
- pessoas interessadas em acompanhar e compreender melhor textos legais.

## Foco da Análise

O projeto foi planejado para avaliar aspectos técnicos de textos legislativos. Entre os pontos de análise previstos estão:

- tamanho e complexidade do texto;
- clareza textual;
- legibilidade;
- organização das ideias;
- uso de referências legais;
- consistência com legislações existentes;
- presença de termos ambíguos;
- identificação de trechos potencialmente problemáticos;
- geração de um score de qualidade legislativa.

## Escopo da Release 1

A Release 1 tem como foco validar a visão do produto, consolidar a documentação e preparar a base para a implementação completa. Ela deve demonstrar que o time compreendeu o problema, definiu o escopo do MVP, estruturou os requisitos e projetou a experiência esperada da plataforma.

Nesta etapa, o score de qualidade legislativa ainda não será implementado como funcionalidade real. O funcionamento completo da plataforma será representado no protótipo de alta fidelidade no Figma, mostrando como a experiência do usuário deve acontecer quando o sistema estiver implementado.

### Submissão, persistência e listagem

O fluxo de submissão, persistência e listagem representa a base operacional da plataforma.

**Submissão** é o momento em que o usuário informa um texto legislativo na plataforma. Esse envio pode conter, no mínimo, um título e o conteúdo da proposição ou lei. No produto final, essa submissão será o ponto de entrada para as análises de qualidade.

**Persistência** é o registro estruturado desse texto no sistema. Isso significa que a submissão não deve existir apenas temporariamente na tela; ela deve ser armazenada para consulta, análise futura e composição de histórico.

**Listagem** é a visualização das submissões já registradas. Esse recurso permite que o usuário acompanhe quais textos foram enviados, identifique cada submissão por título ou data e acesse informações básicas sobre o conteúdo.

Na R1, esse fluxo serve como referência para a implementação e para o protótipo. Na R2, ele deve ser implementado de forma funcional e integrada entre frontend, backend e banco de dados.

### Análise básica demonstrativa

A análise básica demonstrativa é uma representação inicial do que a plataforma deverá entregar nas próximas versões. Ela pode aparecer no protótipo como uma prévia de métricas, alertas ou indicadores, sem que o cálculo real esteja implementado na R1.

Essa análise pode demonstrar, por exemplo:

- indicação de que o texto foi recebido;
- status da análise, como "pendente", "em análise" ou "analisado";
- exemplo visual de score de qualidade legislativa;
- alertas simulados de frases longas, baixa clareza ou ambiguidade;
- relatório ilustrativo sobre pontos de atenção no texto.

O objetivo dessa demonstração é comunicar a experiência planejada do produto, não afirmar que a análise automatizada já está completa na Release 1.

## Entregas Esperadas Na R1

Na Release 1, o projeto deve entregar:

- documentação refinada dos requisitos funcionais;
- documentação dos requisitos não funcionais;
- matriz de rastreabilidade entre requisitos e planejamento;
- definição clara do escopo da R1 e da R2;
- protótipo de alta fidelidade no Figma;
- planejamento da curadoria de dados legislativos;
- documentação da estratégia de implementação dos dados;
- visão da arquitetura do sistema;
- organização do processo de desenvolvimento;
- roteiro de apresentação da R1.

## Curadoria de Dados na R1

A curadoria de dados legislativos na R1 será tratada como pesquisa inicial e documentação completa da estratégia de implementação. O objetivo é definir quais fontes podem ser utilizadas, como os dados devem ser coletados, quais cuidados precisam ser tomados e como esses textos poderão alimentar a plataforma na R2.

Essa etapa deve considerar fontes como portais oficiais, bases públicas de legislação, proposições legislativas e documentos normativos. A curadoria deve descrever critérios de seleção, formato esperado dos dados, possíveis campos de armazenamento e riscos relacionados à qualidade, atualização e confiabilidade das fontes.

Na R1, a curadoria não precisa entregar uma base automatizada completa. O mais importante é deixar claro como a equipe pretende obter, organizar e utilizar esses dados na implementação completa da Release 2.

## Fora do Escopo da R1

Não fazem parte da Release 1 como funcionalidades reais implementadas:

- score real de qualidade legislativa;
- análise automatizada completa de legibilidade;
- detecção real de ambiguidade;
- comparação automática com leis consolidadas;
- autenticação completa de usuários;
- histórico individual por usuário;
- integração com IA externa;
- dashboard analítico completo de leis;
- relatório final robusto de qualidade legislativa.

Esses itens podem aparecer no protótipo como visão de produto, mas devem ser tratados como implementação futura.

## Escopo da Release 2

A Release 2 será focada na implementação completa do trabalho planejado. O objetivo será transformar a visão documentada na R1 em funcionalidades reais, integradas e testáveis.

Na R2, o projeto deve avançar para:

- implementação funcional da submissão de textos legislativos;
- persistência das submissões no banco de dados;
- listagem e consulta de submissões cadastradas;
- implementação das primeiras métricas de legibilidade;
- cálculo inicial do score de qualidade legislativa;
- detecção de problemas textuais simples;
- evolução da análise de ambiguidades;
- integração entre frontend, backend e banco de dados;
- uso de dados legislativos curados;
- melhoria das telas com base no protótipo;
- criação de relatórios iniciais de qualidade;
- ampliação dos testes e validações do fluxo principal.

A R2 deve ser entendida como a fase em que o produto deixa de ser apenas planejado e demonstrado visualmente para se tornar uma plataforma funcional.

## Evolução do Escopo

O escopo descrito nesta documentação representa o entendimento atual do projeto para a Release 1 e o planejamento inicial da Release 2. Como o projeto segue uma abordagem ágil, esse escopo pode ser refinado ao longo das próximas sprints, conforme o time avance na implementação, valide o protótipo e receba novos feedbacks.

Assim, os itens previstos para a R2 devem ser entendidos como direção de evolução para a implementação completa do produto, e não como um escopo imutável.

## Premissas

O escopo do projeto considera as seguintes premissas:

- a plataforma será desenvolvida com frontend, backend e banco de dados separados;
- o frontend será responsável pela experiência do usuário;
- o backend será responsável por regras de negócio, validação e persistência;
- o banco de dados armazenará submissões e dados necessários para análise;
- a documentação deve ser mantida em português brasileiro;
- todo desenvolvimento deve seguir o fluxo de branches e Pull Requests;
- a R1 deve priorizar clareza, documentação e prototipação;
- a R2 deve priorizar implementação funcional.

## Restrições

O projeto possui algumas restrições importantes:

- a entrega da R1 está prevista para 27/05/2026;
- a equipe deve evitar funcionalidades complexas que ameacem a entrega;
- a R1 não deve depender de serviços pagos ou integrações externas obrigatórias;
- decisões arquiteturais fora do escopo devem ser validadas antes de implementação;
- alterações devem respeitar o fluxo de versionamento do projeto.

## Critérios de Sucesso da R1

A Release 1 será considerada bem-sucedida se:

- o escopo do projeto estiver documentado de forma clara;
- os requisitos funcionais e não funcionais estiverem refinados;
- o protótipo de alta fidelidade representar a experiência planejada;
- a estratégia de curadoria de dados estiver documentada;
- a arquitetura do sistema estiver compreensível;
- a equipe conseguir explicar o que entra na R1 e o que fica para a R2;
- a apresentação demonstrar a visão do produto e o caminho de implementação;
- o projeto estiver preparado para iniciar a implementação completa na R2.
