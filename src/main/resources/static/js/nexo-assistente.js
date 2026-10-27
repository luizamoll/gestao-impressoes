"use strict";

/**
 * Nexo - orientador de navegacao do Portal UNH.
 * Modo padrão: regras, sem rede. Modo IA opcional SOMENTE em localhost
 * através de ponte Python de laboratório, sem dados/contas institucionais.
 * Nao armazena perguntas nem cookies; apenas o estado aberto/fechado na aba.
 */
(() => {
  if (document.getElementById("nexo-widget") || !document.body) return;

  const host = document.createElement("div");
  host.id = "nexo-widget";
  host.className = "nexo-widget";
  host.innerHTML = `
    <aside id="nexo-panel" class="nexo-panel" aria-labelledby="nexo-title" hidden>
      <div class="nexo-panel-head">
        <div class="nexo-panel-identification">
          <span class="nexo-panel-avatar"><img id="nexo-panel-robot" src="assets/nexo-robo.svg?v=20261019-v3" alt="" width="43" height="49"></span>
          <div>
            <strong id="nexo-title">Nexo</strong>
            <span>Orientação ativa · navegação do Portal</span>
          </div>
        </div>
        <button type="button" id="nexo-close" class="nexo-close" aria-label="Fechar assistente">×</button>
      </div>
      <div class="nexo-panel-body">
        <p class="nexo-intro"><strong>Olá! Posso ajudar?</strong> Estou disponível enquanto você navega pelo Portal. Posso explicar cada área e indicar os aplicativos corretos.</p>
        <section class="nexo-context" aria-labelledby="nexo-context-title">
          <p class="nexo-context-eyebrow">Nexo nesta página</p>
          <strong id="nexo-context-title">Portal UNH</strong>
          <p id="nexo-context-suggestion" class="nexo-context-suggestion">Veja dicas e recursos relevantes para a página.</p>
          <p class="nexo-context-alert" id="nexo-context-alert">Avisos do protótipo — não são alertas institucionais em tempo real.</p>
          <div class="nexo-context-prompts" aria-label="Perguntas sugeridas">
            <button type="button" id="nexo-context-prompt-a">Como usar esta página?</button>
            <button type="button" id="nexo-context-prompt-b">O que merece atenção?</button>
          </div>
          <small id="nexo-context-source" class="nexo-context-source">Orientação local do laboratório</small>
        </section>
        <button type="button" id="nexo-lab-toggle" class="nexo-lab-toggle" aria-pressed="false" hidden>Ativar IA local (laboratório)</button>
        <form id="nexo-chat-form" class="nexo-chat-form" aria-label="Converse com o Nexo">
          <label for="nexo-chat-input">Pergunte ao Nexo</label>
          <div class="nexo-chat-entry">
            <input id="nexo-chat-input" name="pergunta" type="text" autocomplete="off"
                   maxlength="280" placeholder="Ex.: Onde encontro o Vikunja?" required>
            <button type="submit" id="nexo-chat-submit" aria-label="Enviar pergunta ao Nexo">Enviar</button>
          </div>
        </form>
        <div id="nexo-chat-log" class="nexo-chat-log" role="log" aria-label="Conversa temporária com o Nexo" aria-live="polite" aria-relevant="additions text"></div>
        <p class="nexo-chat-disclosure">Respostas orientadas por regras e dados históricos de laboratório. Sem IA generativa nesta fase.</p>
        <p class="nexo-section-heading">Ou escolha um atalho</p>
        <nav class="nexo-links" aria-label="Atalhos do assistente">
          <a href="index.html#destaques"><span aria-hidden="true">▤</span><span>Destaques da home</span><span aria-hidden="true">→</span></a>
          <a href="aplicativos.html"><span aria-hidden="true">▦</span><span>Biblioteca de Aplicativos</span><span aria-hidden="true">→</span></a>
          <a href="https://vikunja.unihorizontes.local/projects/3/12" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">✓</span><span>Vikunja · tarefas e projetos</span><span aria-hidden="true">↗</span></a>
          <a href="gestao-a-vista.html"><span aria-hidden="true">▥</span><span>Gestão à Vista</span><span aria-hidden="true">→</span></a>
          <a href="impressao.html"><span aria-hidden="true">▣</span><span>Gestão de Impressões</span><span aria-hidden="true">→</span></a>
          <a href="automacoes.html"><span aria-hidden="true">⌘</span><span>Central de Automações</span><span aria-hidden="true">→</span></a>
        </nav>
        <div class="nexo-help-area">
          <button type="button" id="nexo-explain" class="nexo-explain" aria-controls="nexo-help-answer" aria-expanded="false">O que você consegue fazer agora? <span aria-hidden="true">⌄</span></button>
          <p id="nexo-help-answer" class="nexo-help-answer" hidden>Estou ativo como guia do Portal e respondo com regras locais, sem serviços externos. A IA generativa é um experimento opcional e separado; não tenho acesso a dados de alunos ou tarefas reais.</p>
        </div>
        <div class="nexo-quick-actions" aria-label="Ajuda do Nexo">
          <button type="button" id="nexo-tip" class="nexo-action" aria-describedby="nexo-tip-description">Dica desta página <span aria-hidden="true">✦</span></button>
          <button type="button" id="nexo-copy" class="nexo-action">Copiar endereço <span aria-hidden="true">↗</span></button>
        </div>
        <p id="nexo-tip-description" class="nexo-visually-hidden">Mostra uma dica local, sem consultar IA nem dados institucionais.</p>
        <p id="nexo-feedback" class="nexo-feedback" role="status" aria-live="polite" hidden></p>
        <p class="nexo-disclaimer">Guia do Portal ativo · sem IA generativa</p>
      </div>
    </aside>
    <button id="nexo-toggle" class="nexo-launcher" type="button"
        aria-controls="nexo-panel" aria-expanded="false" aria-label="Abrir Nexo, assistente de navegação do Portal UNH">
      <img id="nexo-robot" src="assets/nexo-robo.svg?v=20261019-v3" width="91" height="104" alt="" class="nexo-launcher-avatar">
      <span class="nexo-launcher-label">Posso ajudar?</span>
    </button>`;
  document.body.append(host);

  const toggle = document.getElementById("nexo-toggle");
  const panel = document.getElementById("nexo-panel");
  const close = document.getElementById("nexo-close");
  const explain = document.getElementById("nexo-explain");
  const answer = document.getElementById("nexo-help-answer");
  const launcherRobot = document.getElementById("nexo-robot");
  const panelRobot = document.getElementById("nexo-panel-robot");
  const tipButton = document.getElementById("nexo-tip");
  const copyButton = document.getElementById("nexo-copy");
  const feedback = document.getElementById("nexo-feedback");
  const chatForm = document.getElementById("nexo-chat-form");
  const chatInput = document.getElementById("nexo-chat-input");
  const chatLog = document.getElementById("nexo-chat-log");
  const labToggle = document.getElementById("nexo-lab-toggle");
  const disclosure = document.querySelector(".nexo-chat-disclosure");
  const disclaimer = document.querySelector(".nexo-disclaimer");
  const helpAnswer = document.getElementById("nexo-help-answer");
  const chatSubmit = document.getElementById("nexo-chat-submit");
  const contextTitle = document.getElementById("nexo-context-title");
  const contextSuggestion = document.getElementById("nexo-context-suggestion");
  const contextAlert = document.getElementById("nexo-context-alert");
  const contextSource = document.getElementById("nexo-context-source");
  const suggestedPrompts = [document.getElementById("nexo-context-prompt-a"),
                            document.getElementById("nexo-context-prompt-b")];
  const NEXO_LOCAL_URL = "http://127.0.0.1:18767/chat";
  // IA somente no mesmo computador, via servidor local iniciado pela usuária.
  const isLocalPortal = /^http:\/\/(?:127\.0\.0\.1|localhost):(?:18081|8080)(?:\/|$)/.test(String(window.location.href));
  // Opt-in somente no laboratório local. Mantido apenas na aba atual;
  // nunca guardar mensagens, credenciais nem respostas.
  const NEXO_LAB_KEY = "unh-nexo-lab-consent";
  let labEnabled = false;
  function renderLabMode() {
    if (labToggle) {
      labToggle.setAttribute("aria-pressed", String(labEnabled));
      labToggle.textContent = labEnabled ? "Voltar ao modo de regras" : "Ativar IA local (laboratório)";
    }
    if (disclosure) disclosure.textContent = labEnabled
      ? "IA local experimental. Apenas dados demonstrativos; não envie dados pessoais, senhas ou relatórios reais."
      : "Nexo ativo com orientações locais. Nenhuma conversa é enviada a serviços externos.";
    if (disclaimer) disclaimer.textContent = labEnabled
      ? "IA local autorizada nesta aba · somente demonstração"
      : "Guia do Portal ativo · sem IA generativa";
    if (helpAnswer) helpAnswer.textContent = labEnabled
      ? "Neste modo de laboratório, posso consultar ferramentas demonstrativas via Python e Qwen local, se estiverem em execução. Não acesso registros institucionais."
      : "Estou ativo como guia do Portal e respondo com regras locais, sem serviços externos. A IA generativa é um experimento opcional e separado; não tenho acesso a dados de alunos ou tarefas reais.";
  }
  if (isLocalPortal && labToggle) {
    labToggle.hidden = false;
    try { labEnabled = window.sessionStorage.getItem(NEXO_LAB_KEY) === "1"; } catch (_error) { /* Sessao opcional */ }
    labToggle.addEventListener("click", () => {
      labEnabled = !labEnabled;
      try { window.sessionStorage.setItem(NEXO_LAB_KEY, labEnabled ? "1" : "0"); } catch (_error) { /* Sem permissao de armazenamento */ }
      renderLabMode();
      showFeedback(labEnabled
        ? "IA local permitida nesta aba. Requer a ponte Python e o modelo no computador; não envie dados reais."
        : "Modo de regras ativo; nenhuma pergunta será enviada à ponte Python.");
      showEmotion(labEnabled ? "confirmacao" : "normal");
    });
  }
  renderLabMode();

  // O contexto é local, baseado somente na URL, nunca em dados sensíveis.
  // Sugestões preenchem o campo, mas não enviam mensagens sem gesto da pessoa.
  function renderPageContext() {
    const guide = window.NexoAgent && typeof window.NexoAgent.contextForPage === "function"
      ? window.NexoAgent.contextForPage(window.location.pathname)
      : null;
    if (!guide) return;
    if (contextTitle) contextTitle.textContent = guide.title;
    if (contextSuggestion) contextSuggestion.textContent = guide.suggestion;
    if (contextAlert) contextAlert.textContent = "Aviso do laboratório: " + guide.alert;
    if (contextSource) contextSource.textContent = guide.source + " · não é alerta em tempo real";
    suggestedPrompts.forEach((button, index) => {
      if (button) button.textContent = guide.prompts[index] || "Como usar esta página?";
    });
  }
  suggestedPrompts.forEach(button => {
    if (!button) return;
    button.addEventListener("click", () => {
      if (chatInput.disabled) return;
      chatInput.value = button.textContent;
      chatInput.focus();
      showEmotion("dica");
    });
  });
  renderPageContext();

  // Um unico personagem base e cinco expressões vetoriais, sem dependencias.
  const emotions = Object.freeze({
    normal: "assets/nexo-robo.svg?v=20261019-v3",
    saudacao: "assets/nexo-robo-saudacao.svg?v=20261019-v2",
    pensando: "assets/nexo-robo-pensando.svg?v=20261019-v2",
    respondendo: "assets/nexo-robo-respondendo.svg?v=20261019-v2",
    confirmacao: "assets/nexo-robo-confirmacao.svg?v=20261019-v2",
    dica: "assets/nexo-robo-dica.svg?v=20261019-v2"
  });

  function showEmotion(name) {
    if (!Object.prototype.hasOwnProperty.call(emotions, name)) return;
    host.dataset.nexoEmotion = name;
    launcherRobot.src = emotions[name];
    panelRobot.src = emotions[name];
  }

  function showFeedback(message) {
    feedback.textContent = message;
    feedback.hidden = !message;
  }

  // Ajuda contextual publicamente verificavel; nunca acessa dados do usuario.
  function tipForPage() {
    const pathname = (window.location.pathname || "/").split("/").pop();
    const tips = {
      "gestao-a-vista.html": "Na Gestão à Vista, escolha a competência antes de comparar Impressões. Outubro ainda está sem leitura confirmada.",
      "impressao.html": "Em Impressões, confirme a competência e a origem dos dados antes de comparar o consumo com a franquia.",
      "esg.html": "Na área ESG, consulte as explicações dos indicadores de impressões antes de interpretar resultados.",
      "gestao-documental.html": "Em Gestão Documental, confira o estágio da integração Perseus antes de tentar enviar arquivos.",
      "automacoes.html": "A Central de Automações reúne ferramentas em diferentes estágios. Confira a descrição antes de abrir cada módulo."
    };
    return tips[pathname] || "Na home, acesse a Biblioteca de Aplicativos para abrir sistemas ou role até Destaques para ver os banners demonstrativos.";
  }

  // Cada pergunta aciona uma decisao local verificavel e no maximo uma
  // sugestao de navegacao. Nenhum texto digitado e enviado a um servidor.
  function appendChatMessage(text, side, suggestedAction = null, source = null) {
    const item = document.createElement("div");
    item.className = "nexo-chat-message nexo-chat-message-" + side;
    const content = document.createElement("p");
    content.textContent = text;
    item.append(content);
    if (source && side === "assistant") {
      const provenance = document.createElement("small");
      provenance.textContent = source;
      item.append(provenance);
    }
    if (suggestedAction && typeof suggestedAction.href === "string" && typeof suggestedAction.label === "string") {
      const action = document.createElement("a");
      action.href = suggestedAction.href;
      action.className = "nexo-chat-link";
      action.textContent = suggestedAction.label + " →";
      item.append(action);
    }
    chatLog.append(item);
    // Evita uma conversa infinita em memoria. Nao armazenamos historico.
    while (chatLog.children.length > 12) chatLog.firstElementChild.remove();
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  chatForm.addEventListener("submit", async event => {
    event.preventDefault();
    const question = chatInput.value.trim();
    if (!question) return;
    appendChatMessage(question, "user");
    chatInput.value = "";
    const agent = window.NexoAgent;
    // Consultas locais verificadas são instantâneas, mesmo com IA ativada.
    // Perguntas abertas seguem para o modelo apenas sob opt-in.
    if (agent && typeof agent.fastAnswer === "function") {
      const quick = agent.fastAnswer(question, { pathname: window.location.pathname });
      if (quick) {
        appendChatMessage(quick.answer, "assistant", quick.action, quick.source);
        showFeedback("Orientação local do protótipo · sem consulta à IA.");
        showEmotion("respondendo");
        chatInput.focus();
        return;
      }
    }
    if (labEnabled && isLocalPortal) {
      // Opt-in explícito: NUNCA enviar mensagem pela rede sem ativação manual.
      // Endpoint fixo, estritamente loopback. Não enviar cookies nem credenciais.
      chatInput.disabled = true;
      if (chatSubmit) chatSubmit.disabled = true;
      if (labToggle) labToggle.disabled = true;
      showFeedback("Nexo está consultando as ferramentas do laboratório…");
      showEmotion("pensando");
      try {
        const result = await fetch(NEXO_LOCAL_URL, {
          method: "POST",
          mode: "cors", credentials: "omit", cache: "no-store", referrerPolicy: "no-referrer",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pergunta: question })
        });
        const data = await result.json();
        if (!result.ok) throw new Error(data.erro || "Ponte local indisponível");
        if (data.modo !== "laboratorio_local" || data.dados_reais !== false || typeof data.resposta !== "string") {
          throw new Error("Resposta da ponte local não foi reconhecida.");
        }
        const source = (Array.isArray(data.fontes) ? data.fontes : []).join(" · ");
        const usedTools = Array.isArray(data.ferramentas) && data.ferramentas.length > 0;
        const modelAnswer = data.resposta.trim();
        // A ponte pode funcionar e o modelo responder so "Indisponível.".
        // Nao confundir uma resposta inconclusiva do LLM com desconexao.
        // So sinalizar falha de conversa quando NAO houve fonte/ferramenta factual.
        if (!source && !usedTools && /^(?:indispon[ií]vel|sem resposta(?: do modelo)?|n[aã]o sei)[.!?\s]*$/i.test(modelAnswer)) {
          appendChatMessage(
            "A conexão local respondeu, mas o modelo não conseguiu elaborar uma resposta útil. " +
            "Isso não significa que o Nexo está desconectado. Tente reformular a pergunta; " +
            "se continuar acontecendo, precisamos ajustar o modelo Qwen do laboratório.",
            "assistant", null, "Diagnóstico local · resposta inconclusiva da IA"
          );
          showFeedback("A ponte local está ativa; o modelo retornou uma resposta inconclusiva.");
          showEmotion("dica");
        } else {
          appendChatMessage(modelAnswer || "O modelo local não retornou texto. Tente novamente.", "assistant", null,
            "Laboratório demonstrativo" + (source ? " · " + source : "") +
            (typeof data.duracao_s === "number" ? " · " + data.duracao_s.toFixed(1) + " s" : ""));
          showFeedback(modelAnswer
            ? "Resposta recebida do laboratório local. Fontes e limites indicados abaixo da resposta."
            : "A ponte local está ativa, mas o modelo retornou uma resposta vazia.");
          showEmotion(modelAnswer ? "respondendo" : "dica");
        }
      } catch (_error) {
        appendChatMessage("O serviço experimental de IA local não está disponível. O Nexo continua funcionando como guia do Portal sem essa ponte. Para testar a IA, inicie servidor_nexo.py em outro terminal na pasta laboratorio/nexo-local; não envie dados reais.", "assistant");
        showFeedback("Ponte de IA local indisponível; o modo de regras continua acessível.");
        showEmotion("dica");
      } finally {
        chatInput.disabled = false;
        if (chatSubmit) chatSubmit.disabled = false;
        if (labToggle) labToggle.disabled = false;
        chatInput.focus();
      }
      return;
    }
    const response = agent && typeof agent.ask === "function"
      ? agent.ask(question, { pathname: window.location.pathname })
      : { answer: "O modo de perguntas ainda não carregou. Atualize a página e tente novamente.", action: null, source: null };
    appendChatMessage(response.answer, "assistant", response.action, response.source);
    showEmotion("respondendo");
    chatInput.focus();
  });

  const NEXO_PANEL_KEY = "unh-nexo-panel-open";
  function savePanelState(open) {
    try { window.sessionStorage.setItem(NEXO_PANEL_KEY, open ? "1" : "0"); } catch (_error) { /* Navegacao funciona mesmo sem armazenamento. */ }
  }
  function setOpen(open, restore = false) {
    panel.hidden = !open;
    if (!restore) savePanelState(open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label",
      open ? "Fechar Nexo, assistente de navegação do Portal UNH"
           : "Abrir Nexo, assistente de navegação do Portal UNH");
    showFeedback("");
    showEmotion(open ? "saudacao" : "normal");
    if (open) {
      renderPageContext();
      if (!restore) close.focus();
    } else if (!restore) toggle.focus();
  }

  toggle.addEventListener("click", () => setOpen(panel.hidden));
  close.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !panel.hidden) setOpen(false);
  });
  explain.addEventListener("click", () => {
    const open = answer.hidden;
    answer.hidden = !open;
    explain.setAttribute("aria-expanded", String(open));
    showEmotion(open ? "respondendo" : "saudacao");
  });
  tipButton.addEventListener("click", () => {
    showFeedback(tipForPage());
    showEmotion("dica");
  });
  copyButton.addEventListener("click", async () => {
    // "Pensando" aparece somente durante uma operacao assincrona verdadeira.
    const clipboard = navigator.clipboard;
    if (!clipboard || typeof clipboard.writeText !== "function") {
      showFeedback("Cópia automática indisponível. Use Ctrl+L e Ctrl+C para copiar o endereço.");
      showEmotion("respondendo");
      return;
    }
    copyButton.disabled = true;
    showEmotion("pensando");
    showFeedback("Copiando o endereço desta página…");
    try {
      await clipboard.writeText(window.location.href);
      showFeedback("Endereço desta página copiado.");
      showEmotion("confirmacao");
    } catch (_error) {
      showFeedback("Não foi possível copiar. Use Ctrl+L e Ctrl+C no navegador.");
      showEmotion("respondendo");
    } finally {
      copyButton.disabled = false;
    }
  });
  showEmotion("normal");
  // Mantem Nexo aberto ao mudar de pagina, se a pessoa o deixou aberto.
  // Apenas uma flag da aba e persistida; nenhuma pergunta ou conversa e armazenada.
  let wasOpen = false;
  try { wasOpen = window.sessionStorage.getItem(NEXO_PANEL_KEY) === "1"; } catch (_error) { /* storage opcional */ }
  if (wasOpen) setOpen(true, true);
})();
