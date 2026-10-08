# Hospedagem interna - UNH Sistemas

## Arquitetura

GitHub -> computador/servidor interno da UNH -> PCs da rede interna.

O projeto usa Spring Boot na porta 8080 e escuta em 0.0.0.0.

## Requisitos do host

- Windows
- Java 21
- Git
- acesso ao repositorio privado no GitHub
- conexao estavel com a rede UNH
- permanecer ligado enquanto o sistema precisar estar disponivel

Prefira um computador ou servidor dedicado.

## Primeira instalacao

No computador que sera o host, execute como administrador:

    instalar_host_interno.bat

O instalador compila o sistema, libera a porta 8080 somente nos perfis Domain/Private do Windows e configura inicializacao automatica.

## Acesso

No host:

    http://127.0.0.1:8080/

Em outro PC da mesma rede:

    http://IP-DO-HOST:8080/

Para uso institucional, solicite a TI um IP reservado ou um nome DNS interno. Exemplo conceitual: http://sistemas-unh/ . O nome real deve ser definido pela infraestrutura da UNH.

## Atualizar a versao

Depois que uma nova versao for enviada ao GitHub, execute no host:

    atualizar_host_interno.bat

Ele faz git pull, recompila e reinicia o servidor.

## Seguranca

- nao publicar a porta 8080 na internet;
- nao criar redirecionamento de porta no roteador;
- manter o acesso somente na rede autorizada da UNH;
- a regra de firewall criada nao libera o perfil Public.

## Deploy automatico futuro

Se a TI aprovar, podemos instalar um GitHub self-hosted runner no servidor interno. Assim cada versao aprovada no GitHub pode ser implantada automaticamente sem executar o BAT manualmente.
