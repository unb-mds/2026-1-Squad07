# Plano: Resumo explicativo por IA no frontend

## Abordagem

1. Tipar `summary` como campo opcional de `CreatedLaw`.
2. Criar uma função de API no frontend para consultar o resumo a partir de `GET /laws/{id}`, reaproveitando o client configurado por `NEXT_PUBLIC_API_URL`.
3. Adicionar estado local de resumo na `LawDetailPage`, separado do carregamento principal da lei e do score de legibilidade.
4. Renderizar um card de resumo com estados de carregamento, sucesso e erro.
5. Atualizar os testes existentes da página para validar o contrato consumido e os estados visuais.

## Decisões

- Não será criado endpoint novo no frontend, porque a evidência disponível aponta para o campo `summary` no retorno da lei.
- A falha no resumo não deve alterar `law`, `readability` ou a exibição do texto armazenado.
- O card deve permanecer simples e institucional, sem dependência visual nova.

## Validação

- `npm test -- --runTestsByPath src/app/law/[id]/page.test.tsx`
- `npm run lint`
- `git diff --check`
