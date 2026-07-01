# Quickstart: Tela de Perfil do Usuário — R2

Este guia orienta o desenvolvedor sobre como configurar o ambiente, rodar a aplicação com Docker e validar o funcionamento da tela de perfil de usuário localmente.

---

## 1. Preparação do Ambiente com Docker

### Requisitos
- Docker e Docker Compose instalados.
- Node.js 18+ instalado no host local (para o frontend).

### Passos para Inicialização

1. **Backend e Banco de Dados (Docker)**:
   Suba o container do banco de dados PostgreSQL e da API FastAPI usando Docker Compose:
   ```powershell
   # Sobe os containers em segundo plano com build atualizado
   docker compose up -d --build
   ```
   A API FastAPI estará disponível na porta `8000`.

2. **Frontend (Host Local)**:
   Inicie o frontend na sua máquina local apontando para o backend da API:
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```
   Acesse a aplicação em `http://localhost:3000`.

---

## 2. Execução dos Testes Automatizados (TDD)

### Testes do Frontend (Host Local)
Como a interface roda no host, execute a suíte de testes de Jest localmente:
```powershell
cd frontend
# Executar todos os testes
npm run test

# Executar apenas os testes da página de perfil
npx jest src/app/profile/__tests__/page.test.tsx
```

### Testes do Backend (Dentro do Docker)
Caso necessite rodar a suite de testes de backend ou validação de cobertura:
```powershell
# Executa pytest de forma isolada dentro do container FastAPI
docker compose exec app pytest
```

---

## 3. Fluxo de Validação Manual da Feature

1. Acesse `http://localhost:3000/login` e realize a autenticação com um usuário com role de `ADMIN`.
2. Acesse a URL `http://localhost:3000/profile` (ou clique no menu de perfil na Navbar).
3. Verifique se os dados de e-mail (somente leitura) e nome são renderizados perfeitamente.
4. Mude o valor do input "Nome", insira caracteres inválidos (< 3 caracteres) e verifique se a validação do cliente bloqueia o salvamento.
5. Insira um nome válido, clique em "Salvar Alterações" e valide o surgimento do Toast de sucesso.
6. Valide a alteração diretamente no banco de dados rodando o Prisma Studio dentro do container do app:
   ```powershell
   docker compose exec app npx prisma studio
   ```
   Abra `http://localhost:5555` no navegador para verificar as atualizações na tabela `User`.
