# Histórico Didático de Sprints e Evolução das Releases

Este documento reconstrói de forma didática e cronológica o desenvolvimento do **CrivoAI**, detalhando o foco, os resultados e o impacto de cada Sprint na evolução do produto.

---

## 🎯 Por que este documento existe?

O desenvolvimento de software ágil é incremental. Compreender o que foi entregue em cada sprint ajuda o time, os avaliadores e futuros mantenedores a entenderem a evolução da arquitetura do CrivoAI e a maturidade das entregas de qualidade.

---

## 🚀 Fase de Concepção e Alinhamento (Fase de Planejamento)

Nesta fase inicial, o time não escreveu código físico. O foco foi entender o problema e desenhar o produto ideal.

### 📅 Sprint 00: Definição do Produto e Visão

* **Foco da Sprint:** Entender a dor do usuário e delimitar o escopo da plataforma.
* **O que foi feito (Didaticamente):** Definimos que o CrivoAI seria um assistente web para analisar e melhorar a redação técnica de leis. Elaboramos o Documento de Visão inicial.
* **Impacto no Projeto:** Alinhamento de expectativas do grupo sobre qual produto seria construído nas sprints seguintes.
* **Status:** Concluído.

### 📅 Sprint 01: Personas e Requisitos

* **Foco da Sprint:** Identificar quem usaria a plataforma e listar as necessidades técnicas do software.
* **O que foi feito (Didaticamente):** Criamos perfis fictícios de usuários (assessores legislativos e cidadãos comuns) para guiar o design e listamos o primeiro backlog de requisitos funcionais e não funcionais do sistema.
* **Impacto no Projeto:** Garantia de que o produto seria intuitivo para o público final e tecnicamente viável.
* **Status:** Concluído.

### 📅 Sprint 02: Especificação de Arquitetura

* **Foco da Sprint:** Escolher a stack tecnológica e planejar como os serviços conversariam entre si.
* **O que foi feito (Didaticamente):** Desenhamos os primeiros diagramas de blocos da aplicação. Escolhemos usar Next.js (frontend), FastAPI + Python (backend) e PostgreSQL (banco de dados) integrados por meio do Prisma ORM.
* **Impacto no Projeto:** Criação do mapa técnico que guiou toda a infraestrutura física de código do projeto.
* **Status:** Concluído.

### 📅 Sprint 03: Especificações das Specs (R1)

* **Foco da Sprint:** Criar as diretrizes de desenvolvimento para a primeira versão (MVP).
* **O que foi feito (Didaticamente):** Escrevemos os rascunhos das primeiras especificações técnicas (specs) na pasta `specs/`, mapeando como seriam as telas e a API de submissão e login de usuários.
* **Impacto no Projeto:** Estabelecimento do padrão SDD/TDD do time para garantir que nenhuma feature começasse a ser programada sem antes possuir um plano de testes bem definido.
* **Status:** Concluído.

---

## 🚀 Release 1 (R1): Construção do MVP (Mínimo Produto Viável)

Esta fase focou em erguer a infraestrutura física e entregar as funcionalidades básicas de submissão e leitura.

### 📅 Sprint 04: Configuração e Dockerização do Ambiente

* **Foco da Sprint:** Criar o ambiente de desenvolvimento idêntico para todos os programadores do grupo.
* **O que foi feito (Didaticamente):** Criamos a infraestrutura com Docker. A partir desta sprint, qualquer desenvolvedor podia rodar o banco de dados e o servidor com um único comando em sua máquina, sem problemas de compatibilidade do Windows/Linux.
* **Impacto no Projeto:** Padronização do ambiente local de trabalho e aceleração no onboarding da equipe.
* **Status:** Concluído.

### 📅 Sprint 05: Modelagem de Dados Inicial

* **Foco da Sprint:** Estruturar a tabela onde os dados das leis e dos usuários seriam salvos de forma permanente.
* **O que foi feito (Didaticamente):** Criamos as primeiras migrations de banco de dados com o Prisma, gerando fisicamente as tabelas `User` e `Law` no Postgres.
* **Impacto no Projeto:** Habilitação do armazenamento persistente do projeto, permitindo que a API começasse a gravar dados reais.
* **Status:** Concluído.

### 📅 Sprint 06: Tela e Rota de Submissão de Leis

* **Foco da Sprint:** Permitir que o usuário envie um texto de lei para a plataforma.
* **O que foi feito (Didaticamente):** Criamos a primeira tela interativa no frontend (formulário de envio de texto) e a rota `POST /api/v1/laws` no backend para receber e persistir esse texto no banco.
* **Impacto no Projeto:** Conclusão do primeiro fluxo completo de ponta a ponta (Frontend $\rightarrow$ Backend $\rightarrow$ Banco de Dados) do MVP.
* **Status:** Concluído.

### 📅 Sprint 07: Consulta e Detalhamento de Leis

