const navItems = document.querySelectorAll("button.nav-item[data-section]");
const sidebar = document.querySelector("#sidebar");

function goToSection(id) {
  document.querySelector("#" + id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  navItems.forEach(item => item.classList.toggle("active", item.dataset.section === id));
  sidebar?.classList.remove("open");
}

navItems.forEach(item => {
  item.addEventListener("click", () => goToSection(item.dataset.section));
});

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => goToSection(button.dataset.go));
});

document.querySelector("#menuButton")?.addEventListener("click", () => {
  sidebar?.classList.toggle("open");
});

const search = document.querySelector("#equipmentSearch");
const searchableItems = document.querySelectorAll("[data-search]");

search?.addEventListener("input", () => {
  const query = search.value.toLocaleLowerCase("pt-BR").trim();
  searchableItems.forEach(item => {
    item.hidden = !item.dataset.search.includes(query);
  });
});

const fileInput = document.querySelector("#fileInput");
const dropzone = document.querySelector("#dropzone");
const analyzeButton = document.querySelector("#analyzeButton");
const uploadTitle = document.querySelector("#uploadTitle");
const uploadSubtitle = document.querySelector("#uploadSubtitle");
let selectedFile = null;

function handleFile(file) {
  if (!file) return;

  const accepted = ["application/pdf", "image/png", "image/jpeg"];
  const acceptedByExtension = /\.(pdf|png|jpe?g)$/i.test(file.name);

  if (!accepted.includes(file.type) && !acceptedByExtension) {
    selectedFile = null;
    uploadTitle.textContent = "Formato não suportado";
    uploadSubtitle.textContent = "Selecione PDF, PNG ou JPG.";
    analyzeButton.disabled = true;
    return;
  }

  selectedFile = file;
  uploadTitle.textContent = file.name;
  uploadSubtitle.textContent = `${(file.size / 1024 / 1024).toFixed(2).replace(".", ",")} MB`;
  analyzeButton.disabled = false;
}

fileInput?.addEventListener("change", event => handleFile(event.target.files[0]));

["dragenter", "dragover"].forEach(eventName => {
  dropzone?.addEventListener(eventName, event => {
    event.preventDefault();
    dropzone.classList.add("dragging");
  });
});

["dragleave", "drop"].forEach(eventName => {
  dropzone?.addEventListener(eventName, event => {
    event.preventDefault();
    dropzone.classList.remove("dragging");
  });
});

dropzone?.addEventListener("drop", event => {
  handleFile(event.dataTransfer.files[0]);
});

analyzeButton?.addEventListener("click", () => {
  if (!selectedFile) return;
  showToast();
});

function showToast() {
  const toast = document.querySelector("#toast");
  toast?.classList.add("visible");
  window.setTimeout(() => toast?.classList.remove("visible"), 3000);
}


function enhanceMachineHistory() {
  const heading = document.querySelector(".history-heading");
  if (heading) {
    const title = heading.querySelector("h3");
    const text = heading.querySelector("p");
    if (title) title.textContent = "Entenda cada equipamento";
    if (text) text.textContent = "Primeiro mostramos o que importa para gestão. O histórico técnico continua logo abaixo para conferência.";
  }

  const configs = {
    BRBST2P00K: { consumption: "1.439", share: "94,5%", previous: "18.318", current: "19.757", message: "Esta foi a máquina que mais consumiu em setembro. Em agosto, ela havia consumido 819 impressões; em setembro, subiu para 1.439.", tone: "important" },
    BRBST160GT: { consumption: "83", share: "5,5%", previous: "17.146", current: "17.229", message: "Esta máquina teve baixo uso no período. Em agosto consumiu 197 impressões; em setembro caiu para 83.", tone: "calm" }
  };

  document.querySelectorAll(".history-card").forEach(card => {
    if (card.querySelector(".machine-overview")) return;
    const serial = Object.keys(configs).find(value => card.textContent.includes(value));

    if (serial) {
      const data = configs[serial];
      const overview = document.createElement("div");
      overview.className = "machine-overview";
      overview.innerHTML = `
        <div class="machine-highlight ${data.tone}">
          <span>Consumo em setembro</span><strong>${data.consumption}</strong><small>${data.share} do consumo calculado no mês</small>
        </div>
        <div class="machine-reading-flow">
          <div><span>Agosto</span><strong>${data.previous}</strong></div><div class="flow-arrow">→</div>
          <div><span>Setembro</span><strong>${data.current}</strong></div><div class="flow-equals">=</div>
          <div class="flow-result"><span>Uso no período</span><strong>${data.consumption}</strong></div>
        </div>
        <div class="machine-message ${data.tone}">
          <strong>Leitura rápida</strong><span>${data.message}</span>
        </div>`;
      card.querySelector(".history-card-head")?.after(overview);
    } else if (card.textContent.includes("BRBSV730KB")) {
      const overview = document.createElement("div");
      overview.className = "machine-overview new-machine";
      overview.innerHTML = `
        <div class="machine-highlight neutral">
          <span>Consumo mensal</span><strong class="machine-text-value">Ainda não calculável</strong><small>é necessária uma segunda leitura</small>
        </div>
        <div class="machine-message neutral">
          <strong>Leitura rápida</strong><span>Esta é a primeira leitura registrada. No próximo relatório, o sistema poderá calcular quanto esta máquina consumiu no período.</span>
        </div>`;
      card.querySelector(".history-card-head")?.after(overview);
    }

    const technical = card.querySelector(".history-table-wrap, .single-reading-grid");
    if (technical && !card.querySelector(".technical-caption")) {
      const caption = document.createElement("div");
      caption.className = "technical-caption";
      caption.innerHTML = "<strong>Detalhes técnicos</strong><span>Dados para conferência; não é preciso interpretar esta tabela para entender o consumo mensal.</span>";
      technical.before(caption);
    }
  });

  document.querySelectorAll(".history-table th").forEach(th => {
    if (th.textContent.trim() === "Diferença") th.textContent = "Consumo desde a leitura anterior";
  });

  document.querySelectorAll(".history-table tbody tr").forEach(row => {
    const firstCell = row.querySelector("td");
    if (firstCell?.textContent.trim() === "Mais recente") {
      firstCell.innerHTML = "Leitura posterior<small>mês a confirmar</small>";
      const diffCell = row.children[2];
      if (diffCell?.querySelector(".delta") && !diffCell.querySelector("small")) diffCell.insertAdjacentHTML("beforeend", "<small>desde setembro</small>");
    }
  });
}
enhanceMachineHistory();
