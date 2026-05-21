# Data Model - Documentação do Projeto

## Página Documental

Representa um arquivo publicado ou planejado no MkDocs.

Campos conceituais:

- `titulo`
- `objetivo`
- `contexto`
- `publico_alvo`
- `relacoes`
- `status_entrega`
- `criterios_validacao`

## Spec

Representa um conjunto de artefatos SDD/TDD em `specs/`.

Campos conceituais:

- `spec`
- `plan`
- `test_plan`
- `tasks`
- `quickstart`
- `contracts`
- `data_model`

## Critério de Validação

Representa uma regra verificável para aprovar documentação ou implementação.

Campos conceituais:

- `id`
- `descricao`
- `tipo`
- `procedimento`
- `resultado_esperado`

## Artefato Externo

Representa material usado como apoio documental.

Exemplos:

- Figma/FigJam.
- Miro.
- GitHub Issues.
- GitHub Project.
- Imagem.
- Iframe.
- PDF.

Todo artefato externo precisa de contexto textual no MkDocs.
