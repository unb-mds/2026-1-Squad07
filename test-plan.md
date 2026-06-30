# Plano de Testes - (Exibir score de legibilidade)

## Componente: `LawDetailPage` (`/law/[id]`)

### Casos de Teste de Integração / Componente

1. **Estado de Carregamento (Loading)**
   - **Cenário:** Assim que a página carrega, a chamada ao endpoint `/api/v1/laws/readability` é iniciada.
   - **Resultado esperado:** Deve exibir o indicador visual de carregamento específico para a análise de legibilidade.

2. **Sucesso na API (Cenário Ideal)**
   - **Cenário:** O endpoint retorna `200 OK` com o payload de legibilidade.
   - **Resultado esperado:**
     - Exibir score numérico (0-100) e sua classificação textual.
     - Barra visual de progresso refletindo o valor com a cor correta por faixa.
     - Cards com o breakdown: total de palavras, frases e sílabas médias.

3. **Falha na API (Tratamento de Erros)**
   - **Cenário:** O endpoint retorna erro (`500`, `400`, etc.).
   - **Resultado esperado:** Exibir uma mensagem de erro amigável na seção de legibilidade sem quebrar o restante da página (o texto armazenado da lei deve continuar visível).