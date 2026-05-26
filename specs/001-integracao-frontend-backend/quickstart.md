# Quickstart de Validação: Integração Frontend-Backend

## Finalidade

Este roteiro valida o fluxo funcional persistido da R1. Análise de qualidade legislativa não é apresentada enquanto não existir processamento real.

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
6. Abra a submissão e verifique que o detalhe mostra o texto enviado, obtido da API.
7. Interrompa temporariamente a API e recarregue `/search` para confirmar mensagem de falha compreensível.

## Limites Visíveis da R1

- Dashboard, listagem e detalhe representam submissões persistidas, não análise automatizada.
- A interface não exibe score ou análise sem processamento real.
- Apenas texto digitado ou importado de `.txt` participa do envio real nesta etapa.
