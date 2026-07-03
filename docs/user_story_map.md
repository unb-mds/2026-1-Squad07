# User Story Mapping

## 1. Objetivo e Contexto

O **User Story Mapping (USM)** é uma técnica visual e colaborativa utilizada para organizar o backlog do produto a partir da perspectiva da jornada do usuário. Diferente de uma lista linear de requisitos, o USM permite visualizar o quadro geral do sistema, garantindo que as entregas agreguem valor contínuo e façam sentido na experiência final.

No contexto deste projeto, o objetivo do sistema é desenvolver uma plataforma de monitoramento para avaliar a qualidade técnica de proposições legislativas, gerando um **"Score de Qualidade Legislativa"**. O foco da análise recai sobre métricas como:

* Tamanho e complexidade;
* Clareza textual;
* Uso de referências legais;
* Consistência com legislações existentes.

O mapeamento estruturado a seguir foi fundamental para alinhar a visão do produto e definir as prioridades iniciais de desenvolvimento.

## 2. Relação com Requisitos e Priorização da Release 1 (R1)

O USM foi a ferramenta principal para organizar os requisitos levantados e estabelecer uma linha de corte clara entre o que é essencial para validar o sistema e o que será desenvolvido no futuro. 

Para a **Release 1 (R1)**, a priorização focou exclusivamente no **Produto Mínimo Viável (MVP)**. A meta desta primeira entrega foi validar a jornada do usuário e provar a integração das camadas arquiteturais básicas (Front-end com Next.js, Back-end com FastAPI e Banco de Dados), utilizando dados simulados (mock) para os componentes de inteligência não implementados. Esta fase inicial encontra-se concluída e integrada ao projeto.

## 3. Evolução do Escopo: Detalhamento da Release 2 e Roadmap

Após a homologação e validação da Release 1 (MVP), o escopo do projeto foi expandido e refinado para incorporar as práticas de Engenharia de Software da metodologia XP. A jornada do usuário foi dividida em três horizontes claros para guiar o desenvolvimento do time de forma madura.

---

### Release 1: MVP (Concluído)
Focado no MVP com interface funcional e score simulado (mock).

* **Infraestrutura & DevOps:**
    * Configuração inicial de repositórios e identidade visual base do projeto.
    * Configuração do ambiente de desenvolvimento local utilizando Docker e Docker-compose.
    * Configuração do Prisma ORM, incluindo definição do schema de dados, migrations e client em uso integrado ao Back-end.
* **Acesso e Identidade:**
    * Autenticação básica e simplificada para testes de fluxo.
    * Tela de cadastro de usuário no Front-end.
* **Descoberta & Gestão de Acervo:**
    * Endpoint inicial e área de submissão textual simples na Home.
    * Página de busca no Front-end e listagem real de submissões via banco de dados.
* **Inteligência Artificial (NLP):**
    * Cálculo de Score mockado no Back-end para alimentar componentes visuais da interface.
* **Visualização de Dados & Relatórios:**
    * Gráficos interativos e Dashboard de visualização lado a lado.

---

### Release 2: Próxima Meta (Etapa Atual)
Expansão vertical do sistema, substituindo a lógica estática por persistência real, arquitetura de testes robusta e processamento de inteligência artificial via agente proprietário. Toda a implementação desta fase é guiada por TDD.

#### Infraestrutura & DevOps
* **Tarefa Técnica:** Configuração e automação do pipeline de CI/CD básico.
    * Diretriz XP: Prioridade nesta fase para suportar a integração contínua do TDD e garantir que nenhum código seja integrado sem validação automatizada.

#### Acesso e Identidade
* **US:** Como usuário, quero visualizar e editar meus dados de perfil (CRUD de perfil no Front-end) para mantê-los atualizados e garantir conformidade com regras de dados.
    * Mapeamento de Dependência: A persistência e as rotas lógicas no Back-end já estão prontas, restando a implementação da interface de gerenciamento logado no Front-end.

#### Inteligência Artificial (NLP)
* **Tarefa Técnica:** Desenvolver a especificação técnica do Agente de IA proprietário em `specs/`, mapeando o comportamento esperado, engenharia de prompts e limites de escopo.
* **Tarefa Técnica:** Estruturar o plano de testes e validações de inferência estatística no `test-plan.md` para mitigação de alucinações do modelo.
* **US:** Como usuário, quero visualizar uma nota de legibilidade da lei, para saber o quão difícil é a sua leitura.
    * Mapeamento de Dependência: Bloqueia a interface. O processamento real do algoritmo métrico (como Flesch-Kincaid) precisa fornecer os dados para que o componente de marcações de texto funcione.
