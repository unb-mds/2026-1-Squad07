# Implementation Plan: Tela de Perfil do Usuário — R2

**Feature**: Tela de Perfil do Usuário
**ID da Spec**: `specs/005-user-profile`

## Abordagem Técnica

O desenvolvimento consistirá em criar a tela de perfil na pasta do frontend, implementar a chamada da API, expor o método de atualização da sessão no contexto de autenticação global e integrar com Toasts de feedback para o usuário.

---

## 1. Modificações de Arquivos e Novas Implementações

### A. Integração com API (Frontend)

Criar o arquivo `frontend/src/lib/api/users.ts` com funções que mapeiam as rotas de usuários expostas pelo backend, passando o token JWT para autenticação.

```typescript
import { apiRequest } from "@/lib/api/client";
import { type AuthUser } from "./auth";

/**
 * Atualiza o nome do usuário logado.
 */
export function updateProfile(id: string, name: string, token: string) {
  return apiRequest<AuthUser>(`/users/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ name }),
  });
}
```

### B. Atualização do Contexto Global de Autenticação

Modificar o arquivo [AuthContext.tsx](file:///C:/Users/vinic/Desktop/MDS/2026-1-Squad07/frontend/src/contexts/AuthContext.tsx) para expor a função `updateUserInSession(updatedUser: AuthUser)`, permitindo que alterações de perfil se propaguem para a interface em tempo real e atualizem o `localStorage` do navegador:

```typescript
type AuthContextType = {
  // ... campos existentes ...
  updateUserInSession: (updatedUser: AuthUser) => void;
};

// ...

export function AuthProvider({ children }: { children: ReactNode }) {
  // ...
  function updateUserInSession(updatedUser: AuthUser) {
    if (!session) return;
    const nextSession = { ...session, user: updatedUser };
    saveSession(nextSession);
  }

  return (
    <AuthContext.Provider
      value={{
        // ...
        updateUserInSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
```

### C. Implementação da Tela `/profile`

Criar a página `frontend/src/app/profile/page.tsx`. Ela deve ser um `Client Component` contendo:

- Proteção de Rota: Uso de `useEffect` com redirecionamento via `useRouter` caso `user` seja nulo.
- Estado de Carregamento (Loading): Exibição de um spinner ou skeleton enquanto o estado de `user` no contexto não é inicializado.
- Interface de Usuário:
  - Input para Nome (editável).
  - Input para E-mail (desabilitado).
  - Badges ou elementos estáticos para exibir o Tipo de Conta (COMMON / ADMIN) e a Data de Criação do perfil formatada.
- Ações:
  - Envio do formulário via evento `onSubmit` com tratamento de erro e loading.
  - Cancelamento: Limpeza de estados não salvos e reinicialização com o nome original do contexto.
- Notificações:
  - Toasts de sucesso ("Perfil atualizado com sucesso!") e erro ("Ocorreu um erro ao atualizar o perfil. Tente novamente.").

---

## 2. Padrão de Estilos e Layout

O design da tela de perfil deve respeitar a linguagem visual já estabelecida no CrivoAI (Premium Dark Mode, gradientes suaves, bordas sutis e tipografia Outfit/Inter).

- Card centralizado.
- Sombras suaves e efeitos hover.
- Botões utilizando a paleta de cores primária e secundária padrão do sistema.
- Responsividade garantida para resoluções mobile (Flexbox/Grid do CSS).

---

## 3. Resolvendo NEEDS CLARIFICATION

Para possibilitar os testes imediatos sem dependência de alteração da branch principal do backend:

1. Durante o desenvolvimento local, se o usuário logado for `COMMON`, o salvamento retornará erro `403 Forbidden` do backend.
2. A solução técnica recomendada no frontend é garantir o tratamento elegante de erros (`403 Forbidden`) explicando claramente o motivo, enquanto o PR do backend com o ajuste de permissões (retirando `require_admin_user` global) é processado.
3. Para validar o caminho feliz (happy path) localmente no desenvolvimento atual, será recomendado realizar os testes com um usuário que possua role `ADMIN` (semeado via banco ou criado manualmente).
