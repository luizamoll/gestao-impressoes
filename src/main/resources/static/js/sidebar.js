"use strict";
// Navegacao unica de Gestao de Impressoes e ESG.
// Abre/fecha com teclado, toque e clique no fundo; nao altera dados.
(() => {
  const side = document.getElementById("sidebar");
  const trigger = document.getElementById("menuButton");
  const scrim = document.getElementById("sidebarScrim");
  if (!side || !trigger || !scrim) return;

  const close = () => {
    side.classList.remove("open");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", "Abrir navegação");
    document.body.classList.remove("sidebar-open");
    scrim.hidden = true;
  };
  window.closePortalSidebar = close;

  const open = () => {
    side.classList.add("open");
    trigger.setAttribute("aria-expanded", "true");
    trigger.setAttribute("aria-label", "Fechar navegação");
    document.body.classList.add("sidebar-open");
    scrim.hidden = false;
  };

  trigger.addEventListener("click", () => side.classList.contains("open") ? close() : open());
  scrim.addEventListener("click", close);
  side.querySelectorAll(".nav-item").forEach(item => item.addEventListener("click", close));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && side.classList.contains("open")) {
      close();
      trigger.focus();
    }
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1050) close();
  });
})();
