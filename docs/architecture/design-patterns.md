# Padrões de Projeto

Os padrões abaixo funcionam como critério de decisão para o time. Seu objetivo é impedir que o repositório perca coesão conforme as features avançam.

## Leitura da Seção

Os padrões abaixo funcionam como referência primária para decisões sobre local de implementação e estruturação de novos módulos.

## 1. Separação por Camadas

O backend deve seguir uma divisão clara entre transporte, aplicação e persistência:

- `api`: recebe e devolve HTTP.
- `services`: concentra casos de uso.
- `db`: abstrai acesso a dados.

Benefício principal: reduz acoplamento entre regras de negócio e framework web.

## 2. Service Layer

Cada fluxo relevante deve ter uma camada de serviço dedicada para orquestrar validações, chamadas a repositórios e regras de negócio.

Esse padrão evita que endpoints HTTP concentrem responsabilidades demais.

```py
class UserService:
    def __init__(self, user_repository):
        self.user_repository = user_repository

    def create_user(self, payload):
        return self.user_repository.create(payload)
```

## 3. Repository Boundary

O acesso a dados deve ficar atrás de uma fronteira clara, mesmo quando a implementação inicial ainda for simples. Isso facilita troca de ORM, testes e evolução de consultas.

Na prática, isso significa evitar consultas ou detalhes de persistência espalhados diretamente pela camada de API ou por componentes de interface.

```py
class UserRepository:
    def get_by_id(self, user_id: str):
        ...
```

## 4. Componentização no Frontend

No frontend, a prioridade é separar:

- páginas e layouts em `app/`;
- componentes visuais em `components/`;
- integrações e utilitários em `lib/`;
- contratos compartilhados em `types/`.

Benefício principal: melhora reuso, legibilidade e escalabilidade da interface.

## 5. Contratos Explícitos

Sempre que possível, contratos entre frontend e backend devem ser explícitos e tipados.

```ts
export type HealthResponse = {
  status: "ok";
};
```

Isso reduz ambiguidades na integração e torna mudanças de API mais visíveis durante o desenvolvimento.

## 6. Crescimento Incremental Guiado

A arquitetura documentada representa a direção desejada. Nem todas as pastas existem hoje, e isso é esperado.

A regra é adicionar estrutura quando houver necessidade real, preservando o padrão definido nesta documentação.

## 7. Evolução Sem Duplicar Convenções

Avaliando uma necessidade nova, a primeira pergunta deve ser:

- a pasta atual já comporta essa responsabilidade?

Criar novas convenções só deve acontecer quando a estrutura existente não resolver o problema de forma clara.
