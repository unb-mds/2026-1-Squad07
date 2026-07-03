# Plano de Testes: Remoção de Mockdata e Restrição de Submissão

Este documento descreve a estratégia de testes unitários, testes de integração e validação manual para assegurar que a remoção de mockdata e a restrição do fluxo de submissão funcionem corretamente.

## Testes Automatizados (Backend)

Os testes automatizados serão implementados em `backend/tests/test_laws.py` e executados com `pytest`.

### 1. Testes de Autenticação na Submissão
- **Cenário 1: Usuário Não Autenticado**
  - **Ação**: Fazer requisição `POST /laws` sem cabeçalho `Authorization`.
  - **Resultado Esperado**: Código de status `401 Unauthorized` com a mensagem apropriada.
- **Cenário 2: Usuário Autenticado**
  - **Ação**: Fazer requisição `POST /laws` com cabeçalho `Authorization` válido.
  - **Resultado Esperado**: Código de status `201 Created` e associação do campo `uploadedByUserId` ao ID do usuário autenticado no banco.

### 2. Testes do Endpoint de Estatísticas
- **Cenário 1: Sem Dados no Banco**
  - **Ação**: Fazer requisição `GET /api/v1/laws/statistics`.
  - **Resultado Esperado**: Retornar `200 OK` com `averageScore: 0.0`, `analyzedLaws: 0` e `criticalLaws: 0`.
- **Cenário 2: Com Dados Reais**
  - **Ação**: Inserir leis com e sem análises associadas e consultar `GET /api/v1/laws/statistics`.
  - **Resultado Esperado**: Retornar as estatísticas calculadas corretamente em memória.

### 3. Teste do Score na Listagem
- **Cenário 1: Listar submissões com análises associadas**
  - **Ação**: Fazer requisição `GET /laws` e verificar os objetos retornados.
  - **Resultado Esperado**: O campo `score` deve conter o score mais recente calculado para a lei ou `None` se ela ainda não possuir análises.

---

## Validação Manual (Frontend e Fluxo Integrado)

### 1. Acesso à Página Inicial (Sem Autenticação)
1. Abrir o navegador na Home (`/`) sem estar logado no sistema.
2. Certificar-se de que os indicadores do dashboard mostram os valores reais (ou 0 se o banco estiver limpo).
3. Certificar-se de que o card "Submeter Nova Lei / Registrar Texto" não está visível.
4. Certificar-se de que o texto "Indicadores simulados para demonstração" não está presente na tela.
5. Na lista de submissões recentes, verificar que as notas são reais ou que leis sem análise não exibem nota mockada.

### 2. Acesso à Página Inicial (Com Autenticação)
1. Fazer login no sistema.
2. Acessar a Home (`/`).
3. Verificar que o card "Submeter Nova Lei / Registrar Texto" está visível e ativo.
4. Clicar no botão "Registrar Texto" e garantir que a página `/upload` é carregada normalmente.

### 3. Acesso Direto à Rota de Upload (Sem Autenticação)
1. Fazer logout.
2. Digitar diretamente na barra de endereços: `http://localhost:3000/upload`.
3. Garantir que a página de upload não é exibida e que ocorre um redirecionamento imediato para a tela de login (`/login`).
