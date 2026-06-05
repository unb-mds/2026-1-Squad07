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

Para a **Release 1 (R1)**, a priorização focou exclusivamente no **Produto Mínimo Viável (MVP)**. A meta desta primeira entrega não é o motor completo de Processamento de Linguagem Natural (NLP), mas sim **validar a jornada do usuário e provar a integração das camadas arquiteturais** (Front-end com Next.js, Back-end com FastAPI e Banco de Dados), utilizando dados simulados para a inteligência. Tudo o que extrapola essa validação estrutural foi priorizado para o roadmap futuro (Fase 2).

## 3. Evolução do Escopo: Detalhamento da Release 2 e Roadmap

Após a homologação e validação da Release 1 (MVP), o escopo do projeto foi expandido e refinado. A jornada do usuário foi dividida em três horizontes claros para guiar o desenvolvimento do time de forma madura.

---

### Release 1: MVP (Concluído)
Focado no MVP com interface funcional e score simulado (mock).

* **Infraestrutura & DevOps:** Configuração inicial de repositórios e identidade visual base do projeto.
* **Acesso e Identidade:** Autenticação básica e simplificada para testes de fluxo.
* **Descoberta & Gestão de Acervo:** Endpoint inicial e área de submissão textual simples na Home.
* **Inteligência Artificial (NLP):** Cálculo de Score mockado no backend para alimentar componentes.
* **Visualização de Dados & Relatórios:** Gráficos interativos e Dashboard de visualização lado a lado.

---

### Release 2: Próxima Meta (Etapa Atual)
Expansão vertical do sistema, substituindo a lógica estática e simulada por persistência real e processamento de inteligência artificial aplicada.

#### Infraestrutura & DevOps
* **Tarefa Técnica:** Configurar ambientes local e de produção utilizando Docker e Docker-compose.
* **Tarefa Técnica:** Configurar o PRISMA ORM para o backend em Python.
  * Mapeamento de Dependência: Esta tarefa é bloqueante. O banco de dados precisa estar estruturado e integrado antes de liberar o desenvolvimento das telas de cadastro real e busca do catálogo.

#### Acesso e Identidade
* **US:** Como usuário, quero criar meu perfil em uma tela de cadastro para salvar meu histórico.
  * Mapeamento de Dependência: Depende da configuração do Prisma ORM para persistência dos dados cadastrais.
* **US:** Como usuário, quero visualizar e editar meus dados de perfil (CRUD) para mantê-los atualizados e garantir conformidade com regras de dados.

#### Descoberta & Gestão de Acervo
* **US:** Como usuário, quero navegar por uma página de busca para pesquisar leis do catálogo.
  * Mapeamento de Dependência: Depende da configuração do Prisma ORM para consulta e listagem dos registros do banco.

#### Inteligência Artificial (NLP)
* **US:** Como usuário, quero visualizar uma nota de legibilidade da lei, para saber o quão difícil é a sua leitura.
  * Mapeamento de Dependência: Bloqueia a interface. O processamento real do algoritmo métrico (como Flesch-Kincaid) precisa fornecer os dados para que o componente de marcações de texto funcione.
* **US:** Como usuário, quero ler um resumo curto gerado automaticamente, para entender a pauta em menos de 1 minuto.
  * Mapeamento de Dependência: Bloqueia a interface. A integração com LLM para sumarização alimenta os cards laterais de ambiguidade.

#### Visualização de Dados & Relatórios
* **US:** Como usuário, quero visualizar cards laterais detalhando os problemas de ambiguidade.
* **US:** Como usuário, quero ver marcações (highlights) direto no texto original indicando os erros.

---

### Futuro: Roadmap (Longo Prazo)
Extensões avançadas de funcionalidade, automações complexas de pipeline e integrações com ecossistemas externos de mercado.

* **Infraestrutura & DevOps:** Configuração de pipeline de CI/CD básico (lint e build) e deploy automatizado contínuo.
* **Acesso e Identidade:** Fluxo de recuperação de senha por e-mail e login integrado via SSO (Google).
* **Descoberta & Gestão de Acervo:** Aplicação de filtros avançados na busca e envio de leis fazendo upload direto de arquivo PDF/Docx com parser automático.
* **Inteligência Artificial (NLP):** Geração de sugestões ativas para reescrever trechos confusos e módulo de comparação semântica com textos legais já consolidados para evitar repetições.
* **Visualização de Dados & Relatórios:** Funcionalidade de exportação do relatório analítico completo em formato PDF.

---

## 4. Justificativa de Engenharia e Gestão de Riscos

O fatiamento horizontal adotado na transição para a Release 2 e Futuro isola riscos clássicos de desenvolvimento em engenharia de software:

1. **Mitigação de Gargalos Externos:** Funcionalidades que exigem serviços de terceiros e tokens OAuth (como Google SSO) ou chaves de servidores SMTP (recuperação de e-mail) foram movidas para o Roadmap Futuro. Isso garante que atrasos na configuração dessas ferramentas externas não bloqueiem a evolução do core business local.
2. **Fatiamento da Complexidade de IA:** Priorizar o resumo automatizado e as notas de legibilidade foca o esforço atual na estabilidade da conexão com as LLMs. Funcionalidades de maior complexidade algorítmica (como sugestões estruturadas de reescrita e análise de redundância normativa) ficam protegidas no roadmap para evitar desvios no escopo da sprint.

## 5. Quadro do User Story Mapping

Abaixo está o quadro interativo do USM, construído no Figma, que ilustra a jornada do usuário e o agrupamento das tarefas por épicos.

<iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="100%" height="600" src="https://embed.figma.com/board/36xgX88dsxdaDOt55acXei/Squad7?node-id=7048-820&embed-host=share" allowfullscreen></iframe>

> [Clique aqui para abrir a visualização em tela cheia](https://www.figma.com/board/36xgX88dsxdaDOt55acXei/Squad7?node-id=7048-820)