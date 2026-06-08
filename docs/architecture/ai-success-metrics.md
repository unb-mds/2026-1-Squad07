# Métricas de Sucesso da Análise de IA

## Objetivo

Este documento define quais métricas devem ser usadas para avaliar se a futura análise de IA do **CrivoAI** está funcionando bem o suficiente para produção ou se precisa de melhorias.

Sem essas métricas, o time não consegue diferenciar uma análise realmente útil de uma resposta apenas convincente visualmente. Para o CrivoAI, a IA precisa detectar problemas em textos legislativos, justificar os apontamentos, evitar padrões inventados e responder dentro de limites aceitáveis de operação.

## Contexto no Projeto

Na Release 1, a análise real de IA, o score real e o agente de IA continuam fora do escopo. Os indicadores exibidos em protótipo ou registros demonstrativos não representam processamento real.

As métricas deste documento são critérios planejados para R2 e versões futuras. Elas servem para orientar a implementação da análise automatizada, a revisão manual feita pelo Squad e o monitoramento do serviço quando a funcionalidade existir.

## Como os Valores Foram Definidos

Os valores abaixo são **thresholds iniciais de aceite**, não resultados já medidos pelo projeto. Eles foram definidos para criar uma régua mínima de qualidade antes de a análise de IA ser tratada como confiável.

A lógica usada foi:

- qualidade deve ser alta o suficiente para evitar recomendações enganosas;
- recall deve ser suficiente para não deixar passar a maioria dos problemas esperados;
- performance deve permitir uso em uma aplicação web sem travar a experiência;
- alucinação deve ter limite baixo, porque apontar problema inexistente reduz confiança no produto;
- disponibilidade e taxa de erro devem seguir um padrão mínimo de serviço estável;
- validação manual deve ser viável para o Squad, sem depender de pessoas externas.

Esses valores podem ser recalibrados quando o time tiver uma base maior de textos, mais dados de uso e uma implementação real da análise.

## Métricas de Qualidade

As métricas de qualidade medem se a IA acerta o conteúdo da análise. Elas respondem à pergunta: “o modelo está identificando problemas reais sem exagerar nem deixar passar muita coisa?”.

| Métrica | Valor definido | Como validar |
| --- | --- | --- |
| Precisão mínima | **85%** de acurácia mínima na base de validação | Comparar os apontamentos da IA com uma base interna rotulada pelo Squad. |
| Recall | **80%** dos problemas legislativos esperados detectados | Medir quantos problemas cadastrados na base de validação foram encontrados pela IA. |
| F1-Score | **0,82** como valor mínimo geral | Calcular o equilíbrio entre precisão e recall para evitar um modelo que acerta pouco ou deixa muitos problemas passarem. |
| Validação manual | **10%** das análises revisadas manualmente ou no mínimo **30 análises por sprint** | Revisar amostras internamente para identificar falsos positivos, falsos negativos, alucinação e falta de evidência textual. |

### Interpretação

**Precisão** indica se os apontamentos feitos pela IA são corretos. Se a precisão estiver baixa, o sistema está acusando problemas demais sem base suficiente.

**Recall** indica se a IA consegue encontrar os problemas que deveria detectar. Se o recall estiver baixo, o sistema parece limpo, mas deixa passar problemas relevantes.

**F1-Score** combina precisão e recall em uma única métrica. Ele ajuda quando precisão e recall estão em tensão: um modelo pode ser conservador demais e perder problemas, ou agressivo demais e apontar problemas inexistentes.

**Validação manual** é necessária porque a análise legislativa envolve texto, contexto e justificativa. Na primeira versão avaliável, essa revisão deve ser feita pelo próprio Squad, usando critérios internos e exemplos documentados.

## Métricas de Performance

As métricas de performance medem se a análise consegue funcionar dentro de uma experiência web aceitável. Elas respondem à pergunta: “o serviço de IA é rápido e estável o suficiente para o usuário?”.

