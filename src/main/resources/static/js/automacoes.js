"use strict";
// Apenas filtra informacoes publicas do catalogo. Nenhum documento e processado aqui.
(() => {
  const query = document.getElementById("automationSearch");
  const status = document.getElementById("automationStatus");
  const list = document.getElementById("automationGrid");
  const counter = document.getElementById("automationCount");
  const empty = document.getElementById("automationEmpty");
  if (!query || !status || !list || !counter || !empty) return;
  const cards = [...list.querySelectorAll(".automation-card")];
  const normalize = value => String(value).toLocaleLowerCase("pt-BR")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  function update() {
    const search = normalize(query.value);
    const filter = status.value;
    let visible = 0;
    cards.forEach(card => {
      const show = normalize(card.dataset.search || "").includes(search) &&
        (filter === "todas" || card.dataset.status === filter);
      card.hidden = !show;
      if (show) visible++;
    });
    counter.textContent = visible === 1 ? "1 ferramenta encontrada" : visible + " ferramentas encontradas";
    empty.hidden = visible > 0;
  }
  query.addEventListener("input",update);
  status.addEventListener("change",update);
  update();
})();
