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
          <span class="nexo-panel-avatar"><img src="assets/nexo-robo.svg" alt="" width="43" height="49"></span>
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
        <p class="nexo-disclaimer">Versão inicial de navegação · IA não conectada</p>
      </div>
    </aside>
    <button id="nexo-toggle" class="nexo-launcher" type="button"
        aria-controls="nexo-panel" aria-expanded="false" aria-label="Abrir Nexo, assistente de navegação do Portal UNH">
      <img src="assets/nexo-robo.svg" width="91" height="104" alt="" class="nexo-launcher-avatar">
      <span class="nexo-launcher-label">Posso ajudar?</span>
    </button>`;
  document.body.append(host);

  const toggle = document.getElementById("nexo-toggle");
  const panel = document.getElementById("nexo-panel");
  const close = document.getElementById("nexo-close");
  const explain = document.getElementById("nexo-explain");
  const answer = document.getElementById("nexo-help-answer");

  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label",
      open ? "Fechar Nexo, assistente de navegação do Portal UNH"
           : "Abrir Nexo, assistente de navegação do Portal UNH");
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
  });
})();
