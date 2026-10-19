"use strict";
/* Busca e layout locais da Gestao a Vista. Sem dados institucionais, rede ou storage. */
(() => {
  const menu = document.getElementById("gvRefMenuToggle");
  const sidebar = document.getElementById("gvRefSidebar");
  const search = document.getElementById("gvRefSearch");
  const results = document.getElementById("gvRefSearchResults");
  const help = document.getElementById("gvRefHelp");
  if (!menu || !sidebar || !search || !results) return;

  const destinations = Object.freeze([
    { label: "Página inicial", terms: "home inicio portal", href: "index.html" },
    { label: "Visão geral", terms: "resumo dashboard painel", href: "#gv-visao-geral" },
    { label: "Projetos", terms: "vikunja equipes projeto", href: "#gv-projetos" },
    { label: "Indicadores", terms: "prazos tarefas métricas", href: "#gv-indicadores" },
    { label: "Impressões", terms: "historico consumo franquia relatorio meses", href: "#impressoes" },
    { label: "Mural institucional", terms: "comunicados avisos mensagens", href: "index.html#comunicados" },
    { label: "Ferramentas do Portal", terms: "catalogo aplicativos", href: "index.html#ferramentas" },
    { label: "Central de Automações", terms: "n8n automacoes rotinas", href: "automacoes.html" },
    { label: "Gestão Documental", terms: "pdf perseus documentos", href: "gestao-documental.html" },
    { label: "Gestão de Impressões", terms: "equipamentos leitura serie impressora upload", href: "impressao.html" }
  ]);

  function normalize(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR").trim();
  }
  function closeSearch() {
    results.hidden = true;
    search.setAttribute("aria-expanded", "false");
  }
  function matching(query) {
    const key = normalize(query);
    return key ? destinations.filter(item =>
      normalize(item.label + " " + item.terms).includes(key)) : [];
  }
  function showSearch() {
    const options = matching(search.value);
    results.replaceChildren();
    if (!search.value.trim()) return closeSearch();
    if (!options.length) {
      const info = document.createElement("p");
      info.className = "gv-ref-search-empty";
      info.textContent = "Nenhuma área encontrada. Tente outra palavra.";
      results.append(info);
    } else {
      for (const item of options) {
        const link = document.createElement("a");
        link.href = item.href;
        link.textContent = item.label;
        link.addEventListener("click", closeSearch);
        results.append(link);
      }
    }
    results.hidden = false;
    search.setAttribute("aria-expanded", "true");
  }
  search.addEventListener("input", showSearch);
  search.addEventListener("keydown", event => {
    if (event.key === "Escape") closeSearch();
    if (event.key === "Enter") {
      const first = matching(search.value)[0];
      if (!first) return;
      event.preventDefault();
      closeSearch();
      window.location.assign(first.href);
    }
  });

  function closeMenu() {
    document.body.classList.remove("gv-ref-menu-open");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Abrir menu lateral");
  }
  menu.addEventListener("click", () => {
    const opening = !document.body.classList.contains("gv-ref-menu-open");
    document.body.classList.toggle("gv-ref-menu-open", opening);
    menu.setAttribute("aria-expanded", String(opening));
    menu.setAttribute("aria-label", opening ? "Fechar menu lateral" : "Abrir menu lateral");
  });
  sidebar.querySelectorAll("a").forEach(a=>a.addEventListener("click",closeMenu));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closeMenu(); closeSearch(); }
  });
  document.addEventListener("click", e => {
    if (!sidebar.contains(e.target) && !menu.contains(e.target)) closeMenu();
    if (!results.contains(e.target) && e.target !== search) closeSearch();
  });

  // O Nexo existente continua respondendo com regras locais: aqui apenas
  // o encaixamos no painel lateral da tela larga, sem novas credenciais.
  const widget = document.getElementById("nexo-widget");
  const panel = document.getElementById("nexo-panel");
  const toggle = document.getElementById("nexo-toggle");
  const dockMedia = typeof window.matchMedia === "function"
    ? window.matchMedia("(min-width: 1251px)") : null;
  let openedByDashboard = false;

  function updateDock() {
    if (!widget || !panel || !toggle || !dockMedia) return;
    const desktop = dockMedia.matches;
    if (desktop && panel.hidden) {
      panel.hidden = false;
      toggle.setAttribute("aria-expanded","true");
      toggle.setAttribute("aria-label","Fechar Nexo, assistente de navegação do Portal UNH");
      openedByDashboard = true;
    } else if (!desktop && openedByDashboard && !panel.hidden) {
      // Na tela pequena, preservar comportamento do widget flutuante.
      toggle.click();
      openedByDashboard = false;
    }
  }
  if (dockMedia) {
    updateDock();
    dockMedia.addEventListener?.("change", updateDock);
  }
  help?.addEventListener("click", () => {
    if (!panel || !toggle) return;
    if (panel.hidden) toggle.click();
    const input = document.getElementById("nexo-chat-input");
    input?.focus();
  });
})();