| Métrica | Valor definido | Como validar |
| --- | --- | --- |
| Latência | **Até 2 segundos** para resposta inicial; acima de **5 segundos** deve ser tratado como análise lenta | Medir o tempo entre o envio da requisição e a resposta inicial do backend. |
| Throughput | **30 análises por minuto** em ambiente dimensionado para R2 | Executar teste de carga simples e contar quantas análises são concluídas por minuto. |
| Disponibilidade | **99,5%** de tempo disponível por mês | Monitorar se o endpoint ou serviço de análise está acessível quando necessário. |
| Taxa de erro | Máximo de **0,1%** de respostas inválidas ou falhas críticas | Contar erros 5xx, timeouts, falhas de modelo e respostas fora do formato esperado. |

### Interpretação

**Latência** é o tempo de espera do usuário. O alvo de 2 segundos vale para uma resposta inicial, como confirmação de recebimento ou início da análise. Caso a análise completa demore mais, o sistema pode evoluir para processamento assíncrono com status.

**Throughput** mede volume. O valor de 30 análises por minuto é um alvo inicial para R2, suficiente para validar estabilidade sem assumir escala de produção grande.

**Disponibilidade** mede se o serviço fica acessível. O alvo de 99,5% significa que a análise deve estar funcional na maior parte do tempo.

**Taxa de erro** mede falhas graves. Resposta inválida, erro de modelo ou timeout devem ser raros, porque prejudicam confiança e demonstração do produto.

## Métricas de Negócio

As métricas de negócio medem se a análise gera valor real para o produto. Elas respondem à pergunta: “o resultado ajuda o usuário a avaliar melhor uma proposição legislativa?”.

| Métrica | Valor definido | Como validar |
| --- | --- | --- |
| Confiabilidade | **98%** das análises devem produzir resultado válido | Verificar se a resposta possui score, categorias, justificativa e estrutura esperada. |
| Alucinação | Máximo de **2%** de apontamentos sem evidência no texto analisado | Revisar amostras e marcar casos em que a IA inventa padrões ou problemas inexistentes. |
| Viés | Diferença máxima de **5 pontos percentuais** de F1-Score entre tipos legislativos suportados | Comparar desempenho entre tipos como projeto de lei, lei ordinária, emenda e decreto. |
| Cobertura | Pelo menos **80%** dos tipos legislativos priorizados para a R2 | Medir quantos tipos possuem entrada suportada, resultado estruturado e critério de validação. |

### Interpretação

**Confiabilidade** não significa apenas “a IA respondeu”. A resposta precisa estar completa, em formato esperado e com justificativa compreensível.

**Alucinação** acontece quando a IA aponta um problema que não aparece no texto analisado. Esse limite precisa ser baixo porque o produto lida com avaliação técnica e pode induzir o usuário a conclusões erradas.

**Viés** mede diferença de desempenho entre tipos de legislação. Se a IA funciona bem para projeto de lei, mas mal para emenda, essa diferença precisa aparecer nas métricas.

**Cobertura** indica quais tipos legislativos o sistema consegue analisar com segurança. O sistema não deve prometer suporte amplo se ainda não possui validação para esses tipos.

## Limites e Thresholds

Os limites abaixo definem quando a análise deixa de ser considerada saudável e precisa de ação do time.

| Limite | Severidade | Ação esperada |
| --- | --- | --- |
| Latência acima de **5 segundos** | Atenção | Registrar como `slow_query` ou `slow_analysis`, investigar causa e tentar novamente quando isso não gerar análise duplicada. Esses nomes servem apenas para identificar análises lentas nos logs. |
| Precisão abaixo de **75%** | Alta | Aplicar flag para revisão manual e bloquear uso do resultado como análise confiável. |
| Alucinação acima de **5%** | Crítica | Suspender promoção do modelo ou prompt e iniciar retraining/reavaliação. |
| Disponibilidade abaixo de **95%** | Crítica | Gerar alerta crítico e registrar incidente operacional. |

Esses thresholds são limites de segurança. A métrica ideal deve ficar acima do valor-alvo; quando atinge os limites desta tabela, o sistema precisa gerar sinal claro para o time agir.

## Relação com Requisitos Não Funcionais

