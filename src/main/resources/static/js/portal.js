"use strict";

// Apenas navegacao e busca local: nenhum conteudo ficticio e publicado.
(() => {
  // Mantém a home legível mesmo antes de instalar o novo arquivo da arte localmente.
  const heroImage = document.getElementById("portalHeroImage");
  heroImage?.addEventListener("error", () => {
    const fallback = heroImage.getAttribute("data-fallback-src");
    if (fallback && !heroImage.dataset.didFallback) {
      heroImage.dataset.didFallback = "yes";
      heroImage.src = fallback;
      heroImage.alt = "Fotografia da entrada da Unihorizontes.";
      const caption = heroImage.closest("figure")?.querySelector("figcaption");
      if (caption) caption.textContent = "Imagem anterior · substituição pendente";
    }
  });

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
  nav.querySelectorAll('a:not([href^="#"])').forEach(link => {
    link.addEventListener("click", closeMenu);
  });


  // Busca e filtros combinados: operam somente sobre o catalogo local.
  const searchInput = document.getElementById("portalToolSearch");
  const toolCards = [...document.querySelectorAll(".portal-tools-card[data-search]")];
  const emptyNotice = document.getElementById("portalToolEmpty");
  const toolCount = document.getElementById("portalToolCount");
  const categoryButtons = [...document.querySelectorAll("[data-portal-tool-filter]")];
  let selectedCategory = "todas";
  const normalize = value => String(value || "")
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  function filterTools() {
    if (!toolCards.length) return;
    const query = normalize(searchInput?.value);
    let count = 0;
    toolCards.forEach(card => {
      const matchesText = normalize(card.getAttribute("data-search")).includes(query);
      const matchesCategory = selectedCategory === "todas"
        || card.dataset.category === selectedCategory;
      const visible = matchesText && matchesCategory;
      card.hidden = !visible;
      if (visible) count++;
    });
    if (emptyNotice) emptyNotice.hidden = count > 0;
    if (toolCount) toolCount.textContent = count === 1
      ? "1 ferramenta encontrada"
      : count + " ferramentas encontradas";
    categoryButtons.forEach(button => {
      const active = button.dataset.portalToolFilter === selectedCategory;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  searchInput?.addEventListener("input", filterTools);
  categoryButtons.forEach(button => button.addEventListener("click", () => {
    selectedCategory = button.dataset.portalToolFilter || "todas";
    filterTools();
  }));
  filterTools();

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", event => {
    if (!nav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });
})();
