"use strict";

// Apenas navegacao e busca local: nenhum conteudo ficticio e publicado.
(() => {
  const menuButton = document.getElementById("portalMenuButton");
  const nav = document.getElementById("portalNav");
  if (!menuButton || !nav) return;

  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const closeMenu = () => {
    nav.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menu de navegação");
  };

  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    nav.classList.toggle("is-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Fechar menu de navegação" : "Abrir menu de navegação");
  });

  links.forEach(link => link.addEventListener("click", () => {
    links.forEach(item => item.removeAttribute("aria-current"));
    link.setAttribute("aria-current", "page");
    closeMenu();
  }));


  // Filtra apenas o catalogo local; sem chamada a servidores.
  const searchInput = document.getElementById("portalToolSearch");
  const toolCards = [...document.querySelectorAll(".portal-tools-card[data-search]")];
  const emptyNotice = document.getElementById("portalToolEmpty");
  const normalize = value => value
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  searchInput?.addEventListener("input", () => {
    if (!toolCards.length || !emptyNotice) return;
    const query = normalize(searchInput.value);
    let count = 0;
    toolCards.forEach(card => {
      const match = normalize(card.getAttribute("data-search") || "").includes(query);
      card.hidden = !match;
      if (match) count++;
    });
    emptyNotice.hidden = count > 0;
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", event => {
    if (!nav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });
})();
