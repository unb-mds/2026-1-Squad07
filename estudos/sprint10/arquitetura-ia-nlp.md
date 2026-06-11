# Estudo: Arquiteturas de IA e NLP para Análise Legislativa

**Conceito:** Padrões arquiteturais e tecnologias de IA/NLP para análise de texto legislativo
**Quem será o coelho:** pedrolrm
**Sprint:** Sprint 10
**Issue:** #105
**Épico:** motor-inteligência-nlp

---

## O que é?

Trata-se do conjunto de padrões arquiteturais e tecnologias usados para construir sistemas de IA que processam texto legislativo, extraem métricas de qualidade, identificam inconsistências e geram um score de qualidade técnica de proposições.

O fluxo conceitual é sempre o mesmo:

- **Entrada:** texto de uma proposição legislativa (projeto de lei, emenda, etc.).
- **Processamento:** um pipeline de NLP (normalização, tokenização, possivelmente análise sintática e extração de entidades, classificação).
- **Saída:** um score de qualidade somado a métricas detalhadas e apontamentos.

Este estudo centraliza os achados para orientar as decisões do **CrivoAI** na R2, dando base técnica às escolhas já registradas na arquitetura de integração (issue #106) e nas métricas de sucesso da IA (issue #107).

---

## Como funciona: o pipeline de NLP

Um pipeline típico de análise legislativa encadeia etapas, da mais simples à mais semântica:

1. **Normalização** — limpeza de texto, padronização de artigos/parágrafos, remoção de ruído de OCR quando o texto vem de PDF.
2. **Tokenização** — divisão em unidades (palavras, subpalavras). Modelos BERT usam *subword tokenization* (WordPiece).
3. **Análise sintática / morfológica** — POS tagging e dependências, úteis para regras linguísticas (ex.: detectar voz passiva, frases longas).
4. **Extração de entidades (NER)** — identificar referências a normas, datas, órgãos e dispositivos legais.
5. **Análise semântica / classificação** — onde entram os transformers: classificar o texto em categorias de problema ou gerar embeddings para comparação.
6. **Agregação e score** — converter as saídas das etapas anteriores em métricas e em um score final.

Nem todo sistema usa todas as etapas. A escolha de quais etapas existem é, em essência, a escolha entre as três abordagens descritas a seguir.

---

## 1. Rule-based vs. ML vs. LLM

A primeira decisão arquitetural é qual paradigma usar para a análise semântica. Os três não são exclusivos — sistemas reais costumam combiná-los.

| Aspecto | Rule-based (regras) | ML clássico / Deep Learning (BERT) | LLM generativo (GPT) |
|---|---|---|---|
| Como decide | Regras e léxicos escritos à mão | Aprende padrões de dados rotulados | Prompt sobre modelo gigante pré-treinado |
| Dados rotulados | Não precisa | Precisa (fine-tuning) | Pouco ou nenhum (few/zero-shot) |
| Explicabilidade | Alta (regra explícita) | Média (probabilidades) | Baixa (caixa-preta) |
| Risco de alucinação | Nenhum | Baixo | Alto |
| Custo de inferência | Muito baixo | Baixo/médio | Alto |
| Esforço de manutenção | Cresce com o nº de regras | Re-treino quando muda o domínio | Engenharia de prompt |
| Bom para | Checagens objetivas (frase longa, termo vago) | Classificação de problemas, NER | Resumo, explicação em linguagem natural |

**Rule-based.** Determinístico e explicável. Ideal para verificações objetivas: comprimento de frases, uso de voz passiva, presença de termos vagos ("etc.", "entre outros"), referências a normas inexistentes. Frágil para nuances semânticas.

**ML / Deep Learning (transformers).** Aprende a partir de exemplos rotulados. Encoders como o BERT são fortes em classificação e extração. Exige uma base rotulada e algum poder computacional, mas dá controle e baixo risco de alucinação.

**LLM generativo.** Modelos como GPT resolvem tarefas com poucos exemplos e produzem texto explicativo, mas têm custo e latência altos, risco de alucinação e menor controle — crítico num produto que avalia qualidade técnica e não pode "inventar" problemas.

**Recomendação para o CrivoAI:** abordagem **híbrida** — encoder (LegalBERT-pt/BERTimbau) para a classificação de problemas, complementado por **regras explicáveis** para checagens objetivas. LLM generativo fica reservado a um possível papel futuro de *explicação* dos apontamentos, nunca como fonte do score. Isso é coerente com a decisão de classificação multi-label registrada na issue #106 e com o limite baixo de alucinação das métricas (issue #107).

---

## 2. Transformer Models (BERT, GPT) para análise legislativa

Os Transformers usam o mecanismo de **atenção** para pesar a importância de cada palavra no contexto. Há duas famílias principais:

- **Encoders (BERT):** leem o texto bidirecionalmente e produzem representações ricas. Fortes em **classificação, NER e similaridade**. Limite de **512 tokens** por entrada.
- **Decoders (GPT):** geram texto de forma autorregressiva. Fortes em **resumo, geração e explicação**, e em tarefas few-shot.

Para **classificar** problemas de qualidade — a tarefa do CrivoAI — o encoder é a escolha natural.

### Modelos em português relevantes

| Modelo | Tipo | Observação |
|---|---|---|
| **BERTimbau** (neuralmind) | Encoder PT geral | Treinado no corpus brWaC; base sólida para fine-tuning em PT. |
| **LegalBERT-pt** | Encoder jurídico PT | Ajustado a documentos jurídicos brasileiros; lida bem com jargão (ver estudo da sprint 3). |
| **JurisBERT / variantes jurídicas** | Encoder jurídico PT | Alternativas treinadas em jurisprudência; avaliar disponibilidade e licença. |

> **Limite de 512 tokens.** Leis costumam exceder esse limite. As técnicas usuais são **truncamento** (perde conteúdo) ou **chunking + pooling** (divide em janelas e agrega), esta última preferível para não perder dispositivos. Essa etapa é a principal fonte de latência variável.

---

## 3. Ferramentas (spaCy, NLTK, Hugging Face Transformers)

| Ferramenta | Papel | Quando usar no CrivoAI |
|---|---|---|
| **spaCy** | NLP industrial: tokenização, POS, NER, dependências; modelos `pt_core_news_*` | Etapas linguísticas e regras explicáveis (frases longas, voz passiva, NER de referências). |
| **NLTK** | NLP clássico/acadêmico: tokenização, stemming, corpora | Prototipagem e ensino; menos indicado para produção. |
| **Hugging Face Transformers** | Carregar, fazer fine-tuning e servir modelos BERT/GPT | Núcleo da classificação com LegalBERT-pt/BERTimbau; ecossistema padrão com PyTorch. |

Essas ferramentas são complementares: spaCy/NLTK cobrem o pré-processamento e as regras; o Transformers cobre a parte semântica/aprendida. A combinação spaCy + Transformers é um padrão consolidado.

---

## 4. Datasets públicos de legislação em português

Levantamento inicial — **disponibilidade e licença de cada fonte devem ser confirmadas** antes de qualquer uso:

| Fonte / dataset | Conteúdo | Uso potencial |
|---|---|---|
| **LeNER-Br** | Corpus anotado de NER jurídica em PT-BR | Treinar/avaliar extração de entidades legais. |
| **brWaC** | Grande corpus web em PT (base do BERTimbau) | Pré-treino genérico; não é específico de legislação. |
| **LexML Brasil** | Rede de normas jurídicas com metadados | Coleta de textos de leis e referências cruzadas. |
| **Dados Abertos da Câmara / Senado** | Proposições, tramitações e textos | Construção do acervo e do catálogo classificado. |
| **Projeto Ulysses (Câmara dos Deputados)** | Recursos de NLP legislativo | Referência de tarefas e possíveis modelos. |

**Lacuna importante:** não há garantia de um dataset público **rotulado para qualidade legislativa** nos moldes do CrivoAI. O mais provável é que o time precise construir uma **base interna rotulada** (ver pendência NC-003 da spec de integração) a partir desses corpora.

---

## 5. Padrões de integração (batch, real-time, streaming)

| Padrão | Descrição | Aplicação no CrivoAI |
|---|---|---|
| **Batch** | Processa um lote de textos offline, sem pressa de latência | Classificar o acervo e popular o **catálogo** (`Law.sourceType = CATALOG`); preparar dados de treino. |
| **Real-time (on-demand)** | Classifica sob demanda, em resposta a uma requisição | Usuário envia lei nova/atualizada → `POST /api/v1/analysis/evaluate` responde na hora. |
| **Streaming** | Ingestão contínua de novos textos conforme são publicados | Futuro: acompanhar publicações (ex.: Diário Oficial) e classificar continuamente. |

Os dois primeiros padrões correspondem exatamente aos **dois fluxos** já decididos na arquitetura de integração (issue #106): batch para o catálogo/treino, real-time para a submissão do usuário. Streaming fica como evolução futura.

---

## 6. Performance e escalabilidade

- **Custo de inferência:** encoders BERT são bem mais leves que LLMs generativos, mas ainda se beneficiam de **batching** e, idealmente, GPU. Em CPU a inferência é viável para volumes moderados.
- **Textos longos:** o chunking aumenta o custo proporcionalmente ao tamanho do texto — principal variável de latência.
- **Cache:** resultados podem ser cacheados por hash de texto + versão de modelo, evitando reprocessar textos idênticos (padrão adotado na issue #106).
- **Alvos do projeto (issue #107):** latência inicial de até 2 s (acima de 5 s é lenta), throughput de ~30 análises/min em R2 e taxa de erro máxima de 0,1%.
- **Carregamento do modelo:** carregar uma vez na inicialização e manter quente em memória evita custo por requisição.

---

## 7. Estratégias de deploy (container, serverless, on-premise)

| Estratégia | Prós | Contras | Adequação |
|---|---|---|---|
| **Container (Docker)** | Reprodutível, alinhado ao stack do projeto | Exige orquestração para escalar | **Recomendado**: empacota modelo + API. |
| **Serverless** | Escala a zero, paga por uso | *Cold start* ruim para modelos grandes; limites de memória/tempo | Pouco indicado para BERT carregado em memória. |
| **On-premise / self-hosted** | Controle de dados e custo previsível | Responsabilidade de infraestrutura | Alinhado à decisão de modelo **auto-hospedado** (issue #106). |

**Recomendação:** modelo **auto-hospedado em container**, começando carregado no próprio processo do backend e evoluindo para um serviço de inferência separado quando o peso de `torch`/GPU justificar. Serverless é desaconselhado para o modelo em si por causa do cold start.

---

## Relação com o CrivoAI

Este estudo sustenta as decisões já tomadas no épico **motor-inteligência-nlp**:

- **Abordagem híbrida** (encoder + regras), com LLM generativo fora do caminho do score — coerente com o limite de alucinação das [métricas de sucesso da IA](../../docs/architecture/ai-success-metrics.md).
- **LegalBERT-pt como classificador multi-label**, auto-hospedado, com chunking para textos longos — detalhado na [arquitetura de integração IA → backend](../../docs/architecture/ai-integration.md).
- **Dois fluxos** (batch para catálogo/treino, real-time para submissão) e **deploy em container auto-hospedado**.

As lacunas que este estudo evidencia (ausência de dataset público rotulado para qualidade; necessidade de base interna) já estão registradas como pendências (NC-003 a NC-006) na spec `specs/002-requirements-r2/ai-integration.md`.

---

## Conclusão

Para a análise de qualidade legislativa do CrivoAI, a arquitetura mais adequada é **híbrida e encoder-first**: um modelo BERT em português (LegalBERT-pt ou BERTimbau com fine-tuning) para classificação de problemas, regras explicáveis para checagens objetivas, e LLM generativo reservado a explicações futuras. A integração segue dois fluxos (batch e real-time), com deploy em container auto-hospedado. O principal pré-requisito não resolvido é a **construção de uma base interna rotulada** de qualidade legislativa, já que não há dataset público pronto para essa tarefa.

---

## Referências

- Estudo da sprint 3 — `estudos/sprint3/Estudo(Agentes de IA e PLN) - Agentes de IA e Processamento de Linguagem Natural.md`.
- Arquitetura de integração IA → backend — `docs/architecture/ai-integration.md` (issue #106).
- Métricas de sucesso da IA — `docs/architecture/ai-success-metrics.md` (issue #107).
- Devlin et al. (2019). *BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding*.
- BERTimbau (Souza et al., 2020) — modelos BERT para português brasileiro: https://github.com/neuralmind-ai/portuguese-bert
- LeNER-Br — NER jurídica em PT-BR: https://github.com/peluz/lener-br
- Hugging Face Transformers: https://huggingface.co/docs/transformers
- spaCy (modelos em português): https://spacy.io/models/pt
- NLTK: https://www.nltk.org
- LexML Brasil: https://www.lexml.gov.br
- Dados Abertos da Câmara dos Deputados: https://dadosabertos.camara.leg.br
