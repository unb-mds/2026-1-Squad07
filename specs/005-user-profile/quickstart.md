# Quickstart: Tela de Perfil do Usuário — R2

Este guia orienta o desenvolvedor sobre como configurar o ambiente, rodar a aplicação e validar o funcionamento da tela de perfil de usuário localmente.

---

## 1. Preparação do Ambiente

### Requisitos

- Node.js 18+ instalado.
- Python 3.11+ com `pip` instalado.
- Banco de dados PostgreSQL configurado.

### Passos para Inicialização

1. **Backend**:
   Certifique-se de que o backend está rodando na porta `8000`:

   ```powershell
   cd backend
   # Ative o ambiente virtual
   .venv\Scripts\Activate.ps1
   # Instale as dependências
   pip install -r requirements.txt
   # Execute as migrations do Prisma se necessário
   npx prisma db push
   # Rode o servidor
   uvicorn app.main:app --reload --port 8000
   ```

2. **Frontend**:
   Em outro terminal, inicie o frontend na porta `3000`:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

---

## 2. Execução dos Testes Automatizados (TDD)

Para rodar os testes do frontend criados para esta funcionalidade (Jest):

```powershell
cd frontend
# Executar todos os testes com Jest
npm run test

# Executar testes em modo watch durante o desenvolvimento
npx jest src/app/profile/__tests__/page.test.tsx --watch
```

---

## 3. Fluxo de Validação Manual da Feature

1. Acesse `http://localhost:3000/login` e realize a autenticação com um usuário com role de `ADMIN` (devido à limitação temporária da rota de API de usuários no backend).
2. Acesse a URL `http://localhost:3000/profile` (ou clique no menu de perfil na Navbar).
3. Verifique se os dados de e-mail (somente leitura) e nome são renderizados perfeitamente.
4. Mude o valor do input "Nome", insira caracteres inválidos (< 3 caracteres) e verifique se a validação do cliente bloqueia o salvamento.
5. Insira um nome válido, clique em "Salvar Alterações" e valide o surgimento do Toast de sucesso.
6. Valide a alteração diretamente no banco de dados via Prisma Studio se desejar:

   ```powershell
   cd backend
   npx prisma studio
   ```

   Consulte a tabela `User` para garantir que o campo `name` do respectivo `id` foi atualizado com sucesso.
