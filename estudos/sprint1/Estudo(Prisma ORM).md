**Prisma ORM**

**O que é?**
O Prisma ORM é uma ferramenta de interação com bancos de dados relacionais que substitui os padrões tradicionais por um modelo estritamente declarativo e focado em segurança de tipagem.

**Como funciona?**
Ele utiliza um arquivo central `schema.prisma` como fonte única da verdade (SSoT). A partir desse arquivo, ele gera um cliente fortemente tipado para a aplicação, gerencia migrações de banco de dados e fornece uma interface gráfica para visualização dos registros.

**Quem será o coelho?**
Jonathan Lourenço Carpaneda

**Tópicos a serem estudados:**

- [x] O que é Prisma ORM?  
- [x] Arquitetura e Funcionamento (Schema, Client e Migrate) 
- [x] Benefícios e Segurança de Tipagem
- [x] Otimização de Performance
- [x] Prisma Studio: Exploração Visual de Dados

**Notion de estudo detalhado:**
[Estudo Técnico Detalhado](https://www.notion.so/Estudo-T-cnico-Prisma-ORM-Stack-Mista-334ad58c64d6808db9a9ffb05d2d7313)

# **Prisma ORM**

### **O que é Prisma ORM?**

O Prisma ORM é uma ferramenta que facilita a comunicação entre o código da aplicação e o banco de dados relacional (como PostgreSQL). Diferente de ORMs tradicionais que tentam esconder o SQL através de abstrações complexas, o Prisma foca na **segurança de tipagem**. Isso significa que o desenvolvedor recebe erros de compilação se tentar acessar uma coluna que não existe ou enviar um tipo de dado errado, reduzindo drasticamente bugs em produção. Ele é projetado para ser intuitivo e ergonômico, facilitando a modelagem de dados sem perder o controle sobre a estrutura relacional.

### **Arquitetura e Funcionamento (Schema, Client e Migrate)**

O ecossistema do Prisma opera através de três componentes fundamentais que trabalham em harmonia:

* **Prisma Schema (schema.prisma):** É o coração da ferramenta. Nele, o desenvolvedor define o modelo de dados de forma declarativa. Ele funciona como a **Única Fonte da Verdade (SSoT)** do projeto: a partir daqui, tanto o banco de dados quanto o código da aplicação são sincronizados.  
* **Prisma Client:** É um construtor de consultas gerado automaticamente a partir do esquema. Como ele é autogerado, ele conhece exatamente quais tabelas e campos existem no seu projeto específico, oferecendo um autocompletar perfeito na IDE e garantindo que os dados retornados correspondam exatamente ao que foi modelado.  
* **Prisma Migrate:** Um sistema híbrido de modelagem e controle de versão. Ele observa as mudanças feitas no arquivo de esquema e gera arquivos SQL que representam as alterações. Esses arquivos podem ser revisados e auditados, permitindo uma evolução segura e previsível da estrutura do banco de dados.

### **Principais Pontos do Prisma**

O uso do Prisma traz vantagens significativas para o ciclo de vida do desenvolvimento:

* **Segurança por Design:** O Prisma protege a aplicação contra injeção de SQL por padrão, tratando as consultas de forma parametrizada.  

* **Produtividade na Modelagem:** Criar relacionamentos complexos (1:1, 1:N, N:N) é feito de forma simples no arquivo de esquema, e o Prisma cuida da criação das chaves estrangeiras e tabelas intermediárias automaticamente.

### **Otimização de Performance (Estratégia de Junção)**

Uma das maiores inovações tecnológicas do Prisma é como ele lida com a eficiência das consultas. Historicamente, muitos ORMs sofrem com o problema de "N+1 queries" (fazer várias consultas pequenas em vez de uma grande).

O Prisma resolve isso através da diretiva relationLoadStrategy: "join". Quando habilitada, o Prisma compila a consulta em um único SQL avançado utilizando o motor do banco de dados (como o LATERAL JOIN e json\_agg do PostgreSQL). Isso permite que estruturas de dados altamente complexas e aninhadas sejam recuperadas em uma única viagem ao banco de dados, reduzindo o consumo de recursos e a latência da aplicação.

### **Prisma Studio: Exploração Visual de Dados**

Um benefício exclusivo é o **Prisma Studio**, uma interface gráfica integrada que permite visualizar e editar os dados do seu banco de dados diretamente no navegador.

* **Sem Necessidade de SQL:** É possível filtrar, ordenar e editar registros sem escrever uma única linha de código.  
* **Facilidade em Desenvolvimento:** É uma ferramenta indispensável para testar se os dados estão sendo inseridos corretamente ou para ajustar estados de teste de forma rápida durante o desenvolvimento local.
