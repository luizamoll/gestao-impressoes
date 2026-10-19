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

  // Uma unica selecao de competencia alimenta a Visao geral e Impressões.
  // Historico demonstrativo fixo do projeto; nao e leitura ao vivo.
  const select = document.getElementById("gvPeriod");
  const overviewSelect = document.getElementById("gvOverviewPeriod");
  const refPeriod = document.getElementById("gvRefPeriod");
  if (!select) return;
  const data = {
    "2026-08": {
      pages: 1016, deltaPages: null,
      consumed: "1.016", note: "Impressões em agosto", remaining: "2.984",
      remainingNote: "Após o consumo do mês", delta: "—",
      deltaNote: "Sem mês anterior comparável",
      insight: "Agosto registra 1.016 impressões, ou 25,4% da franquia. Sem histórico anterior confirmado para comparar.",
      status: "neutral", symbol: "●",
      overviewNote: "Agosto/2026 · histórico do projeto, ainda sem sincronização automática.",
      overviewConsumedNote: "Impressões em agosto/2026"
    },
    "2026-09": {
      pages: 1522, deltaPages: 506,
      consumed: "1.522", note: "Impressões em setembro", remaining: "2.478",
      remainingNote: "Após o consumo do mês", delta: "+506",
      deltaNote: "+49,8% versus agosto",
      insight: "De agosto para setembro, o consumo aumentou 506 impressões (+49,8%). Vale acompanhar essa variação.",
      status: "bad", symbol: "↗",
      overviewNote: "Setembro/2026 · histórico do projeto, ainda sem sincronização automática.",
      overviewConsumedNote: "Impressões em setembro/2026"
    },
    "2026-10": {
      pages: null, deltaPages: null,
      consumed: "—", note: "Consumo ainda não apurado", remaining: "—",
      remainingNote: "Saldo depende da leitura atual", delta: "—",
      deltaNote: "Sem comparação disponível",
      insight: "Outubro é uma competência nova, mas não há leitura suficiente para determinar consumo. Ausência de registro não significa zero impressões.",
      status: "neutral", symbol: "○",
      overviewNote: "Outubro/2026 · leitura não apurada. Consumo desconhecido, não zero.",
      overviewConsumedNote: "Outubro/2026 · sem leitura confirmada"
    }
  };

  const monthlyAllowance = 4000;

  // Historico: valores confirmados sao numeros; ausencia de leitura e null,
  // nunca zero. O mesmo conjunto alimenta KPI, barras, CSV e impressao.
  function updateUsage(prefix, period, pages) {
    const percent = pages === null ? null : Math.round((pages / monthlyAllowance) * 1000) / 10;
    const fraction = pages === null ? null : (pages / monthlyAllowance) * 100;
    const usage = document.getElementById(prefix + "Usage");
    const track = document.getElementById(prefix + "UsageTrack");
    const fill = document.getElementById(prefix + "UsageFill");
    const note = document.getElementById(prefix + "UsageNote");
    if (usage) usage.textContent = percent === null ? "—" : String(percent).replace(".", ",") + "%";
    if (fill) fill.style.width = fraction === null ? "0%" : Math.min(fraction, 100).toFixed(2) + "%";
    if (track) {
      track.classList.toggle("gv-usage-unavailable", percent === null);
      if (percent === null) {
        track.removeAttribute("aria-valuenow");
        track.setAttribute("aria-valuetext", "Sem leitura apurada: consumo desconhecido");
      } else {
        track.setAttribute("aria-valuenow", String(Math.min(percent,100)));
        track.setAttribute("aria-valuetext", String(percent).replace(".", ",") + "% da franquia mensal");
      }
    }
    if (note) note.textContent = pages === null
      ? "Outubro/2026 · leitura não apurada; não é zero"
      : (period === "2026-08" ? "Agosto/2026" : "Setembro/2026") + " · competência apurada";
  }

  const barButtons = [...document.querySelectorAll("[data-gv-period-target]")];

  function render(period) {
    const d = Object.prototype.hasOwnProperty.call(data, period) ? data[period] : null;
    if (!d) return;

    // Os dois seletores permanecem sincronizados mesmo ao mudar de modulo.
    select.value = period;
    if (overviewSelect) overviewSelect.value = period;
    if (refPeriod) refPeriod.value = period;
    const refConsumed = document.getElementById("gvRefConsumed");
    const refMonth = document.getElementById("gvRefConsumedMonth");
    const refVariation = document.getElementById("gvRefVariation");
    const refVariationNote = document.getElementById("gvRefVariationNote");
    if (refConsumed) refConsumed.textContent = d.consumed;
    if (refMonth) refMonth.textContent = d.overviewConsumedNote;
    if (refVariation) refVariation.textContent = period === "2026-09" ? "+49,8%" : "—";
    if (refVariationNote) refVariationNote.textContent = period === "2026-09"
      ? "Comparado a agosto/2026"
      : (period === "2026-10" ? "Ainda não há comparação" : "Sem mês anterior apurado");


    const byId = id => document.getElementById(id);
    byId("gvConsumed").textContent = d.consumed;
    byId("gvConsumedNote").textContent = d.note;
    byId("gvRemaining").textContent = d.remaining;
    byId("gvRemainingNote").textContent = d.remainingNote;
    byId("gvDelta").textContent = d.delta;
    byId("gvDeltaNote").textContent = d.deltaNote;
    byId("gvInsightText").textContent = d.insight;
    byId("gvInsightIcon").textContent = d.symbol;
    byId("gvInsight").classList.toggle("gv-insight-neutral", d.status === "neutral");
    byId("gvTrend").classList.toggle("gv-trend-bad", d.status === "bad");
    document.querySelectorAll(".gv-bar-row").forEach(row => {
      row.classList.toggle("gv-bar-selected", row.dataset.period === period);
    });
    barButtons.forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.gvPeriodTarget === period));
    });
    updateUsage("gvOverview", period, d.pages);
    updateUsage("gvDetail", period, d.pages);
    const overviewRemaining = byId("gvOverviewRemaining");
    const overviewDelta = byId("gvOverviewDelta");
    if (overviewRemaining) overviewRemaining.textContent = d.remaining;
    if (overviewDelta) overviewDelta.textContent = d.delta;

    // Na ausencia de backend, valores indisponiveis jamais viram zeros.
    if (overviewSelect) {
      byId("gvOverviewConsumed").textContent = d.consumed;
      byId("gvOverviewConsumedNote").textContent = d.overviewConsumedNote;
      byId("gvOverviewDataNote").textContent = d.overviewNote;
    }
  }

  select.addEventListener("change", () => render(select.value));
  overviewSelect?.addEventListener("change", () => render(overviewSelect.value));
  refPeriod?.addEventListener("change", () => render(refPeriod.value));
  barButtons.forEach(button => button.addEventListener("click", () => {
    const period = button.dataset.gvPeriodTarget;
    if (Object.prototype.hasOwnProperty.call(data, period)) render(period);
  }));

  // Exporta apenas historico fixo, explicitamente identificado como nao sincronizado.
  // CSV com separador ';' e BOM UTF-8 para Excel em pt-BR.
  function exportCsv() {
    const rows = [
      ["competencia","situacao","impressoes","franquia_mensal","saldo","uso_percentual","variacao_absoluta","fonte"],
      ...Object.entries(data).map(([period, d]) => [
        period,
        d.pages === null ? "nao_apurado" : "historico",
        d.pages === null ? "" : d.pages,
        monthlyAllowance,
        d.pages === null ? "" : monthlyAllowance - d.pages,
        d.pages === null ? "" : String(Math.round(d.pages / monthlyAllowance * 1000) / 10).replace(".", ","),
        d.deltaPages === null ? "" : d.deltaPages,
        "Historico demonstrativo do projeto; sem sincronizacao automatica"
      ])
    ];
    const quote = value => '"' + String(value).replace(/"/g, '""') + '"';
    const csv = "\uFEFF" + rows.map(row => row.map(quote).join(";")).join("\r\n") + "\r\n";
    const blob = new Blob([csv], {type: "text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "portal-unh-historico-impressoes-2026.csv";
    link.hidden = true;
    document.body.appendChild(link);
    try { link.click(); }
    finally { link.remove(); URL.revokeObjectURL(url); }
  }

  document.getElementById("gvDownloadCsv")?.addEventListener("click", exportCsv);
  document.getElementById("gvPrintReport")?.addEventListener("click", () => window.print());

  render(select.value);
})();
