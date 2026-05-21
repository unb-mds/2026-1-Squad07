# Quickstart - Revisão de Documentação

Use este checklist antes de abrir ou aprovar PRs que alterem documentação.

## Checklist Rápido

1. A página explica por que existe?
2. A página tem contexto do projeto?
3. A página se conecta a requisitos, issues, arquitetura, protótipo, sprint ou release?
4. A página diferencia o que está implementado, prototipado, mockado, planejado ou fora de escopo?
5. Imagens, iframes, embeds e links externos possuem explicação textual?
6. O título da página combina com o item no `mkdocs.yml`?
7. O texto está em PT-BR com acentuação correta?
8. A página possui critérios de aceite ou validação?
9. A documentação não contradiz requisitos, escopo ou arquitetura?
10. O conteúdo consegue ser entendido por alguém fora do grupo?
11. A página foi aberta e conferida com `mkdocs serve`?

## Validação Técnica

```powershell
mkdocs serve
```

Quando o ambiente local não tiver MkDocs disponível, registre isso na review e valide ao menos estrutura, links e navegação alterada. A validação preferencial do Squad 07 é sempre visual, usando o servidor local do MkDocs.
