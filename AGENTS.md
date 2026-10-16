# Regras de trabalho — Portal UNH (laboratório)

Este arquivo registra boas práticas acordadas no Radar IA Aplicado e no Banco de Ideias & Planos. **Não é uma ferramenta automática:** agentes e assistentes devem ler e cumprir o arquivo explicitamente quando sua plataforma permitir. Consultar sempre os requisitos do módulo específico.

## Propósito e isolamento

- `main` e o ambiente institucional **não** são destinos de alterações automáticas. Trabalhar na branch de laboratório `feat/autenticacao-portal` ou em uma branch de tarefa deliberadamente criada, com revisão antes de integrar.
- O Portal é a entrada de sistemas; `gestao-impressoes`, Perseus e o Vikunja institucional têm limites próprios. Não copiar credenciais, banco, dados de alunos ou documentos internos para este repositório público.
- Preservar a área de Impressões e seus dados históricos; outubro/2026 sem leitura confirmada significa **desconhecido**, nunca zero.
- Nada de `git reset --hard`, `git clean`, merge, deploy de produção ou substituição em lote para "resolver rápido" sem autorização.

## Ciclo de trabalho — Radar IA Aplicado

1. **Descobrir:** entender o fluxo do usuário e revisar requisitos existentes e Banco de Ideias antes de escolher tecnologia.
2. **Avaliar:** registrar valor concreto, risco, custo de manutenção, dependências e alternativas simples. Não adicionar LLM, MCP, n8n, RAG, novas bibliotecas ou infraestrutura sem necessidade demonstrada.
3. **Agir:** usar alterações pequenas e reversíveis; código legível; integração desligada por padrão; manter compatibilidade com Java 21 e com launcher Windows.
4. **Verificar:** CI Java + verificação sintática JS; testes que cubram login, autorização e mudanças de navegação. Não chamar a tarefa de concluída sem resultados verificáveis.
5. **Registrar:** atualizar documentação de requisitos, informar o commit e pendências reais. Para mudanças maiores: Issue → branch → testes → Pull Request em rascunho → revisão → merge **somente autorizado**.

## Gestão à Vista

- Fonte oficial futura de tarefas: Vikunja; o Portal deve ser inicialmente **somente leitura**. Não duplicar criação/edição Kanban.
- A instância UNH é provavelmente interna; **não foi confirmada**. Não adivinhar URL, versão, projetos ou tokens.
- Sem autorização TI, dados de tarefas ficam como **não conectados**, não como zeros, listas fictícias ou produtividade calculada.
- Toda API de conteúdo operacional deve validar autenticação **e permissão por projeto/setor no servidor**, inclusive agregações. A conta `admin.lab` serve só ao laboratório local e não equivale a autorização institucional.
- Armazenar tokens apenas no backend e fora do GitHub; não usar `localStorage` do navegador para credenciais.
- Para a API de status `GET /api/gestao-a-vista/status`, preservar resposta JSON, proteção por login e cache desativado. Ver `docs/api/gestao-a-vista-status.openapi.yaml`.
- Em falha de integração, diferenciar não conectado, indisponível, dados desatualizados e ausência genuína de tarefas.

## Qualidade e design

- Interface com hierarquia, tipografia legível, estados vazios honestos e navegação funcional por teclado, mouse e celular; sem excesso de verde, blur, sombras, chips, gradientes ou números de demonstração não identificados.
- Paisagens conceituais podem ser usadas como atmosfera, nunca vendidas como fotos do campus.
- Preferir dependências nativas antes de acrescentar pacote; cada dependência deve ter propósito e manutenção justificados.
- Priorizar segurança, simplicidade e acessibilidade. Motion funcional discreto, respeitando `prefers-reduced-motion`.
- Em estudos, explicar à usuária o conceito relevante e propor um pequeno teste manual antes de automatizar silenciosamente toda a aprendizagem.

## Verificações

```sh
./mvnw -B -ntp test
node --check src/main/resources/static/js/gestao-vista.js
```

No Windows, reiniciar apenas a instância local de `iniciar_portal_laboratorio.bat` depois do pull e usar `http://127.0.0.1:18081/`. A senha temporária gerada por execução **não** deve ser compartilhada.

As regras aqui são um guia versionado; os privilégios e o fluxo institucional efetivos precisam de homologação da TI.
