# Test Plan: Integração Frontend-Backend da R1

**Spec**: `specs/001-integracao-frontend-backend/spec.md`
**Data**: 2026-05-26

## Objetivo

Validar, antes da aprovação da implementação, que o frontend consome os contratos persistidos do backend e distingue claramente os indicadores simulados reservados à demonstração da R1.

## Estratégia

- Preservar e executar os testes `pytest` existentes, que validam os contratos consumidos de autenticação e leis.
- Usar lint e build do Next.js para verificar tipos, imports e integração dos indicadores demonstrativos delimitados.
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
| INT-007 | REQ-007, REQ-010 | Inspeção/build + manual | Conferir dashboard, busca e detalhe com registros comuns e `[Demonstração]` | Indicadores simulados aparecem somente na base demonstrativa, com rótulo explícito e sem sugerir processamento real |
| INT-008 | REQ-008 | Backend + manual | Abrir uma submissão criada por `/upload` | `GET /laws/{id}` retorna e a tela exibe o texto persistido |
| INT-009 | REQ-009 | Backend + banco | Executar o seed duas vezes e consultar `GET /laws` | Registros `[Demonstração]` aparecem persistidos sem duplicação |
| INT-010 | REQ-010 | Manual | Abrir detalhe de registro `[Demonstração]` e de submissão comum | Somente o detalhe demonstrativo apresenta score e observações simuladas |

## Validação Automatizada

- [x] `cd backend && pytest`
- [x] `cd frontend && npm run lint`
- [x] `cd frontend && npm run build`

## Validação Manual

- [ ] Cadastro cria sessão com usuário comum.
- [ ] Login restaura sessão e logout a remove.
- [ ] Submissão com texto válido informa persistência e redireciona para a listagem.
- [ ] Listagem indica carregamento, vazio, falha e dados retornados.
- [ ] Dashboard e detalhe consultam registros persistidos.
- [ ] A interface apresenta score, métricas e observações simulados somente para registros demonstrativos, com rotulagem explícita.
- [x] Seed demonstrativo persiste registros identificados e pode ser repetido sem duplicação.

## Critério de Saída

A feature está pronta para PR quando a validação automatizada passar, a revisão manual for registrada na descrição do PR e nenhum endpoint fora do contrato atual tiver sido introduzido.