* **Foco da Sprint:** Exibir na tela os textos das leis que foram submetidos anteriormente.
* **O que foi feito (Didaticamente):** Criamos a tela de listagem de leis cadastradas e a rota de consulta individual por ID. Ao clicar em uma lei da lista, o usuário passava a ver o texto completo na tela.
* **Impacto no Projeto:** Habilitação do fluxo básico de leitura, permitindo que o usuário consulte os documentos arquivados no sistema.
* **Status:** Concluído.

### 📅 Sprint 08: Autenticação de Usuários (Login/Registro)

* **Foco da Sprint:** Garantir a segurança do sistema e permitir o login de usuários.
* **O que foi feito (Didaticamente):** Implementamos a criptografia de senhas no backend, a geração de tokens de acesso JWT e criamos as telas de Login e Registro no frontend integradas ao `AuthContext`.
* **Impacto no Projeto:** Proteção das rotas e das informações, garantindo a autoria de cada lei submetida.
* **Status:** Concluído.

### 📅 Sprint 09: Homologação e Testes de R1

* **Foco da Sprint:** Garantir a qualidade do MVP R1 e corrigir falhas de integração.
* **O que foi feito (Didaticamente):** Rodamos baterias de testes automatizados e refinamos a interface do usuário. Criamos a documentação de encerramento da Release 1.
* **Impacto no Projeto:** Entrega de um produto functional e estável para a banca avaliadora da disciplina.
* **Status:** Concluído.

---

## 🧠 Release 2 (R2): Inteligência Artificial e Análises de Qualidade

Esta fase transformou o visualizador básico de leis em um assistente inteligente com análise automatizada de qualidade técnica.

### 📅 Sprint 10: Classificador LegalBERT-pt

* **Foco da Sprint:** Integrar inteligência artificial para avaliar problemas no texto da lei.
* **O que foi feito (Didaticamente):** Criamos a rota `POST /api/v1/analysis/evaluate` acoplada ao modelo de PLN auto-hospedado **LegalBERT-pt**. O modelo passou a ler as frases e indicar a confiança de ocorrência de quatro problemas: ambiguidade, vagueza, falta de referência e inconsistência.
* **Impacto no Projeto:** Injeção de inteligência automática no produto, indo além de um simples visualizador estático.
* **Status:** Concluído.

### 📅 Sprint 11: Tela e Gráficos de Qualidade

* **Foco da Sprint:** Apresentar de forma visual e intuitiva o resultado da inteligência artificial para o usuário.
* **O que foi feito (Didaticamente):** Desenvolvemos componentes gráficos e barras de confiança na página de detalhes da lei para exibir a pontuação geral da lei (score de qualidade) e o peso de cada indicador problemático.
* **Impacto no Projeto:** Melhoria significativa na experiência do usuário (UX), permitindo uma rápida avaliação da qualidade do texto legislativo.
* **Status:** Concluído.

### 📅 Sprint 12: Legibilidade Flesch-Kincaid e Permissões

* **Foco da Sprint:** Medir o nível de clareza do texto e ajustar políticas de segurança da API.
* **O que foi feito (Didaticamente):** Implementamos o algoritmo matemático do índice Flesch-Kincaid (adaptado para a estrutura sintática do português) para indicar a facilidade de leitura do documento. Também corrigimos as rotas de perfil de usuário para impedir acessos não autorizados.
* **Impacto no Projeto:** Fornecimento de métricas duplas (legibilidade textual + qualidade jurídica) no mesmo painel de informações da lei.
* **Status:** Concluído.

### 📅 Sprint 13 (Sprint Atual): Resumos Automáticos por IA e Perfil do Usuário

* **Foco da Sprint:** Gerar resumos simplificados das leis com IA generativa e refinar a tela de perfil do usuário.
* **O que foi feito (Didaticamente):** Integramos a API do Google Gemini para explicar em linguagem simples as leis complexas de forma assíncrona paralela (sem travar o servidor). Criamos a tela de Perfil com formulários de edição e Toasts de feedback visual instantâneo.
* **Impacto no Projeto:** Fechamento de todos os requisitos funcionais planejados para a inteligência da R2 e correção de blockers de compilação do Next.js.
* **Status:** Concluído.

### 📅 Sprint 14: Homologação da R2 e Deploy Contínuo (CD)

* **Foco da Sprint:** Colocar a aplicação em produção e documentar os marcos finais.
* **O que foi feito (Didaticamente):** Criamos a branch de documentação, o guia de deploy contínuo distribuído (Vercel + Render + Supabase) e aplicamos com sucesso as migrações estruturais do banco de dados na nuvem.
* **Impacto no Projeto:** Disponibilização pública da plataforma CrivoAI na internet e consolidação das entregas de DevOps.
* **Status:** Concluído (Fase de Homologação de Deploy).

---

## 📊 Como Validar esta Documentação
O progresso cronológico destas sprints pode ser verificado de forma automatizada através do **Dashboard de Métricas do Projeto** no arquivo [docs/metricas/index.html](../metricas/index.html), que extrai dados em tempo real dos commits, milestones e issues finalizadas no GitHub.
