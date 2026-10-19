"use strict";

/**
 * Nexo - orientador de navegacao do Portal UNH.
 * Modo padrão: regras, sem rede. Modo IA opcional SOMENTE em localhost
 * através de ponte Python de laboratório, sem dados/contas institucionais.
 * Nenhum armazenamento, cookie ou integração institucional.
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
            <span>Agente experimental do Portal</span>
          </div>
        </div>
        <button type="button" id="nexo-close" class="nexo-close" aria-label="Fechar assistente">×</button>
      </div>
      <div class="nexo-panel-body">
        <p class="nexo-intro"><strong>Olá! Posso ajudar?</strong> Sou o guia de navegação do Portal UNH. Encontre rapidamente os recursos que você precisa.</p>
        <button type="button" id="nexo-lab-toggle" class="nexo-lab-toggle" aria-pressed="false" hidden>Ativar IA local (laboratório)</button>
        <form id="nexo-chat-form" class="nexo-chat-form" aria-label="Converse com o Nexo">
          <label for="nexo-chat-input">Pergunte ao Nexo</label>
          <div class="nexo-chat-entry">
            <input id="nexo-chat-input" name="pergunta" type="text" autocomplete="off"
                   maxlength="280" placeholder="Ex.: Como foi setembro nas Impressões?" required>
            <button type="submit" id="nexo-chat-submit" aria-label="Enviar pergunta ao Nexo">Enviar</button>
          </div>
        </form>
        <div id="nexo-chat-log" class="nexo-chat-log" role="log" aria-label="Conversa temporária com o Nexo" aria-live="polite" aria-relevant="additions text"></div>
        <p class="nexo-chat-disclosure">Respostas orientadas por regras e dados históricos de laboratório. Sem IA generativa nesta fase.</p>
        <p class="nexo-section-heading">Ou escolha um atalho</p>
        <nav class="nexo-links" aria-label="Atalhos do assistente">
          <a href="index.html#comunicados"><span aria-hidden="true">▤</span><span>Mural de comunicados</span><span aria-hidden="true">→</span></a>
          <a href="index.html#ferramentas"><span aria-hidden="true">▦</span><span>Ferramentas do Portal</span><span aria-hidden="true">→</span></a>
          <a href="gestao-a-vista.html"><span aria-hidden="true">▥</span><span>Gestão à Vista</span><span aria-hidden="true">→</span></a>
          <a href="impressao.html"><span aria-hidden="true">▣</span><span>Gestão de Impressões</span><span aria-hidden="true">→</span></a>
          <a href="automacoes.html"><span aria-hidden="true">⌘</span><span>Central de Automações</span><span aria-hidden="true">→</span></a>
        </nav>
        <div class="nexo-help-area">
          <button type="button" id="nexo-explain" class="nexo-explain" aria-controls="nexo-help-answer" aria-expanded="false">O que você consegue fazer agora? <span aria-hidden="true">⌄</span></button>
          <p id="nexo-help-answer" class="nexo-help-answer" hidden>Por enquanto, eu ajudo a navegar pelo Portal. Ainda não converso com uma IA, não acesso dados de alunos ou projetos e não consulto sistemas institucionais.</p>
        </div>
        <div class="nexo-quick-actions" aria-label="Ajuda do Nexo">
          <button type="button" id="nexo-tip" class="nexo-action" aria-describedby="nexo-tip-description">Dica desta página <span aria-hidden="true">✦</span></button>
          <button type="button" id="nexo-copy" class="nexo-action">Copiar endereço <span aria-hidden="true">↗</span></button>
        </div>
        <p id="nexo-tip-description" class="nexo-visually-hidden">Mostra uma dica local, sem consultar IA nem dados institucionais.</p>
        <p id="nexo-feedback" class="nexo-feedback" role="status" aria-live="polite" hidden></p>
        <p class="nexo-disclaimer">Agente local experimental · IA não conectada</p>
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
  const NEXO_LOCAL_URL = "http://127.0.0.1:18767/chat";
  // IA somente no mesmo computador, via servidor local iniciado pela usuária.
  const isLocalPortal = /^http:\/\/(?:127\.0\.0\.1|localhost):(?:18081|8080)(?:\/|$)/.test(String(window.location.href));
  let labEnabled = false;
  if (isLocalPortal && labToggle) {
    labToggle.hidden = false;
    labToggle.addEventListener("click", () => {
      labEnabled = !labEnabled;
      labToggle.setAttribute("aria-pressed", String(labEnabled));
      labToggle.textContent = labEnabled ? "Voltar ao modo de regras" : "Ativar IA local (laboratório)";
      if (disclosure) disclosure.textContent = labEnabled
        ? "IA local experimental. Apenas dados demonstrativos; não envie dados pessoais, senhas ou relatórios reais."
        : "Respostas orientadas por regras e dados históricos de laboratório. Sem IA generativa nesta fase.";
      if (disclaimer) disclaimer.textContent = labEnabled
        ? "IA local ativada manualmente · dados demonstrativos · não institucional"
        : "Agente local experimental · IA não conectada";
      if (helpAnswer) helpAnswer.textContent = labEnabled
        ? "Neste modo de laboratório, consulto ferramentas demonstrativas via Python e Qwen local. Não acesso sistemas ou registros institucionais."
        : "Por enquanto, eu ajudo a navegar pelo Portal. Ainda não converso com uma IA, não acesso dados de alunos ou projetos e não consulto sistemas institucionais.";
      showFeedback(labEnabled ? "Modo IA local: inicie servidor_nexo.py em outro PowerShell. Nenhum dado real deve ser enviado." : "Modo de regras ativado; nenhuma chamada à IA.");
      showEmotion(labEnabled ? "confirmacao" : "normal");
    });
  }


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
    return tips[pathname] || "Na página inicial do Portal, os comunicados aparecem antes do catálogo de ferramentas.";
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
        appendChatMessage(data.resposta, "assistant", null,
          "Laboratório demonstrativo" + (source ? " · " + source : "") +
          (typeof data.duracao_s === "number" ? " · " + data.duracao_s.toFixed(1) + " s" : ""));
        showFeedback("Resposta recebida do laboratório local. Fontes e limites indicados abaixo da resposta.");
        showEmotion("respondendo");
      } catch (_error) {
        appendChatMessage("Não consegui acessar o Nexo local. Inicie o arquivo servidor_nexo.py na pasta laboratorio/nexo-local e confirme que o Portal está aberto em localhost:18081 ou 127.0.0.1:18081. Não enviei a pergunta a serviços externos.", "assistant");
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
    const agent = window.NexoAgent;
    const response = agent && typeof agent.ask === "function"
      ? agent.ask(question, { pathname: window.location.pathname })
      : { answer: "O modo de perguntas ainda não carregou. Atualize a página e tente novamente.", action: null, source: null };
    appendChatMessage(response.answer, "assistant", response.action, response.source);
    showEmotion("respondendo");
    chatInput.focus();
  });

  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label",
      open ? "Fechar Nexo, assistente de navegação do Portal UNH"
           : "Abrir Nexo, assistente de navegação do Portal UNH");
    showFeedback("");
    showEmotion(open ? "saudacao" : "normal");
    if (open) close.focus();
    else toggle.focus();
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
})();
