# Base de conhecimento local do Nexo (laboratório)

Versão editorial: 19/10/2026. **Conteúdo experimental; não representa instrução oficial da Unihorizontes nem aprovação da TI.**

## Objetivo

Oferecer respostas específicas e verificáveis sobre o estágio dos próprios módulos do Portal, sem depender de modelo de IA, custo de API ou acesso a serviços internos. O motor local segue retornando texto simples e apenas links previstos na lista de navegação aprovada.

## Como funciona

- A fonte editável fica em `src/main/resources/static/js/nexo-conhecimento.js`: respostas, expressões de ativação, origem e chave de ação. Nunca inserir CPF, dados de alunos, credenciais, links privados, informação operacional sigilosa ou conteúdo institucional não autorizado.
- A busca normaliza acentos e compara frases específicas. Se não houver correspondência, o Nexo continua com as respostas originais do motor de regras.
- Bloqueios para dados pessoais e respostas sobre competências de Impressões permanecem prioritários. Nenhuma pergunta é enviada a modelo externo; respostas ficam na memória da página.
- Alterações em procedimentos oficiais devem ser aprovadas pelo setor competente antes de serem apresentadas como orientação institucional. A data editorial é do protótipo, não data de homologação.
- Links de navegação continuam na lista `safeLinks` do arquivo `nexo-agente.js`. Novas URLs de serviços não devem ser inseridas sem revisão de segurança.

## Testes

No repositório, execute `node --test tests/nexo-conhecimento.test.cjs` (Node.js 18+). Os casos verificam suporte, impressoras, limite do Perseus em localhost, publicação e persistência do mural, natureza não generativa do Nexo, bloqueio de informações pessoais, indisponibilidade do Vikunja, competência sem leitura e fallback.

## Próximos passos (não implementados)

1. Definir responsáveis e processo de atualização das perguntas e respostas com TI/Comunicação.
2. Implementar mural persistente com autenticação/autorização aplicadas **no backend**, trilha de alterações e testes por papel.
3. Estudar base documentada versionada e pesquisa melhorada, com citação à fonte aprovada.
4. Integrar GLPI, LDAP/AD e Vikunja somente após validação da TI e sem credenciais no navegador.

A base local não é um sistema de chamados, não autentica usuários e não registra mensagens.
