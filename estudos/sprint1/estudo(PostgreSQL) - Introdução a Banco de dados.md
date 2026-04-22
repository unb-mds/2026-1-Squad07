## Introdução

Para compreender o PostgreSQL, é importante entender o contexto em que ele se insere dentro da área de bancos de dados:

- **Banco de Dados:** É um sistema responsável por armazenar, organizar e gerenciar dados de forma persistente. Sem ele, aplicações precisariam lidar manualmente com armazenamento, aumentando o risco de perda e inconsistência das informações.

- **Sistemas Gerenciadores de Banco de Dados Relacionais (RDBMS):** São sistemas que utilizam o modelo relacional, estruturando os dados em tabelas compostas por linhas e colunas, que podem se relacionar entre si. Esses sistemas utilizam a linguagem SQL (*Structured Query Language*) para manipulação e consulta de dados.

- **Principais vantagens:** Entre seus diferenciais estão a estabilidade, a capacidade de lidar com grandes volumes de dados, suporte a consultas complexas e recursos avançados, como manipulação de dados em formato JSON e extensões para dados geoespaciais.



# PostgreSQL: O que é?

O PostgreSQL é um sistema gerenciador de banco de dados objeto-relacional, de código aberto, amplamente reconhecido por sua robustez, extensibilidade e alta conformidade com os padrões SQL.. Ele é amplamente utilizado em sistemas que exigem consistência e segurança das informações, mantendo também um bom desempenho em diferentes cenários.


## Como funciona?

### Arquitetura Cliente-Servidor

O PostgreSQL opera no modelo cliente-servidor. O servidor de banco de dados é responsável por armazenar e processar os dados, enquanto as aplicações atuam como clientes, enviando comandos SQL e recebendo os resultados das consultas.

### Modelo ACID

O funcionamento do PostgreSQL é baseado nas propriedades ACID, que garantem a confiabilidade das transações:

1. **Atomicidade:** As operações são executadas integralmente ou não são executadas.  
2. **Consistência:** O banco mantém a integridade dos dados conforme as regras definidas.  
3. **Isolamento:** Transações simultâneas não interferem indevidamente umas nas outras.  
4. **Durabilidade:** Após a confirmação de uma transação, os dados persistem mesmo em caso de falhas.


## Recursos e Capacidades

### Recursos Funcionais (o que o sistema oferece)

- **Consultas avançadas:** Suporte a *joins*, subconsultas e *window functions*.  
- **Extensibilidade:** Possibilidade de adicionar funcionalidades por meio de extensões, como o PostGIS para aplicações geoespaciais.  
- **Tipos de dados variados:** Suporte a diferentes formatos, incluindo JSON/JSONB, permitindo trabalhar com dados semi-estruturados.

### Recursos Não Funcionais (atributos de qualidade)

- **Segurança:** Controle de acesso detalhado, autenticação e suporte a criptografia.  
- **Escalabilidade:** Adequado para aplicações de pequeno, médio e grande porte.  
- **Conformidade com SQL:** Alto nível de aderência aos padrões da linguagem SQL.

## Contexto de Uso no Desenvolvimento

No desenvolvimento de software, o PostgreSQL é frequentemente utilizado como camada de persistência de dados, sendo integrado a diferentes tecnologias e práticas:

- **Conteinerização:** O uso com Docker facilita a padronização do ambiente de desenvolvimento entre equipes.  
- **Integração com ORMs:** Ferramentas como Prisma, TypeORM ou Django ORM permitem abstrair consultas SQL, facilitando o desenvolvimento.  
- **Garantia de integridade:** Por meio de *constraints* (restrições), o banco assegura a validade dos dados armazenados, como unicidade, integridade referencial e validações específicas.

### Referências e Fontes

1. [PostgreSQL: Documentation](https://www.postgresql.org/docs/current/index.html)
2. [PostgreSQL Tutorial - Beginner to Advanced](https://www.postgresqltutorial.com/)
3. [W3Schools: PostgreSQL Introduction](https://www.w3schools.com/postgresql/index.php/)
