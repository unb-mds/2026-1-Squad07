# CrivoAI

Bem-vindo à documentação do **CrivoAI**, projeto desenvolvido pelo Squad 07 para apoiar o monitoramento da qualidade técnica de proposições legislativas.

## Visão Geral

O CrivoAI é uma plataforma web para organizar textos legislativos e preparar uma base de análise sobre clareza, legibilidade, complexidade, ambiguidade, referências legais e consistência normativa.

Na Release 1, o foco é demonstrar a viabilidade técnica do produto. O sistema já possui um fluxo mínimo funcional com frontend, backend e banco de dados integrados. A análise inteligente completa ainda não é real: scores, métricas legislativas e observações de qualidade exibidos em registros de demonstração são simulados.

## Problema

Textos legislativos costumam ser longos, técnicos e difíceis de revisar. Isso dificulta o acompanhamento por estudantes, pesquisadores, profissionais do Direito, assessores, analistas legislativos e demais pessoas que precisam compreender a qualidade de uma proposição antes de sua discussão, revisão ou consolidação.

O problema central do projeto é reduzir a distância entre o texto legislativo bruto e uma leitura técnica mais clara, rastreável e acessível.

## Solução

O CrivoAI organiza a jornada inicial de análise legislativa em uma plataforma com:

- cadastro e login básicos;
- submissão de textos legislativos;
- persistência das submissões no banco de dados;
- listagem de registros cadastrados;
- visualização de detalhes de uma submissão;
- indicadores demonstrativos para comunicar a experiência planejada de análise.

Essa base permite que a Release 2 avance para análise real com IA, cálculo de score, agente de apoio à interpretação legislativa e refinamentos de experiência.

## Estado Atual da Release 1

Na R1, o projeto entrega um **fluxo mínimo funcional persistido**:

1. a pessoa usuária cria uma conta ou realiza login;
2. submete um texto legislativo;
3. o backend recebe os dados por API;
4. o banco armazena a submissão;
5. o frontend lista os registros persistidos;
6. a pessoa usuária abre o detalhe de uma submissão cadastrada.

Além disso, o projeto possui documentação em MkDocs, protótipo de alta fidelidade, métricas de produtividade e specs SDD/TDD para orientar a continuidade da implementação.

## Limite da Demonstração

Os scores, métricas legislativas e observações exibidos em registros de demonstração são **simulados**. Eles não representam processamento real de NLP, integração com IA externa ou cálculo persistido pelo backend.

Na R1, esses indicadores existem para demonstrar a direção do produto. A implementação real da inteligência, do score e do agente de IA fica planejada para a R2.

## Links Principais

- [Escopo do Projeto](escopo/escopo_projeto.md): fonte oficial sobre R1, R2, limites e critérios de sucesso.
- [Requisitos Funcionais](requisitos/requisitos_funcionais.md): funcionalidades esperadas e status dentro da release.
- [Requisitos Não Funcionais](requisitos/requisitos_nao_funcionais.md): restrições, qualidades e critérios técnicos.
- [Matriz de Rastreabilidade](requisitos/rastreabilidade.md): relação entre requisitos, issues, specs e entregas.
- [Arquitetura](architecture/index.md): visão técnica do frontend, backend e banco de dados.
- [SDD e TDD](sdd/index.md): processo usado para orientar specs, testes e implementação.
- [Métricas](metricas/index.html): painel de produtividade do time.
- [Protótipo de Alta Fidelidade](prototipo/figma_prototype.md): referência visual e de experiência do produto.

## Como Executar Localmente

Para desenvolvimento e demonstração local:

1. configure as variáveis de ambiente conforme os arquivos `.env.example`;
2. suba backend e banco com Docker;
3. aplique o schema Prisma quando necessário;
4. suba o frontend com `npm run dev`;
5. abra a documentação com `mkdocs serve`.

As instruções detalhadas de cada área ficam nas páginas específicas de arquitetura, requisitos, specs e validação.

---

Última atualização: 2026-05-27
