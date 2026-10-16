"use strict";

/**
 * Nexo - orientador de navegacao do Portal UNH.
 * Sem API, sem modelo de IA, sem coleta de mensagens, sem armazenamento ou cookies.
 * O widget oferece somente conteudo local, estatico e atalhos reais.
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
          <span class="nexo-panel-avatar"><img id="nexo-panel-robot" src="assets/nexo-robo.svg?v=20261016-v2" alt="" width="43" height="49"></span>
          <div>
            <strong id="nexo-title">Nexo</strong>
            <span>Assistente do Portal UNH</span>
          </div>
        </div>
        <button type="button" id="nexo-close" class="nexo-close" aria-label="Fechar assistente">×</button>
      </div>
      <div class="nexo-panel-body">
        <p class="nexo-intro"><strong>Olá! Posso ajudar?</strong> Sou o guia de navegação do Portal UNH. Encontre rapidamente os recursos que você precisa.</p>
        <p class="nexo-section-heading">Onde você quer ir?</p>
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
        <p class="nexo-disclaimer">Orientação local · IA não conectada</p>
      </div>
    </aside>
    <button id="nexo-toggle" class="nexo-launcher" type="button"
        aria-controls="nexo-panel" aria-expanded="false" aria-label="Abrir Nexo, assistente de navegação do Portal UNH">
      <img id="nexo-robot" src="assets/nexo-robo.svg?v=20261016-v2" width="91" height="104" alt="" class="nexo-launcher-avatar">
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

  // Um unico personagem base e cinco expressões vetoriais, sem dependencias.
  const emotions = Object.freeze({
    normal: "assets/nexo-robo.svg?v=20261016-v2",
    saudacao: "assets/nexo-robo-saudacao.svg?v=20261016-v1",
    pensando: "assets/nexo-robo-pensando.svg?v=20261016-v1",
    respondendo: "assets/nexo-robo-respondendo.svg?v=20261016-v1",
    confirmacao: "assets/nexo-robo-confirmacao.svg?v=20261016-v1",
    dica: "assets/nexo-robo-dica.svg?v=20261016-v1"
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
