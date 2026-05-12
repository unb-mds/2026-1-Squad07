# Documentação do Projeto Squad 07

Bem-vindo à documentação do projeto Squad 07. Este site contém documentação abrangente sobre a arquitetura do nosso projeto, detalhes de implementação e materiais de estudo.

## Visão Geral do Projeto

Squad 07 é um projeto 2026 que combina:
- **Backend**: FastAPI com PostgreSQL e Prisma ORM
- **Frontend**: Next.js com TypeScript
- **Infraestrutura**: Docker e pipelines CI/CD
- **Componentes de IA**: Agentes de IA e processamento de linguagem natural

### Escopo

#### Objetivo
Desenvolver um sistema de monitoramento para avaliar a qualidade técnica de proposições legislativas, gerando um "Score de Qualidade Legislativa".

#### Foco da Análise
Tamanho e complexidade, clareza textual, uso de referências legais e consistência com legislações existentes.

#### Fase 1: Escopo do MVP (Release 1)
> **Meta da Release:** Validar a jornada do usuário e provar a integração de todas as camadas arquiteturais do sistema (Front-end, Back-end e Banco de Dados), utilizando dados simulados para a inteligência.

**Épico 1: Infraestrutura e Setup**
* **Tarefa:** Inicialização e configuração dos repositórios base (FastAPI no back e Next.js no front).
* **Tarefa:** Definição e aplicação da identidade visual base do projeto.
* **Tarefa:** Exportação e documentação final do User Story Mapping (USM).

**Épico 2: Acesso e Identidade**
* **User Story:** Como usuário, quero me autenticar de forma básica em uma tela simples de login para conseguir acessar o dashboard.

**Épico 3: Descoberta (Submissão de Leis)**
* **User Story:** Como sistema, preciso de um endpoint no backend para receber e salvar os textos enviados.
* **User Story:** Como usuário, quero colar o texto da lei em uma área de submissão na tela Home para enviá-la para avaliação.

**Épico 4: Motor de Inteligência (Simulação)**
* **User Story:** Como sistema, preciso calcular um Score simulado no backend para alimentar os gráficos visuais na fase de MVP.

**Épico 5: Visualização de Dados**
* **User Story:** Como sistema, preciso integrar a biblioteca de visualização de dados (ex: D3.js) no frontend.
* **User Story:** Como usuário, quero visualizar a Média Geral das Leis no topo da Home como referencial.
* **User Story:** Como usuário, quero visualizar o texto submetido ao lado de um gráfico com a nota principal renderizada.

#### Fase 2: Roadmap Futuro (Pós-MVP)
> **Meta da Fase:** Implementação do motor real de Processamento de Linguagem Natural (NLP), evolução da infraestrutura e aprofundamento da experiência do usuário.

**Épico 1: Evolução de Infraestrutura e Arquitetura**

* **Tarefa:** Configuração final do banco PostgreSQL utilizando Prisma ORM.
* **Tarefa:** Containerização de ambientes estruturada para produção (Docker/Docker-compose).
* **Tarefa:** Deploy automatizado e configuração de pipeline CI/CD robusto (lint, build, testes).

**Épico 2: Acesso e Identidade Avançados**

* **User Story:** Criação de tela de cadastro e visualização/edição de perfil (CRUD) para histórico de leis.
* **User Story:** Implementação de fluxo de recuperação de senha por e-mail e login unificado via SSO (Google).

**Épico 3: Descoberta Avançada**

* **User Story:** Navegação em página de busca no catálogo com filtros avançados.
* **User Story:** Suporte para envio de leis através de upload direto de arquivos (.pdf / .docx).

**Épico 4: Motor de Inteligência (NLP Core)**

* **User Story:** Implementação de algoritmos reais de análise de texto no backend para cálculo de legibilidade.
* **User Story:** Geração automática de resumos curtos (leitura < 1 minuto) e sugestões de reescrita para trechos confusos.
* **User Story:** Comparação textual com leis consolidadas para detecção de repetições.

**Épico 5: Visualização de Dados Avançada**

* **User Story:** Renderização de cards laterais detalhando problemas e marcações (*highlights*) aplicadas diretamente sobre o erro no texto original.
* **User Story:** Exportação do resultado completo da análise em relatório PDF.

## Começando

### Pré-requisitos

- Docker e Docker Compose
- Python 3.x (para backend)
- Node.js 18+ (para frontend)

### Início Rápido

1. Clone o repositório
2. Execute `docker-compose up` para iniciar os serviços
3. Backend: `http://localhost:8000`
4. Frontend: `http://localhost:3000`
5. Documentação: `http://localhost:8001` (execute `mkdocs serve`)

## Estrutura da Documentação

- **Arquitetura** - Design do sistema, diagramas C4 e organização de pastas
- **Backend** - Endpoints da API, esquema de banco de dados e documentação de serviços
- **Frontend** - Biblioteca de componentes, estilos e arquitetura do frontend
- **Estudos** - Materiais de aprendizado sobre tecnologias, metodologias e melhores práticas

## Contribuindo

Ao adicionar documentação:
1. Crie arquivos markdown no diretório apropriado
2. Atualize a navegação do `mkdocs.yml`
3. Siga as melhores práticas de markdown
4. Inclua exemplos de código quando relevante

---

Última Atualização: 2026-05-12
