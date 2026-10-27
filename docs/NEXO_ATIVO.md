# Nexo — estado operacional (Portal UNH)

Atualizado: 2026-10-27. Branch de desenvolvimento: `feat/atalhos-apps-home-20261027`.

## Disponibilidade
- `nexo-agente.js` é um orientador local por regras, disponível enquanto a página do Portal está aberta. **Não** é uma IA generativa hospedada.
- `nexo-assistente.js` monta o robô e seu painel. Presente em `index.html`, `aplicativos.html`, `gestao-a-vista.html`, `impressao.html`, `esg.html`, `gestao-documental.html` e `automacoes.html`.
- O painel aberto permanece aberto durante a navegação **na mesma aba**, usando apenas uma flag em `sessionStorage`. Perguntas e respostas nunca são gravadas.
- As orientações apontam para as páginas atuais, inclusive Biblioteca de Aplicativos e Vikunja; não existem mais links para o mural social descontinuado.
- Nenhum dado de alunos, senha ou informação real de projetos é consultado pelo Nexo.

## Inicialização em Windows
Na raiz do repositório:

```powershell
.\iniciar-portal.ps1
```

O Portal inicia normalmente com o Nexo de regras disponível em todas as páginas; não requer Python ou Ollama.

## IA generativa local (opcional, somente laboratório)
```powershell
.\iniciar-portal.ps1 -ComIALocal
```

O script **tenta** iniciar a ponte Python local `127.0.0.1:18767`, mas requer `py`, `~/Nexo-Lab/nexo_unh.py` e o modelo/Ollama configurado. A ponte não usa nem deve receber dados institucionais reais. Para permitir o uso dessa IA experimental, a pessoa precisa ativar explicitamente **Ativar IA local (laboratório)** no painel do Nexo; a preferência permanece na aba até ser desativada ou a aba ser encerrada. O script encerra apenas a ponte que ele próprio iniciou quando a execução do Portal termina.

Se a ponte ou modelo estiver indisponível, as orientações por regras continuam funcionando. **Não há serviço de IA generativa sempre ligado nem integração institucional autorizada.** A disponibilidade após fechar o Portal exige hospedagem/infraestrutura e autorização separadas.

## Verificação
- `node --test tests/nexo-agente.test.cjs`
- Verificar que `nexo-agente.js` e `nexo-assistente.js` carregam na home e na biblioteca.
- Abrir painel na home, navegar para Aplicativos na mesma aba; painel deve permanecer aberto.
- Perguntar sobre Helpdesk, Teams, Outlook e Vikunja; as respostas oferecem atalhos aprovados.
- Confirmar que nenhuma resposta afirma consultar dados reais de alunos, tarefas ou impressoras.
