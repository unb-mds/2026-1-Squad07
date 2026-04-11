**Objetivo:** Definir as tecnologias a serem usadas para a implementação do projeto durante o semestre
---

**Áreas de desenvolvimento e suas funções:**

Backend: Contém toda a lógica do sistema e regras de negócio

Frontend: É a interface em que o usuário vai ter contato, faz as solicitações para o Backend (API)

Banco de Dados: É o local em que os dados são armazenados, nesse projetos usaremos um banco de dados relacional. (É um tipo de banco de dados que organiza os dados em tabelas)

ORM: é uma técnica de desenvolvimento que conecta bancos de dados relacionais a linguagens de programação orientadas a objetos. (Permite manipular as tabelas do banco de dados usando código)

Infraestrutura (Docker): Separa todos os serviços acima em containers isolados, garantindo que todos trabalhem exatamente no mesmo ambiente técnico. (Evita conflitos de versão, configuração de banco de dados e etc)

---
**Tecnologias escolhidas:**

Backend: **Python** com o framework **FastAPI**  
Justificativa: O FastAPI é um framework de desenvolvimento de API’s moderno e de implementação relativamente simples. Além disso, o Python facilita a escrita e execução de scripts de coleta de dados (scraping) caso seja necessário para o projeto
Python: https://docs.python.org/3/tutorial/index.html
FastAPI: https://fastapi.tiangolo.com/

Frontend: **Next.js** e **TailwindCSS**  
Justificativa: É uma combinação que permite criar a interface do site de forma rápida, com um visual moderno e que funciona bem tanto no computador quanto no celular
Next.js: https://nextjs.org/docs
TailwindCSS: https://v2.tailwindcss.com/docs

Banco de Dados: **PostgreSQL**  
Justificativa: É um dos bancos de dados mais confiáveis e utilizados hoje em dia. Operações de leitura não travam operações de escrita e suporta conceitos de orientação a objetos
PostgreSQL: https://www.postgresql.org/docs/

ORM: **Prisma**  
Justificativa: Tem implementação relativamente simples e funciona muito bem com o PostgreSQL
Prisma: https://www.prisma.io/docs

Infraestrutura: **Docker**  
Justificativa: Garante que o projeto funcione exatamente do mesmo jeito no computador de todos do grupo, evitando erros de instalação e configuração
Docker: https://docs.docker.com/

--- 
Responsável: Pedro Luca Rocha Manera 