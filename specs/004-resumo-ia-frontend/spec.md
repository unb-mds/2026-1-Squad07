# Spec: Resumo explicativo por IA no detalhe da lei

**Issue**: #155
**Branch**: `feature/155-resumo-ia-frontend`

## Problema

A página `/law/[id]` precisa substituir qualquer resumo demonstrativo por um resumo real gerado no backend e persistido junto aos dados da lei. A tela deve preservar a visualização do texto legislativo mesmo quando o resumo estiver lento ou indisponível.

## Escopo

### R1 demonstrável

- Exibir um card de resumo explicativo na página de detalhes da lei.
- Consumir o campo `summary` do retorno de `GET /api/v1/laws/{id}`.
- Tratar carregamento, sucesso e falha do resumo sem bloquear o texto principal.
- Cobrir os três estados com testes de componente em Jest.

### R2 completa

- Evoluir o card para acompanhar estados de processamento assíncrono mais ricos, caso o backend exponha status dedicado.
- Reutilizar o resumo em outras superfícies da aplicação, como listagens ou painéis.

### Futuro

- Adicionar histórico de versões do resumo ou explicação expandida, se o produto definir essa necessidade.

## Contrato Consumido

O frontend deve consumir `summary?: string | null` no objeto de lei retornado por `GET /api/v1/laws/{id}`. A ausência do campo ou valor vazio deve ser tratada como resumo indisponível, sem quebrar a página.

## Critérios de Aceite

- O card de resumo mostra estado de carregamento local.
- O card renderiza o resumo real preservando quebras de linha.
- Erros de rede ou respostas sem resumo exibem mensagem amigável.
- O texto da lei permanece visível em sucesso, loading ou erro do resumo.
- Os testes de componente cobrem loading, sucesso e erro.
