# Plano de Testes - Exibição da Análise de Qualidade

## Componente: `LawDetailPage` (`/law/[id]`)

### Casos de Teste de Integração / Componente

1. **Estado de Carregamento (Loading)**
   - **Cenário:** Assim que a submissão persistida é carregada, a página inicia a chamada ao endpoint `POST /api/v1/analysis/evaluate`.
   - **Resultado esperado:** Deve exibir o indicador visual de carregamento específico para a análise de qualidade legislativa.

2. **Sucesso na API (Cenário Ideal)**
   - **Cenário:** O endpoint retorna `200 OK` com o payload de análise no contrato `AnalysisResponse`.
   - **Resultado esperado:**
     - Enviar `lawId`, `text` e `type` no payload da análise.
     - Converter o `score` retornado em escala `0.0` a `1.0` para porcentagem apenas na interface.
     - Exibir classificação visual, versão do modelo, métricas retornadas e alertas (`warnings`) quando existirem.

3. **Falha na API (Tratamento de Erros)**
   - **Cenário:** O endpoint retorna erro (`500`, `400`, `503`, etc.).
   - **Resultado esperado:** Exibir uma mensagem de erro amigável na seção de análise sem quebrar o restante da página; o texto armazenado da lei deve continuar visível.
