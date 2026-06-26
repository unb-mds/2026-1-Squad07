# Test Plan: Tela de Perfil do Usuário — R2

**Feature**: Tela de Perfil do Usuário
**ID da Spec**: `specs/005-user-profile`

## Objetivos do Teste

Garantir que a página de perfil (`/profile`) funcione corretamente sob estados de autenticação ativos/inativos, valide inputs corretamente no cliente, chame a API de usuários conforme o esperado e trate erros de API elegantemente, atualizando o contexto do usuário sem recarregar o navegador.

---

## 1. Testes Automatizados de Componentes (Jest + React Testing Library)

A implementação deve conter um arquivo de testes na pasta do frontend: `frontend/src/app/profile/__tests__/page.test.tsx` ou similar.

### Casos de Teste (Componentes)

| ID | Cenário | Ações | Resultado Esperado |
|---|---|---|---|
| **TC-01** | Redirecionamento de não autenticado | Acessar `/profile` sem usuário logado no `AuthContext` | Chamar `router.push('/login')` imediatamente. |
| **TC-02** | Exibição de dados iniciais | Acessar `/profile` autenticado como "João Silva" | Input do Nome pré-preenchido com "João Silva" e e-mail exibido corretamente (desabilitado). |
| **TC-03** | Validação de input (Erro) | Digitar nome vazio ou com < 3 caracteres e tentar salvar | Exibir mensagem de validação client-side ("O nome deve conter pelo menos 3 caracteres") e bloquear submissão. |
| **TC-04** | Submissão com sucesso | Alterar nome para "João Souza" e clicar em Salvar | Chamar a API de usuários com `PATCH`, atualizar o `AuthContext` com o novo nome e exibir Toast de sucesso. |
| **TC-05** | Erro da API | Alterar nome, API retorna erro (ex: `403` ou `500`) | Exibir Toast informando o erro amigável ao usuário, mantendo o formulário habilitado. |
| **TC-06** | Cancelamento | Editar o nome de "João Silva" para "João Santos" e clicar em Cancelar | Retornar o valor do input para o estado original ("João Silva"). |

---

## 2. Testes de Integração Manual (End-to-End)

Para garantir que a integração frontend-backend esteja redonda e a segurança do backend esteja funcionando adequadamente:

### Cenário 1: Fluxo de Sucesso com Usuário ADMIN
1. Logar no CrivoAI com um usuário que possua a role `ADMIN`.
2. Acessar a URL `/profile`.
3. Validar se as informações de e-mail e nome correspondem ao usuário logado.
4. Alterar o nome no input e clicar em "Salvar Alterações".
5. Validar o surgimento do Toast de sucesso.
6. Atualizar a página do navegador e conferir se o novo nome persiste no cabeçalho e na página de perfil.

### Cenário 2: Tratamento de Erro de Autorização (COMMON User)
1. Logar no CrivoAI com um usuário comum (`role: "COMMON"`).
2. Acessar a URL `/profile`.
3. Alterar o nome no formulário e tentar salvar.
4. Validar o retorno da requisição de rede (`403 Forbidden`).
5. Validar que o Toast de erro é disparado avisando que a operação não é permitida (caso a dependência global do backend de usuários não tenha sido ajustada ainda).

### Cenário 3: Proteção de Rota
1. Estando deslogado do sistema, tentar forçar o acesso direto à URL `http://localhost:3000/profile`.
2. Validar que o sistema barra a entrada e redireciona o navegador para `http://localhost:3000/login`.
