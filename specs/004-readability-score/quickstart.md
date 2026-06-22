# Quickstart: Cálculo de Score de Legibilidade (Flesch-Kincaid) - R2

Este guia orienta como iniciar, rodar os testes e validar manualmente a funcionalidade de cálculo de legibilidade do backend do CrivoAI.

---

## 🛠️ Requisitos de Ambiente

1. Certifique-se de estar com a branch correta ativa:

   ```bash
   git branch
   # Deve exibir: feat/issue-132-calculo-score-legibilidade
   ```

2. Acesse a pasta do backend:

   ```bash
   cd backend
   ```

3. Ative o ambiente virtual virtualenv do Python:
   * **Windows (PowerShell)**:

     ```powershell
     .venv\Scripts\Activate.ps1
     ```

   * **Linux/macOS**:

     ```bash
     source .venv/bin/activate
     ```

4. Garanta que as dependências de desenvolvimento estão instaladas:

   ```bash
   pip install -r requirements.txt
   ```

---

## 🧪 Como Executar os Testes (TDD)

### 1. Executar a Suite Geral de Legibilidade

Para rodar todos os testes de unidade e de integração novos:

```bash
pytest tests/unit/test_readability_service.py tests/integration/test_readability_routes.py -v
```

### 2. Verificar a Cobertura de Código

Para certificar-se de que a cobertura atinge a meta mínima de `90%`:

```bash
pytest --cov=app --cov-report=term-missing --cov-fail-under=90
```

---

## 🚀 Inicialização Local e Validação HTTP

### 1. Iniciar o Servidor FastAPI

Execute o servidor web local com carregamento automático:

```bash
uvicorn app.main:app --reload
```

O servidor estará disponível por padrão em: `http://localhost:8000`.

### 2. Validar via Swagger UI

1. Abra o navegador em: [http://localhost:8000/docs](http://localhost:8000/docs).
2. Localize o grupo de endpoints `laws-v1`.
3. Expanda o método `POST /api/v1/laws/readability`.
4. Clique em **Try it out** e insira o JSON de teste:

   ```json
   {
     "texto": "Fica instituído o regime especial."
   }
   ```

5. Clique em **Execute** e valide se o retorno possui status `200` e o seguinte corpo JSON:

   ```json
   {
     "score": 6.88,
     "classificacao": "Muito dificil",
     "metricas": {
       "palavras": 5,
       "frases": 1,
       "silabas": 14
     }
   }
   ```

### 3. Validar via cURL

Alternativamente, você pode testar diretamente via terminal:

```bash
curl -X POST http://localhost:8000/api/v1/laws/readability \
  -H "Content-Type: application/json" \
  -d '{"texto": "Fica instituído o regime especial."}'
```

---

## 🤖 Diretrizes de Execução para Agentes de IA

Qualquer agente de IA atuando na implementação ou evolução deste módulo deve seguir estritamente as regras abaixo:

1. **Aderência ao TDD**: Não escreva código de produção sem antes criar os testes unitários e de integração correspondentes na pasta `backend/tests/`. Os testes devem falhar (RED) na primeira execução.
2. **Sem Novas Dependências**: Implemente as heurísticas em Python puro e Regex. Não adicione bibliotecas externas de ML ou de processamento linguístico pesado no `requirements.txt`.
3. **Fluxo de Commits Atômicos**: Siga rigorosamente a ordem e os escopos dos 6 commits mapeados em `tasks.md`. Não realize commits acumulando mais de uma fase.
4. **Metas de Cobertura**: O arquivo `backend/app/services/readability.py` deve possuir cobertura de testes de no mínimo `90%` com o modelo mockado.