* **US:** Como usuário, quero ler um resumo curto gerado automaticamente pelo Agente de IA, para entender a pauta rapidamente.
    * Mapeamento de Dependência: Bloqueia a interface. O retorno estruturado do agente proprietário de IA alimenta os cards laterais de ambiguidade.

#### Visualização de Dados & Relatórios
* **US:** Como usuário, quero visualizar cards laterais detalhando os problemas de ambiguidade apontados pela IA.
* **US:** Como usuário, quero ver marcações (highlights) direto no texto original indicando os erros identificados pelo agente de IA.

---

### Futuro: Roadmap (Longo Prazo)
Extensões avançadas de funcionalidade, automações complexas de pipeline e integrações com ecossistemas externos de mercado.

* **Acesso e Identidade:** Fluxo de recuperação de senha por e-mail e login integrado via SSO (Google).
* **Descoberta & Gestão de Acervo:** Aplicação de filtros avançados na busca e envio de leis fazendo upload direto de arquivo PDF/Docx com parser automático.
* **Inteligência Artificial (NLP):** Geração de sugestões ativas para reescrever trechos confusos e módulo de comparação semântica com textos legais já consolidados para evitar repetições.
* **Visualização de Dados & Relatórios:** Funcionalidade de exportação do relatório analítico completo em formato PDF.

---

## 4. Estratégia de Implementação e Qualidade

Em estrita conformidade com a metodologia XP e com os princípios norteadores da disciplina, a execução técnica da Release 2 adota os seguintes pilares de qualidade:

### Garantia de Qualidade via TDD e Integração Contínua
Toda e qualquer funcionalidade relevante mapeada na Release 2 será rigorosamente guiada por Desenvolvimento Orientado a Testes (TDD). 

* **Fluxo de Trabalho:** O ciclo de desenvolvimento seguirá estritamente o rito *Red-Green-Refactor* (escrever um teste que falha, fazer o teste passar com o código mínimo, e refatorar para melhorar o design).
* **Obrigatoriedade de Artefatos:** Antes do início da codificação de qualquer nova User Story ou tarefa técnica, o par de desenvolvedores deve criar e submeter o respectivo arquivo `test-plan.md`, detalhando todos os cenários de teste, entradas, saídas esperadas e casos de borda.
* **Suporte de Automação:** A inclusão do setup de CI/CD no escopo ativo da Release 2 garante o feedback rápido necessário para o XP, impedindo o merge de códigos que quebrem os testes unitários ou fujam do linter do projeto.

### Engenharia do Agente de IA Proprietário
O motor de inteligência artificial não será tratado como uma simples API externa consumida de forma direta. O desenvolvimento do agente inteligente seguirá o Princípio I da nossa Constituição:

* **Especificação Técnica Integrada:** A implementação do agente exige uma especificação técnica isolada (*spec* própria), documentando a arquitetura do agente, o gerenciamento de contexto, a engenharia de prompts e as estratégias de mitigação de alucinações.
* **Validação de Inferência:** O plano de testes coletará métricas sobre as respostas do modelo para garantir a consistência das saídas textuais (resumos e detecção de ambiguidade) antes que os componentes visuais do Front-end consumam os payloads.

### Gestão de Mudanças e Novos Requisitos
Qualquer proposta de nova funcionalidade que surja ao longo do ciclo não deve ser adicionada de forma arbitrária ao escopo ativo. O desenvolvedor deve obrigatoriamente comunicar o time para que seja realizada uma análise conjunta de viabilidade, garantindo que o novo requisito seja condizente com a capacidade de entrega e com a arquitetura definida para a sprint.

## 5. Quadro do User Story Mapping

Abaixo está o quadro interativo do USM, construído no Figma, que ilustra a jornada do usuário e o agrupamento das tarefas por épicos.

<iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="100%" height="600" src="https://embed.figma.com/board/36xgX88dsxdaDOt55acXei/Squad7?node-id=7048-820&embed-host=share" allowfullscreen></iframe>

> [Clique aqui para abrir a visualização em tela cheia](https://www.figma.com/board/36xgX88dsxdaDOt55acXei/Squad7?node-id=7048-820)