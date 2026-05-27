# Test Plan: Documentação do Projeto

**Spec**: `specs/000-documentacao-do-projeto/spec.md`
**Data**: 2026-05-21

## Objetivo do Teste

Validar que a documentação do projeto possui padrão mínimo de qualidade, rastreabilidade e clareza antes de ser aprovada em PR.

## Estratégia TDD

- Definir checks documentais antes de revisar ou criar páginas.
- Vincular cada check aos requisitos da spec.
- Executar validação estrutural após a criação dos arquivos.
- Usar `mkdocs serve` como validação técnica e visual obrigatória quando houver alteração em documentação pública.

## Casos de Teste

| ID | Critério relacionado | Tipo | Procedimento | Resultado esperado |
| --- | --- | --- | --- | --- |
| TDD-001 | REQ-001, REQ-002 | Manual | Ler uma página documental relevante | A página possui objetivo e contexto |
| TDD-002 | REQ-003 | Manual | Procurar termos de status da entrega | A página diferencia implementado, prototipado, mockado, planejado ou fora de escopo |
| TDD-003 | REQ-004 | Manual | Revisar página com imagem, iframe ou embed | O artefato externo possui explicação textual própria |
| TDD-004 | REQ-005 | Estrutural | Verificar spec em `specs/` | `test-plan.md` existe antes de considerar a spec pronta |
| TDD-005 | REQ-006 | Estrutural | Ler `mkdocs.yml` | A seção `SDD e TDD` existe |
| TDD-006 | REQ-007 | Estrutural | Verificar arquivos AGENTS | `AGENTS.md`, `docs/AGENTS.md` e `specs/AGENTS.md` existem |
| TDD-007 | REQ-008 | Manual | Revisar texto novo | O texto está em PT-BR com acentuação correta |
| TDD-008 | REQ-009 | Manual | Ler a seção SDD/TDD | A documentação explica que Codex é integração inicial e que as instruções servem para qualquer agente de IA |

## Validação Manual

- [ ] A documentação explica por que existe.
- [ ] Nenhuma página nova depende apenas de link, imagem, iframe ou embed.
- [ ] O conteúdo deixa claro o que é R1, R2 ou futuro.
- [ ] A documentação não contradiz requisitos, escopo ou arquitetura.
- [ ] Os termos do projeto são usados de forma consistente.
- [ ] A documentação pode ser compreendida por professora, PO, devs e avaliadores externos.
- [ ] A documentação não apresenta o Codex como base conceitual obrigatória do projeto.

## Validação Automatizada

- [ ] `mkdocs serve`
- [ ] Conferir existência dos arquivos planejados em `specs/000-documentacao-do-projeto/`.

## Evidências Esperadas

- Servidor local do `mkdocs serve` carregando as páginas alteradas.
- Diff restrito a documentação, specs, Spec Kit e agentes.
- Revisão visual da navegação MkDocs.
