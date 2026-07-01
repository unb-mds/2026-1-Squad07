# Política de Segurança

A segurança do CrivoAI é uma prioridade do Squad 07. Esta política descreve como
reportar vulnerabilidades e o que esperar após o envio de um relatório.

## Versões Suportadas

Por se tratar de um projeto acadêmico em desenvolvimento ativo, apenas a versão mais
recente do código nas branches `main` e `dev` recebe correções de segurança.

| Versão            | Suportada          |
| ----------------- | ------------------ |
| `main` (estável)  | :white_check_mark: |
| `dev`             | :white_check_mark: |
| Demais branches   | :x:                |

## Como Reportar uma Vulnerabilidade

**Não abra uma issue pública para relatar vulnerabilidades de segurança.** Divulgar
uma falha publicamente antes de sua correção pode expor os usuários a riscos.

Em vez disso, utilize um dos canais privados abaixo:

1. **GitHub Security Advisories (recomendado):** acesse a aba
   [**Security**](https://github.com/unb-mds/2026-1-Squad07/security/advisories) do
   repositório e clique em *"Report a vulnerability"*. Esse canal mantém o relatório
   privado até que a correção esteja disponível.
2. **E-mail:** envie os detalhes para **jonathancarpanedaj@gmail.com**, com o assunto
   iniciando por `[SEGURANÇA] CrivoAI`.

### Informações que ajudam na análise

Para acelerar a investigação, inclua no relatório, sempre que possível:

- Uma descrição clara da vulnerabilidade e do seu impacto potencial;
- Os passos para reproduzir o problema (endpoint, requisição, payload ou tela afetada);
- A versão, branch ou commit em que a falha foi identificada;
- Provas de conceito, capturas de tela ou logs relevantes;
- Qualquer sugestão de mitigação ou correção, caso tenha.

## O que Esperar Após o Relatório

- **Confirmação de recebimento:** em até **5 dias úteis**.
- **Avaliação inicial e triagem:** em até **10 dias úteis**, informaremos se a falha foi
  confirmada e qual a severidade atribuída.
- **Correção:** vulnerabilidades confirmadas serão corrigidas em uma branch dedicada e
  integradas via Pull Request para `dev` e, em seguida, `main`.
- **Divulgação:** após a correção, os créditos podem ser atribuídos à pessoa que reportou,
  caso ela deseje.

Pedimos que a divulgação seja **responsável**: aguarde a correção antes de tornar a
vulnerabilidade pública.

## Boas Práticas de Segurança no Projeto

Para contribuidores, reforçamos alguns cuidados básicos:

- **Nunca** faça commit de segredos (senhas, tokens, chaves de API ou strings de conexão).
  Utilize variáveis de ambiente e o arquivo `.env.example` como referência.
- Mantenha as dependências do backend (`requirements.txt`) e do frontend
  (`package.json`) atualizadas.
- Valide e sanitize entradas de usuário, especialmente nos endpoints de submissão de
  textos legislativos.
- Siga o princípio do menor privilégio ao configurar acessos ao banco de dados e a
  serviços externos.

Agradecemos a colaboração de todas as pessoas que ajudam a manter o CrivoAI seguro.
