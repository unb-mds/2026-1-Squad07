# Contrato de Qualidade Documental

## Regra Geral

Uma página documental só pode ser considerada pronta quando comunica contexto, propósito e validação. Ela não deve existir apenas para armazenar um link ou embed.

## Campos Mínimos

- Título coerente.
- Objetivo.
- Contexto no projeto.
- Público ou uso esperado.
- Relação com requisitos, arquitetura, issue, protótipo, sprint ou release.
- Critérios de aceite ou validação.

## Artefatos Externos

Quando uma página usar Figma, Miro, FigJam, imagem, iframe ou link externo:

- explique o que o artefato representa;
- indique como ele foi usado no projeto;
- não dependa exclusivamente do carregamento externo;
- mantenha texto suficiente para leitura no MkDocs.

## Status da Entrega

Toda página que descreve funcionalidade deve deixar claro se o conteúdo está:

- implementado;
- prototipado;
- mockado;
- planejado para R2;
- fora de escopo.

## Critério de Bloqueio

Uma página deve receber request changes se:

- não possui contexto;
- contradiz requisitos, escopo ou arquitetura;
- usa embed sem explicação;
- não tem relação clara com o projeto;
- não possui validação ou critério de aceite;
- possui texto incompleto ou sem acentuação adequada;
- não foi validada visualmente com `mkdocs serve` quando altera documentação pública.
