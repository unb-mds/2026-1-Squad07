# Quickstart de Validação: Integração Frontend-Backend

## Finalidade

Este roteiro valida o fluxo funcional da R1 sem confundi-lo com a análise de qualidade legislativa, que permanece demonstrativa.

## Configuração

1. Configure o backend conforme `.env.example` e inicie o PostgreSQL e a API.
2. No frontend, defina `NEXT_PUBLIC_API_URL=http://localhost:8000`.
3. Inicie o frontend e acesse `http://localhost:3000`.

## Roteiro Manual

1. Abra `/register`, crie um usuário comum e confirme que seu nome aparece no cabeçalho.
2. Saia, abra `/login` e entre novamente com as mesmas credenciais.
3. Abra `/upload`, preencha número, título e texto de uma proposição e envie.
4. Confirme a mensagem de sucesso e o redirecionamento para `/search`.
5. Verifique que a nova submissão aparece com título, data e trecho do texto.
6. Interrompa temporariamente a API e recarregue `/search` para confirmar mensagem de falha compreensível.

## Limites Visíveis da R1

- A listagem representa submissões persistidas, não análise automatizada.
- A análise com score exibida em telas demonstrativas não é produzida pelo backend.
- Apenas texto digitado ou importado de `.txt` participa do envio real nesta etapa.
