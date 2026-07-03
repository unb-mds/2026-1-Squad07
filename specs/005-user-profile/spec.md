# Feature Specification: Tela de Perfil do Usuário — R2

**Branch**: `feat/issue-135-perfil-usuario`
**Criado em**: 2026-06-26 (Atualizado em 2026-06-30)
**Status**: Approved
**Issue**: #135
**Depende de**: Ajuste na autenticação/autorização no backend (resolvido na Issue #147 e PR #154).

## Objetivo

Implementar a interface de visualização e edição de perfil de usuário logado no frontend (Next.js), permitindo que o usuário consulte seus dados básicos (Nome, E-mail, Tipo de Conta) e edite seu nome com feedbacks visuais claros (toasts de sucesso e erro) e validações adequadas.

---

## Contexto

Atualmente, o backend possui rotas CRUD de usuários em [backend/app/api/users.py](file:///C:/Users/vinic/Desktop/MDS/2026-1-Squad07/backend/app/api/users.py) e autenticação em [backend/app/api/auth.py](file:///C:/Users/vinic/Desktop/MDS/2026-1-Squad07/backend/app/api/auth.py). O frontend do CrivoAI necessita de uma área autenticada (`/profile`) onde o usuário logado consiga gerenciar suas informações básicas de cadastro.

---

## NEEDS CLARIFICATION (Pontos de Esclarecimento)

> [!IMPORTANT]
> **Conflito de Autorização no Roteador de Usuários (RESOLVIDO)**
>
> A restrição global de ADMIN no roteador `/users` foi resolvida no PR #154 (Issue #147), aplicando a regra de autorização que permite que o próprio dono do perfil (`current_user.id == user_id`) atualize ou consulte seus próprios dados.

---

## Escopo

### Incluído

- **Página de Perfil (`/profile`)**:
  - Layout responsivo, utilizando os padrões de design do sistema.
  - Carregamento inicial de dados básicos do usuário do contexto de autenticação.
  - **Sincronização Assíncrona:** Hidratação do formulário de nome após a sessão carregar assincronamente do localStorage.
  - Formulário para alteração de Nome.
  - Validação no lado do cliente (Nome obrigatório, tamanho mínimo de 3 caracteres).
  - Redirecionamento automático para a tela de login (`/login`) caso o usuário tente acessar a rota sem estar autenticado.
- **Feedbacks Visuais**:
  - Estado de carregamento (*loading spinner* ou *skeletons*).
  - Notificações instantâneas (toasts) indicando sucesso ou erro ao salvar dados.
- **Integração**:
  - **Busca em tempo real:** Chamada HTTP `GET /api/v1/users/{id}` ao carregar a página para sincronizar dados locais com o banco de dados.
  - Chamada HTTP para salvar modificações via `PATCH /api/users/{id}`.
  - Atualização do contexto global de autenticação no frontend após salvamento bem-sucedido.

### Fora de Escopo

- Redefinição de senha a partir da tela de perfil (deve ser tratada em issue de segurança/recuperação futura).
- Alteração de endereço de e-mail (e-mail é usado como chave única e será somente leitura).
- Upload de avatar ou foto de perfil (não suportado pelo modelo de dados atual).

---

## Interface e Protótipo de Fluxo

1. **Acesso**: O usuário acessa a rota `/profile` ou clica em seu nome na barra de navegação.
2. **Autenticação**: O frontend verifica a presença do token. Se ausente, redireciona para `/login` salvando a URL de retorno.
3. **Leitura**: A página exibe estado de loading enquanto chama a API.
4. **Formulário**:
   - Campo **Nome**: Input de texto, editável.
   - Campo **E-mail**: Input desabilitado (somente leitura).
   - Campo **Tipo de Conta (Role)**: Exibição visual do tipo de conta (COMMON/ADMIN).
5. **Ações**:
   - Botão **Salvar Alterações**: Envia o payload `{ "name": "Novo Nome" }`. Desabilitado durante o envio.
   - Botão **Cancelar**: Descarta alterações não salvas e volta ao estado anterior.

---

## Contratos de API Propostos

### Buscar Dados do Perfil
* **Endpoint**: `GET /api/users/{user_id}`
* **Headers**: `Authorization: Bearer <token>`
* **Resposta de Sucesso (200 OK)**:
  ```json
  {
    "id": "user-uuid-123",
    "name": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "role": "COMMON"
  }
  ```

### Atualizar Nome do Perfil
* **Endpoint**: `PATCH /api/users/{user_id}`
* **Headers**: `Authorization: Bearer <token>`
* **Payload**:
  ```json
  {
    "name": "Novo Nome do Usuário"
  }
  ```
* **Resposta de Sucesso (200 OK)**:
  ```json
  {
    "id": "user-uuid-123",
    "name": "Novo Nome do Usuário",
    "email": "usuario@exemplo.com",
    "role": "COMMON"
  }
  ```
* **Resposta de Erro (400 Bad Request / 409 Conflict)**:
  ```json
  {
    "detail": "Nome inválido ou erro de validação."
  }
  ```
