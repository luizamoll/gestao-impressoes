"use strict";
// Protótipo com dados históricos fixos. Não consultar API nem apresentar tempo real.
(() => {
  // A tela pergunta ao backend apenas se o conector foi liberado.
  // Nenhum dado de tarefas vem do navegador ou de tokens client-side.
  async function checkConnector() {
    const status = document.getElementById("gvConnectorStatus");
    const label = document.getElementById("gvConnectorText");
    if (!status || !label) return;
    try {
      const response = await fetch("/api/gestao-a-vista/status", {
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Accept": "application/json" }
      });
      if (!response.ok || !(response.headers.get("content-type") || "").includes("application/json")) {
        throw new Error("Estado da integracao indisponivel");
      }
      const data = await response.json();
      if (data.conectado === false && data.estado === "aguardando_autorizacao") {
        status.dataset.connection = "pending";
        label.textContent = "Vikunja não conectado";
      } else {
        // Nao declarar uma conexao como ativa sem integracao realmente implantada.
        status.dataset.connection = "unavailable";
        label.textContent = "Estado da integração não confirmado";
      }
    } catch (_error) {
      status.dataset.connection = "unavailable";
      label.textContent = "Não foi possível verificar a integração";
    }
  }
  void checkConnector();

  // Navegacao entre modulos: URLs com hash funcionam inclusive via voltar/avancar.
  // Sem JavaScript as secoes continuam visiveis, evitando links mortos.
  const workspace = document.getElementById("gv-painel");
  const links = [...document.querySelectorAll("[data-gv-nav]")];
  const views = [...document.querySelectorAll("[data-gv-view]")];
  const viewFor = {
    "gv-visao-geral": "gv-visao-geral",
    "gv-projetos": "gv-projetos",
    "gv-indicadores": "gv-indicadores",
    "impressoes": "gv-impressao-view"
  };
  let currentView = null;

  function syncNavigation(scrollIntoView = false) {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    const key = Object.prototype.hasOwnProperty.call(viewFor, hash) ? hash : "gv-visao-geral";
    const targetId = viewFor[key];
    const changed = currentView !== targetId;

    views.forEach(view => { view.hidden = view.id !== targetId; });
    links.forEach(link => {
      const selected = link.dataset.gvNav === key;
      link.classList.toggle("gv-workspace-menu-current", selected);
      if (selected) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    workspace.dataset.gvReady = "true";
    currentView = targetId;
    if (scrollIntoView && changed) workspace.scrollIntoView({ block: "start", behavior: "instant" });
  }

  if (workspace && links.length === 4 && views.length === 4) {
    // Links que apontam para o modulo historico tambem ativam sua visualizacao.
    window.addEventListener("hashchange", () => syncNavigation(true));
    links.forEach(link => link.addEventListener("click", () => {
      if (window.location.hash === link.getAttribute("href")) syncNavigation(true);
    }));
    syncNavigation(false);
  }

 const select=document.getElementById("gvPeriod");
 if(!select)return;
 const data={
  "2026-08":{
    consumed:"1.016",note:"Impressões em agosto",remaining:"2.984",remainingNote:"Após o consumo do mês",
    delta:"—",deltaNote:"Sem mês anterior comparável",
    insight:"Agosto registra 1.016 impressões, ou 25,4% da franquia. Sem histórico anterior confirmado para comparar.",status:"neutral",symbol:"●"
  },
  "2026-09":{
    consumed:"1.522",note:"Impressões em setembro",remaining:"2.478",remainingNote:"Após o consumo do mês",
    delta:"+506",deltaNote:"+49,8% versus agosto",
    insight:"De agosto para setembro, o consumo aumentou 506 impressões (+49,8%). Vale acompanhar essa variação.",status:"bad",symbol:"↗"
  },
  "2026-10":{
    consumed:"—",note:"Consumo ainda não apurado",remaining:"—",remainingNote:"Saldo depende da leitura atual",
    delta:"—",deltaNote:"Sem comparação disponível",
    insight:"Outubro é uma competência nova, mas não há leitura suficiente para determinar consumo. Ausência de registro não significa zero impressões.",status:"neutral",symbol:"○"
  }
 };
 function render(){
  const d=data[select.value];if(!d)return;
  document.getElementById("gvConsumed").textContent=d.consumed;
  document.getElementById("gvConsumedNote").textContent=d.note;
  document.getElementById("gvRemaining").textContent=d.remaining;
  document.getElementById("gvRemainingNote").textContent=d.remainingNote;
  document.getElementById("gvDelta").textContent=d.delta;
  document.getElementById("gvDeltaNote").textContent=d.deltaNote;
  document.getElementById("gvInsightText").textContent=d.insight;
  document.getElementById("gvInsightIcon").textContent=d.symbol;
  document.getElementById("gvInsight").classList.toggle("gv-insight-neutral",d.status==="neutral");
  document.getElementById("gvTrend").classList.toggle("gv-trend-bad",d.status==="bad");
  document.querySelectorAll(".gv-bar-row").forEach(row=>row.classList.toggle("gv-bar-selected",row.dataset.period===select.value));
 }
 select.addEventListener("change",render);render();
})();
