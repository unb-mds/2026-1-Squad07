# SDD e TDD

## Objetivo

Esta seção define como o Squad 07 usa **Spec Driven Development (SDD)** e **Test Driven Development (TDD)** para organizar o desenvolvimento do projeto Monitoramento de Qualidade de Leis.

O objetivo não é criar burocracia. A intenção é reduzir ambiguidades antes da implementação, melhorar a qualidade da documentação e permitir que devs, PO, Scrum Master, professora e agentes de IA entendam o que deve ser feito antes de alterar código.

## Por que isso existe

O projeto possui várias fontes de informação: issues, MkDocs, Figma, Miro, arquitetura, métricas e decisões feitas durante as sprints. Sem um padrão, cada nova funcionalidade pode nascer com interpretações diferentes.

O SDD resolve isso criando uma spec antes da implementação. O TDD complementa esse processo exigindo que cada spec tenha critérios de teste ou validação antes das tarefas de código.

## Relação com Scrum, XP e Agentes de IA

O SDD não substitui o Scrum usado pelo grupo. Scrum continua organizando backlog, sprints, milestones, papéis, reviews e prioridades. O SDD atua como apoio para transformar issues em especificações claras antes da implementação.

Na R2, a implementação será apoiada por práticas de XP, como TDD, feedback rápido, simplicidade, refatoração contínua e integração frequente. Nesse fluxo, as specs ajudam a definir o que será desenvolvido e os testes ajudam a validar se o comportamento esperado foi atendido.

Agentes de IA entram como auxiliares desse processo. O projeto possui instruções para agentes em arquivos `AGENTS.md`, specs e skills locais. O Codex é a integração inicial configurada no Spec Kit, mas não é a base conceitual do projeto. As instruções devem ser úteis para qualquer agente de IA ou pessoa que precise entender o contexto, revisar documentação, planejar tarefas ou apoiar implementação.

## Fluxo do Squad 07

O fluxo padrão é:

1. Criar ou atualizar a issue no GitHub.
2. Criar uma spec em `specs/`.
3. Escrever `spec.md` com objetivo, contexto, comportamento esperado e critérios de aceite.
4. Criar `plan.md` com abordagem técnica ou documental.
5. Criar `test-plan.md` antes de gerar tarefas.
6. Criar `tasks.md` com tarefas rastreáveis.
7. Implementar apenas depois da spec estar clara.
8. Validar com testes automatizados, validação manual ou TDD documental.
9. Rodar `mkdocs serve` sempre que a mudança afetar documentação pública.

## Relação com R1 e R2

Na R1, o foco é garantir documentação, protótipo, arquitetura, métricas e fluxo mínimo demonstrável. Nem tudo precisa estar implementado, mas tudo precisa estar claro.

Na R2, o foco será implementação completa. Por isso, toda funcionalidade movida para desenvolvimento deve possuir SDD e TDD em sua composição.

## Regra central

Nenhuma feature relevante deve ser considerada pronta para implementação se não possuir:

- comportamento esperado;
- critérios de aceite;
- plano de testes ou validação;
- separação entre R1 demonstrável, R2 completa e futuro;
- tarefas rastreáveis à spec e à issue.

## Documentação como produto

A documentação também segue TDD. Uma página só deve ser aprovada quando explica por que existe, qual contexto possui, como se conecta ao projeto e como pode ser validada.

Páginas compostas apenas por links, embeds, imagens ou listas soltas devem receber ajustes antes do merge.

## Validação Local

Alterações em documentação devem ser abertas no MkDocs localmente com `mkdocs serve`. A validação precisa conferir se a página aparece na navegação correta, se o texto está legível, se links e embeds possuem contexto e se não há sobreposição visual.
