# Central de Automações — diretrizes de desenvolvimento

Decisões confirmadas em 15/10/2026:

**Público-alvo:** automações e ferramentas do Portal UNH devem ser construídas para **colaboradores autorizados da instituição**, não apenas para uso pessoal no computador da autora.

**Regra Git:** todo código, interface, testes, scripts de automação e documentação devem ser versionados em Git e enviados ao GitHub. O projeto integrador usa o repositório luizamoll/gestao-impressoes, branch feat/estrutura-mvp-esg. Ferramentas independentes podem permanecer em repositórios próprios, como o Perseus (privado). Não alterar main nem produção sem validação.

**Exceção de segurança obrigatória:** não enviar ao GitHub arquivos institucionais reais, PDFs de alunos, bases com dados pessoais, .env, tokens, senhas, chaves de API ou logs sensíveis. O repositório do Portal é público. Usar .gitignore e exemplos sintéticos em testes.

## Arquitetura gradual

Central de Automações (catálogo responsivo com busca)
  → API/gateway institucional autenticado (futuro)
  → workers Python isolados, fila de processamento e armazenamento temporário protegido (futuro)
  → PostgreSQL para controle de usuários, jobs, permissões e auditoria (futuro)
  → n8n somente quando houver orquestração concreta entre APIs/serviços, não como motor de PDF.

## O que existe agora

- A página automacoes.html lista o Perseus como **uso local**; não sugere que outros colaboradores possam acessar o seu localhost.
- Organização de planilhas e padronização documental são **ideias**, sem código de processamento publicado.
- Busca e filtro de estágio operam apenas no navegador, sem upload nem acesso a dados.
- O Perseus permanece no repositório privado e não foi copiado para este repositório público.
- A central não autentica usuários nem executa Python remotamente e não pode ser apresentada como pronta para produção.

## Critérios mínimos antes de uso multiusuário

1. Autenticação institucional e permissões por usuário, setor e tipo de operação.
2. Upload seguro de PDFs/planilhas, limite de tamanho, validação de conteúdo, armazenamento fora da área pública e exclusão programada.
3. Estado das tarefas, fila e limites de concorrência, isolamento do processamento e bloqueio de acesso indevido aos resultados.
4. Registro de auditoria sem vazar dados pessoais nos logs.
5. Testes com arquivos sintéticos e homologação da TI antes de publicar na intranet interna.
6. Medição de tempo economizado e taxa de erro sem rastreamento desnecessário dos colaboradores.

## Diretriz de tecnologia

Python para transformação de dados, leitura de PDFs, planilhas e documentos. Java/Spring Boot permanece nos módulos em que já agrega valor. n8n apenas para fluxos multissistema, aprovações e notificações com credenciais e endpoints homologados.

Toda decisão técnica futura deve ser registrada no repositório Git correspondente.

## Entrega técnica 15/10/2026 — API Python do Perseus (em validação)

O repositório privado `luizamoll/perseus-conferencia`, branch `feat/nova-interface`, agora possui um novo `servico_interno.py` separado da interface local. Seu endpoint interno em `127.0.0.1:8879` exige chave forte apenas entre servidores, identifica o autor da tarefa enviado por um gateway autenticado, permite consultar status e baixar somente resultados do mesmo autor. Possui testes automatizados de autenticação e segregação. O processamento original em `127.0.0.1:8878` foi preservado.

**IMPORTANTE:** este serviço ainda **não está liberado para colaboradores**. Nenhuma API externa, infraestrutura ou gateway autenticado foi implantado. O protótipo não implementa login institucional e, por isso, não permite acesso remoto/multiusuário seguro por si só. O próximo passo é implementar o gateway de aplicação com sessão institucional, regras por setor e proteção da chave exclusivamente no backend. Não colocar chave em browser nem expor `:8879` à LAN.

Contrato, execução, testes e limites detalhados em `API_INTERNA.md` do repositório privado Perseus.
