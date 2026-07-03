# Quickstart: Remoção de Mocks e Restrição de Submissão

Este guia orienta como iniciar, validar e testar localmente os desenvolvimentos especificados nesta pasta.

## Passo 1: Executar Testes do Backend
Para garantir que as novas validações e rotas funcionem:
1. Certifique-se de que o ambiente virtual está ativo (`.venv`).
2. Vá para o diretório `backend` (ou execute a partir da raiz definindo a variável de ambiente se necessário).
3. Execute o comando de teste:
   ```bash
   pytest backend/tests/test_laws.py
   ```

## Passo 2: Executar o Projeto em Desenvolvimento
1. Inicie o backend:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```
2. Inicie o frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## Passo 3: Cenários de Validação
### Usuário Não Logado:
- Ao abrir `http://localhost:3000`, os indicadores devem mostrar o estado real do banco de dados (0 se não houver dados analisados).
- O card para registrar nova lei não deve aparecer.
- Se tentar abrir `http://localhost:3000/upload` no navegador, o sistema deve redirecionar imediatamente para a tela de login.

### Usuário Logado:
- Crie uma conta ou faça login.
- Acesse a Home: o card "Submeter Nova Lei / Registrar Texto" deve ficar visível.
- Clique no card e faça uma submissão de texto.
- Ao visualizar os detalhes da lei submetida, a análise de qualidade será gerada.
- Retorne à Home:
  - O número de leis analisadas no dashboard deve aumentar para 1.
  - A média geral deve refletir a nota da lei analisada.
  - A nota da lei deve aparecer ao lado do seu título na lista de submissões recentes.
