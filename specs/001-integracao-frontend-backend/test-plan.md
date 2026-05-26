# Test Plan: Integração Frontend-Backend da R1

**Spec**: `specs/001-integracao-frontend-backend/spec.md`  
**Data**: 2026-05-26

## Objetivo

Validar, antes da aprovação da implementação, que o frontend consome os contratos reais já cobertos pelo backend e comunica corretamente estados relevantes para a demonstração da R1.

## Estratégia

- Preservar e executar os testes `pytest` existentes, que validam os contratos consumidos de autenticação e leis.
- Usar lint e build do Next.js para verificar tipos, imports e renderização das telas integradas.
- Executar validação manual com backend e frontend locais para comportamentos que o repositório ainda não possui testes automatizados de UI.

## Casos de Teste

| ID | Requisito | Tipo | Procedimento | Resultado esperado |
| --- | --- | --- | --- | --- |
| INT-001 | REQ-001, REQ-002 | Inspeção/build | Conferir cliente de API e compilar frontend | URL é configurável e chamadas compartilham tratamento de erro |
| INT-002 | REQ-003, REQ-004 | Manual | Cadastrar e entrar por `/register` e `/login` | API autentica, sessão aparece no cabeçalho e senha não fica persistida |
| INT-003 | REQ-004 | Manual | Enviar credenciais incorretas ou e-mail repetido | Tela apresenta erro de autenticação/cadastro |
| INT-004 | REQ-005 | Manual + backend | Enviar título, número e texto em `/upload` | `POST /laws` cria submissão e UI confirma sucesso |
| INT-005 | REQ-006 | Manual + backend | Abrir `/search` após criar submissão | Item persistido aparece com título, data e excerto |
| INT-006 | REQ-006 | Manual | Executar listagem sem registros e com API indisponível | UI exibe estados vazio e de erro |
| INT-007 | REQ-007 | Inspeção | Comparar listagem real com telas demonstrativas | Listagem não atribui score/análise à submissão real |

## Validação Automatizada

- [ ] `cd backend && pytest`
- [ ] `cd frontend && npm run lint`
- [ ] `cd frontend && npm run build`

## Validação Manual

- [ ] Cadastro cria sessão com usuário comum.
- [ ] Login restaura sessão e logout a remove.
- [ ] Submissão com texto válido informa persistência e redireciona para a listagem.
- [ ] Listagem indica carregamento, vazio, falha e dados retornados.
- [ ] A interface não apresenta análise simulada como resultado persistido.

## Critério de Saída

A feature está pronta para PR quando a validação automatizada passar, a revisão manual for registrada na descrição do PR e nenhum endpoint fora do contrato atual tiver sido introduzido.
