# Nexo — Assistente do Portal UNH

**Estado:** protótipo local de navegação. **Não é um agente de IA conectado.**  
**Escopo:** branch de laboratório `feat/autenticacao-portal`; nenhuma alteração em `main` ou em sistemas internos.  
**Primeira implementação:** 16/10/2026.

## Produto e identidade

O Nexo é um assistente flutuante que acompanha o usuário pelo Portal UNH e fornece orientação contextual quando clicado. Sua primeira tarefa é facilitar a descoberta dos módulos sem adicionar um segundo menu permanente.

- **Estilo:** robô premium, simpático sem infantilização, metal cinza/prata, grafite, olhos discretos azulados, blusa grafite com o símbolo branco oficial UNH. **Sem verde no robô**.
- **Movimento:** flutuação discreta, CSS puro, desativada por `prefers-reduced-motion`.
- **Posição:** canto inferior direito; o painel fica recolhido por padrão. Botão e painel possuem foco visível, informações acessíveis e fechamento via botão ou `Esc`.
- **Nome de trabalho:** Nexo — sujeito à validação.
- **Arquivos isolados:** `assets/nexo-robo.svg`, `css/nexo-assistente.css` e `js/nexo-assistente.js`. Sem bibliotecas novas.

## Fase 1 — guia de navegação (implementada)

No Portal e páginas principais, o Nexo abre um painel com atalhos reais para Mural, Ferramentas, Gestão à Vista, Impressões e Automações. Ao clicar em “O que você consegue fazer agora?”, informa explicitamente que é apenas um guia, sem conversa de IA nem acesso a dados institucionais.

**Restrições:**

- Sem campo que simule uma conversa livre sem backend; sem análise de dados e sem promessas de ações que não existem.
- Sem chamadas a LLM, APIs internas, armazenamento de histórico, coleta de nomes/identificadores, cookies extras ou credenciais em HTML/JavaScript.
- O assistente não substitui autenticação, autorização nem a navegação existente.
- Links respeitam a proteção atual das páginas: fora do laboratório, acesso a ferramenta protegida ainda exige login.
- Os arquivos estáticos do Nexo podem ser públicos; dados internos não são transmitidos.

## Emoções do Nexo — primeiro lote interativo (implementado)

Seis variantes SVG preservam o mesmo tronco simétrico, o uniforme grafite e a marca branca, mudando olhos, boca e pequenos detalhes visuais. Assets: `nexo-robo.svg` (normal) e `nexo-robo-{saudacao,pensando,respondendo,confirmacao,dica}.svg`. A paleta do personagem exclui verde.

| Emoção | Gatilho verdadeiro | Comportamento |
| --- | --- | --- |
| Normal | Painel fechado / carregamento inicial | Olhar calmo e movimento suave de repouso |
| Saudação | Usuário abre o painel | Expressão sorridente e aceno discreto |
| Respondendo | Usuário expande a explicação das capacidades | Expressão de fala; conteúdo estático e conferível |
| Dica | Usuário solicita "Dica desta página" | Expressão inspirada; dica local apropriada ao módulo, sem chamadas de rede |
| Pensando | Usuário aciona "Copiar endereço" e a Promise do navegador está pendente | Expressão de concentração; sem falsa análise de IA |
| Confirmação | `navigator.clipboard.writeText` conclui com sucesso | Expressão de alegria; confirmação não aparece se a operação falhar |

O botão de cópia existe para demonstrar **uma operação real e verificável**. Se o navegador bloquear o Clipboard API, o Nexo exibe instrução para copiar pelo teclado e nunca declara êxito. Outras automações/integrações permanecem desabilitadas.

**Uso cuidadoso:** nada de mensagens proativas automáticas, pop-ups repetitivos ou caricaturas em loop. Animação reduzida segue o sistema via `prefers-reduced-motion`. Respostas do Nexo não fazem requisições externas, não acessam dados de estudantes, nem simulam consultas institucionais.

**Validação:** testes Node para seis assets, contexto local, troca de estados, atraso de cópia real, sucesso e ausência de permissão. A inspeção visual final no Edge/Windows ainda exige confirmação da usuária.

## Fase 2 — orientador contextual e explicação de indicadores (proposta)

Antes de contratar IA, testar utilidade com intenções estritas e dados estáticos/autorizados:
1. Explicar o que são consumo, franquia e competência na Gestão de Impressões.
2. Indicar o módulo responsável por cada atividade, sem inventar funcionalidades.
3. Detectar qual página está aberta **apenas localmente**, para oferecer 2–3 atalhos relevantes.
4. Ajudar a interpretar estados “não conectado”, “sem leitura”, “sem permissão” e “indisponível” sem converter ausência em zero.
5. Medir utilidade de maneira voluntária, sem identificação pessoal por padrão.

Critério de avanço: usuários conseguirem resolver tarefas concretas mais rapidamente, com feedback positivo e sem criar sobrecarga visual.

## Fase 3 — agente de IA supervisionado (depende de TI e caso de uso)

**Somente após autorização institucional e infraestrutura segura:**
- Backend exclusivo com regras por setor, usuário e ferramenta; sessões e autorização por recurso no servidor, nunca no prompt nem só no cliente.
- Conhecimento institucional revisado com fontes e data de atualização, busca controlada e citações (RAG apenas se necessário). Sem usar conteúdo não homologado ou dados de estudantes em modelo externo sem acordo institucional.
- Respostas baseadas em conteúdo permitido ao usuário; incerteza clara, possibilidade de “não sei”, revisão humana e limites de uso.
- Para futuras **ações**: confirmação explícita, escopos mínimos, rastreabilidade e rollback; começar com consultas somente leitura.
- Proteção contra prompt injection em textos recuperados e bloqueio de exposição cruzada de dados.
- Observabilidade com logs mínimos e retenção aprovada; nenhuma gravação silenciosa de perguntas sensíveis.
- Revisão de custos, hospedagem, SSO/LDAP e compliance antes de integrar qualquer LLM.

### Prioridade de valor

**Primeiro:** navegação e explicações verificáveis.  
**Depois:** consultas controladas à base de conhecimento aprovada.  
**Por último:** automações inteligentes supervisionadas, com aprovação da TI.

## Testes e validações

```sh
node --check src/main/resources/static/js/nexo-assistente.js
node --test tests/nexo-assistente.test.cjs
./mvnw -B -ntp test
```

A CI verifica o widget e garante que seus arquivos entrem no JAR. A aprovação estética e a inspeção manual no Edge/Windows continuam pendentes do feedback da usuária. Não tratar mockups conceituais como dados operacionais nem como captura do produto final.
