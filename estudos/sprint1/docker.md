# Docker

## O que é Docker?
O Docker é uma plataforma de software que permite a criação, distribuição e execução de aplicativos em contêineres. O uso de contêineres é possível graças às capacidades de isolamento de processos e virtualização incorporadas no kernel do Linux.

Essas ferramentas para alocar recursos para os processos e os namespaces para restringir o acesso ou a visibilidade de um processo a outras pessoas ou áreas do sistema, permitem que diversos componentes de aplicativos compartilhem os recursos de uma única instância do sistema operacional.

## Docker e as Máquinas virtuais
As máquinas virtuais funcionam como uma emulação de um computador físico, utilizando o host (nome associado à máquina física). Com o objetivo de várias máquinas rodarem em um mesmo hardware, a emulação utiliza um hypervisor. O hypervisor aloca recursos de computação física, como processadores, memória e armazenamento, para cada VM. Ele mantém cada VM separada das outras para evitar interferências.

Uma vez que as máquinas virtuais possuem, de forma individual, seu próprio sistema para funcionar de forma isolada, são significantemente mais pesadas que o Docker. Em vez de virtualizar o hardware necessário, os contêineres virtualizam o sistema operacional (geralmente Linux) de modo que cada contêiner individual contenha apenas o aplicativo e suas bibliotecas e dependências. A ausência do sistema operacional guest (os que utilizam o host) é o motivo pelo qual os contêineres são tão leves e, portanto, rápidos e portáteis.

Portanto, os contêineres compartilham o kernel do sistema operacional da máquina, eliminando a necessidade de uma instância completa do sistema operacional por aplicativo e tornando os arquivos de contêineres pequenos e fáceis de usar. O tamanho menor, especialmente em comparação com máquinas virtuais, significa que eles podem se adaptar rapidamente e suportar melhor aplicativos nativos da cloud com escala ajustada horizontalmente.

Graças ao uso de namespaces para restringir o acesso ou visibilidade de um processo a outras pessoas ou áreas do sistema permitem que diversos componentes de aplicativos compartilhem os recursos de uma única instância do sistema operacional host da mesma forma que um hypervisor funciona para as VMs. É utilizado também cgroups (control groups) para limitar o acesso a recursos da maquina.

## Benefícios do Docker
* **Significativamente mais leve** em comparação às máquinas virtuais.
* **Móvel e independente de plataforma:** os contêineres carregam todas as dependências associadas com eles, o que significa que um software pode ser codificado uma vez e executado sem a necessidade de reconfigurá-lo em diferentes ambientes.
* **Redução de gastos na cloud:** Permite ao desenvolvedor executar várias vezes no mesmo hardware o mesmo número de aplicativos de uma VM.
* **Melhor produtividade:** Implementação e reinicialização dos contêineres ocorre de maneira mais simples e rápida. Isso os torna ideais para uso em pipelines de integração contínua e entrega contínua (CI/CD). Logo, é mais adequado para equipes que adotam práticas de DevOps e Agile.

## Imagem e Dockerfile
Uma imagem Docker é um pacote leve e autônomo que contém um ambiente completo para executar um aplicativo ou serviço. Ele inclui todos os recursos necessários, como bibliotecas, dependências e configurações, para garantir que o aplicativo funcione consistentemente, independentemente do ambiente de hospedagem.

As imagens Docker são criadas a partir de um arquivo chamado Dockerfile. Um Dockerfile é um arquivo de texto simples que contém instruções para construir uma imagem Docker. Ele descreve como a imagem deve ser configurada, quais pacotes devem ser instalados, quais arquivos devem ser copiados e como o ambiente deve ser configurado.

O Dockerfile é usado como entrada para o comando `docker build`, que cria uma imagem Docker a partir das instruções fornecidas no arquivo.

Em resumo, uma imagem Docker é um recipiente que encapsula um ambiente de aplicativo completo, enquanto um Dockerfile é usado para definir como essa imagem é construída. Isso permite que os desenvolvedores criem, compartilhem e implantem aplicativos de maneira consistente e portátil em diferentes ambientes usando a tecnologia Docker.