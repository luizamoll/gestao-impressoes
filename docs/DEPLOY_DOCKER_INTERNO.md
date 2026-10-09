# Entrega ao responsavel pela hospedagem interna — Portal UNH

## Situacao atual

A branch `main` contem o Portal UNH com Gestao de Impressoes e ESG. O `Dockerfile` e o `pom.xml` recebidos foram preservados. A interface atual apresenta dados historicos incorporados nos arquivos estaticos; **nao existe upload/processamento real no backend, gravacao em PostgreSQL ou login LDAP implementado**. Tratar a primeira implantacao como **teste interno controlado**, nao como producao funcional.

## Primeiro teste com Docker (sem PostgreSQL)

Executar no servidor de testes autorizado pela TI, depois de obter uma copia do repositorio:

```bash
docker build -t portal-unh:teste .
docker run --rm -d --name portal-unh-teste -p 127.0.0.1:8080:8080 portal-unh:teste
docker logs portal-unh-teste
curl -f http://127.0.0.1:8080/
curl -f http://127.0.0.1:8080/impressao.html
curl -f http://127.0.0.1:8080/esg.html
docker stop portal-unh-teste
```

A publicacao no endereco 127.0.0.1 e proposital: teste local antes de permitir acesso de outros computadores. **Nao abrir 8080 para a internet**. A exposicao na rede institucional e responsabilidade da TI (firewall, DNS interno e, quando aplicavel, proxy com TLS/autenticacao).

## Perfil do banco

Sem perfil ativo, o Spring inicia em `sem-banco`, com auto-configuracao do datasource/JPA desabilitada. Nao se cria banco ou dados de exemplo.

Quando houver PostgreSQL realmente provisionado, a TI deve ativar `SPRING_PROFILES_ACTIVE=banco` e fornecer, fora do repositorio:

- `DB_URL`: `jdbc:postgresql://SERVIDOR:5432/NOME_DO_BANCO`
- `DB_USER`: usuario de banco com permissoes minimas
- `DB_PASSWORD`: segredo armazenado fora do codigo/GitHub

O perfil `banco` **nao cria nem altera tabelas automaticamente** (`ddl-auto=validate`). Se nao houver conexao ou tabelas exigidas, a inicializacao podera falhar. O fato de ativar o perfil nao cria endpoints nem persistencia que ainda nao foram implementados.

## Validacoes obrigatorias antes da liberacao

1. Confirmar `docker build` sem erros e `mvn test` passando no ambiente da TI.
2. Verificar inicializacao e HTTP 200 em `/`, `/impressao.html` e `/esg.html`.
3. Verificar layout, logo, navegacao e dados de outubro zerados versus historico de setembro.
4. Garantir acesso limitado a usuarios autorizados da rede interna; nao existe login de aplicativo.
5. Confirmar se o repositorio publico pode conter os nomes dos setores, numeros de serie e dados historicos hoje presentes no front-end. Caso nao, restringir acesso ao repositorio e revisar os dados **antes** de divulgar.
6. Planejar autenticacao institucional/LDAP e API de upload antes de usar o sistema como servico definitivo.

## Atualizacoes

O `Dockerfile` e o `pom.xml` sao arquivos de referencia enviados pela TI e nao devem ser substituidos por templates em atualizacoes futuras. Alteracoes posteriores devem ser combinadas e revisadas.

**Nao ha deploy automatico configurado por estas alteracoes.**
