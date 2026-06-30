# Plano de Testes: Resumo explicativo por IA no detalhe da lei

## Objetivo

Validar que a página `/law/[id]` integra o resumo persistido pelo backend sem depender de mock demonstrativo e sem prejudicar o texto da lei quando a consulta do resumo falha ou demora.

## Casos de Componente

| ID | Cenário | Preparação | Resultado esperado |
| --- | --- | --- | --- |
| RS-1 | Loading do resumo | `GET /api/v1/laws/{id}` principal retorna a lei e a consulta do resumo permanece pendente. | O card exibe indicador local "Gerando resumo explicativo..." e o texto da lei permanece visível. |
| RS-2 | Sucesso do resumo | Consulta do resumo retorna `summary` preenchido. | O resumo real é exibido no card, preservando quebras de linha, e o contrato da URL é validado. |
| RS-3 | Erro de rede ou backend | Consulta do resumo retorna erro HTTP ou falha de rede. | O card exibe mensagem amigável de indisponibilidade e a lei segue renderizada. |
| RS-4 | Resumo ausente | Consulta retorna `summary` vazio ou ausente. | O card informa que o resumo ainda não está disponível. |

## Comando de Validação

```powershell
cd frontend
npm test -- --runTestsByPath src/app/law/[id]/page.test.tsx
```

## Riscos

- Se o backend expuser uma rota específica de resumo depois desta issue, o frontend deve migrar a função de API mantendo os mesmos estados de tela.