| RNF | Relação com as métricas de IA |
| --- | --- |
| RNF02 - API organizada e testável | A análise deve ter endpoint, contrato e validação local para medir latência, erro e resposta válida. |
| RNF04 - Separação entre frontend, backend e banco | A análise deve ficar no backend ou em serviço próprio; o frontend apenas apresenta status e resultado. |
| RNF05 - Configuração por variáveis de ambiente | Chaves de modelo, URLs e limites operacionais devem ser configurados sem hardcode. |
| RNF06 - Documentação navegável | As métricas ficam registradas em `docs/` e disponíveis na navegação do MkDocs. |
| RNF08 - Execução local mínima | O fluxo futuro de análise deve permitir validação em ambiente local ou controlado. |
| RNF09 - Escopo controlado para a R1 | O documento deixa claro que análise real de IA não faz parte do caminho crítico da R1. |
| RNF10 - Métricas de acompanhamento do projeto | A evolução da IA deve ser acompanhada por dados, não apenas por percepção subjetiva. |

## Plano de Monitoramento e Observabilidade

Monitoramento significa acompanhar se a IA está funcionando bem durante o uso. Observabilidade significa registrar informações suficientes para entender o que aconteceu quando uma análise foi lenta, falhou ou gerou resultado ruim.

Cada análise deve registrar um log estruturado. Um log estruturado é um registro em formato organizado, com campos fixos, para facilitar busca, comparação e investigação.

| Campo | O que significa |
| --- | --- |
| `analysis_id` | Identificador único da análise realizada. |
| `submission_id` | Identificador da submissão analisada. |
| `model_version` | Versão do modelo de IA usado, para saber qual versão gerou o resultado. |
| `prompt_version` | Versão das instruções enviadas para a IA, quando houver uso de prompt. |
| `law_type` | Tipo do texto analisado, como projeto de lei, emenda ou decreto. |
| `latency_ms` | Tempo de resposta em milissegundos. Exemplo: 2000 ms equivale a 2 segundos. |
| `status` | Resultado operacional da análise, como sucesso, erro ou pendente. |
| `error_type` | Tipo de erro, quando houver falha. |
| `manual_review_required` | Indica se a análise precisa ser revisada manualmente pelo Squad. |
| `created_at` | Data e horário em que a análise foi registrada. |

As métricas operacionais mínimas devem acompanhar:

- latência p50, p95 e p99;
- análises concluídas por minuto;
- taxa de erro;
- disponibilidade;
- quantidade de novas tentativas após falha ou lentidão;
- quantidade de análises marcadas para revisão manual;
- taxa de alucinação identificada em amostras;
- precisão, recall e F1-Score por tipo legislativo.

Para leitura das latências:

| Métrica | Como interpretar |
| --- | --- |
| p50 | Metade das análises respondeu nesse tempo ou menos. É uma visão do tempo comum. |
| p95 | 95% das análises responderam nesse tempo ou menos. Mostra se a maioria dos usuários está tendo boa experiência. |
| p99 | 99% das análises responderam nesse tempo ou menos. Ajuda a identificar casos muito lentos. |

Alertas mínimos:

| Alerta | Gatilho |
| --- | --- |
| Análise lenta | Latência acima de 5 segundos. |
| Erro elevado | Taxa de erro acima de 1% em 15 minutos. |
| Qualidade abaixo do mínimo | Precisão abaixo de 85% ou F1-Score abaixo de 0,82. |
| Alucinação crítica | Alucinação acima de 5%. |
| Indisponibilidade crítica | Disponibilidade abaixo de 95%. |

## Validação Antes de Produção

Antes de tratar a análise de IA como funcionalidade real, o Squad deve confirmar:

- a base interna de validação possui exemplos suficientes para os tipos legislativos priorizados;
- precisão, recall e F1-Score atingem os valores mínimos definidos;
- a revisão manual não encontrou taxa de alucinação acima do limite;
- o endpoint ou serviço de análise respeita os limites de latência, erro e disponibilidade;
- logs estruturados são gerados para cada análise;
- alertas mínimos estão definidos para lentidão, erro, baixa qualidade, alucinação e indisponibilidade;
- a documentação continua deixando claro o que está planejado para R2 e o que ainda não existe na R1.

## Estado Atual

Estas métricas são critérios planejados para a análise real de IA. Elas não indicam que o CrivoAI já possui modelo em produção, score real persistido ou agente jurídico operacional.
