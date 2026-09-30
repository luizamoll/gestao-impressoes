const equipmentData = [
  { name: "HP LaserJet M428", serial: "BRH428-001", location: "Secretaria Acadêmica", previous: 38120, current: 50420, consumption: 12300, delta: 6.2 },
  { name: "Brother DCP-L5652", serial: "BRL565-014", location: "Biblioteca", previous: 25600, current: 33700, consumption: 8100, delta: -12.4 },
  { name: "HP LaserJet M404", serial: "BRM404-008", location: "Financeiro", previous: 19830, current: 26420, consumption: 6590, delta: -4.8 },
  { name: "Epson WorkForce 5790", serial: "EPS579-021", location: "RH / DP", previous: 14420, current: 20210, consumption: 5790, delta: -9.1 },
  { name: "Brother MFC-L6902", serial: "BRL690-003", location: "Coordenação", previous: 30880, current: 36310, consumption: 5430, delta: 3.4 },
  { name: "HP LaserJet M428", serial: "BRH428-017", location: "TI", previous: 11250, current: 15720, consumption: 4470, delta: -18.5 }
];

const formatNumber = value => new Intl.NumberFormat("pt-BR").format(value);

function renderChart(data) {
  const chart = document.querySelector("#barChart");
  const max = Math.max(...data.map(item => item.consumption));

  chart.innerHTML = data.map((item, index) => {
    const height = Math.max(8, (item.consumption / max) * 100);
    return `
      <div class="bar-column" title="${item.location}: ${formatNumber(item.consumption)} impressões">
        <div class="bar-track">
          <div class="bar ${index === 0 ? "highlight" : ""}" style="height:${height}%"></div>
        </div>
        <span class="bar-value">${(item.consumption / 1000).toFixed(1).replace(".", ",")}k</span>
        <span class="bar-label">${item.location}</span>
      </div>
    `;
  }).join("");
}

function renderTable(data) {
  const body = document.querySelector("#equipmentTable");

  body.innerHTML = data.map(item => `
    <tr>
      <td><strong>${item.name}</strong><small>Ativo</small></td>
      <td>${item.serial}</td>
      <td>${item.location}</td>
      <td>${formatNumber(item.previous)}</td>
      <td>${formatNumber(item.current)}</td>
      <td><strong>${formatNumber(item.consumption)}</strong></td>
      <td><span class="delta ${item.delta <= 0 ? "down" : "up"}">${item.delta > 0 ? "↑" : "↓"} ${Math.abs(item.delta).toFixed(1).replace(".", ",")}%</span></td>
    </tr>
  `).join("");
}

renderChart(equipmentData);
renderTable(equipmentData);

const navItems = document.querySelectorAll(".nav-item");
const sidebar = document.querySelector("#sidebar");

function goToSection(id) {
  document.querySelector("#" + id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  navItems.forEach(item => item.classList.toggle("active", item.dataset.section === id));
  sidebar.classList.remove("open");
}

navItems.forEach(item => item.addEventListener("click", () => goToSection(item.dataset.section)));
document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => goToSection(button.dataset.go));
});

document.querySelector("#menuButton").addEventListener("click", () => sidebar.classList.toggle("open"));

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
    uploadSubtitle.textContent = "Selecione um arquivo PDF, PNG ou JPG.";
    analyzeButton.disabled = true;
    return;
  }

  selectedFile = file;
  uploadTitle.textContent = file.name;
  uploadSubtitle.textContent = `${(file.size / 1024 / 1024).toFixed(2).replace(".", ",")} MB · pronto para análise`;
  analyzeButton.disabled = false;
}

fileInput.addEventListener("change", event => handleFile(event.target.files[0]));

["dragenter", "dragover"].forEach(eventName => {
  dropzone.addEventListener(eventName, event => {
    event.preventDefault();
    dropzone.classList.add("dragging");
  });
});

["dragleave", "drop"].forEach(eventName => {
  dropzone.addEventListener(eventName, event => {
    event.preventDefault();
    dropzone.classList.remove("dragging");
  });
});

dropzone.addEventListener("drop", event => {
  handleFile(event.dataTransfer.files[0]);
});

analyzeButton.addEventListener("click", () => {
  if (!selectedFile) return;

  analyzeButton.disabled = true;
  analyzeButton.textContent = "Analisando...";

  window.setTimeout(() => {
    analyzeButton.textContent = "Analisar relatório";
    analyzeButton.disabled = false;
    showToast();
  }, 700);
});

const tooltip = document.querySelector("#tooltip");
document.querySelectorAll(".info-button").forEach(button => {
  button.addEventListener("mouseenter", () => {
    const rect = button.getBoundingClientRect();
    tooltip.textContent = button.dataset.tooltip;
    tooltip.style.left = Math.min(rect.left, window.innerWidth - 280) + "px";
    tooltip.style.top = rect.bottom + 8 + "px";
    tooltip.classList.add("visible");
  });
  button.addEventListener("mouseleave", () => tooltip.classList.remove("visible"));
  button.addEventListener("focus", () => button.dispatchEvent(new Event("mouseenter")));
  button.addEventListener("blur", () => tooltip.classList.remove("visible"));
});

const search = document.querySelector("#equipmentSearch");
search.addEventListener("input", () => {
  const query = search.value.toLocaleLowerCase("pt-BR").trim();
  const filtered = equipmentData.filter(item =>
    [item.name, item.serial, item.location].some(value => value.toLocaleLowerCase("pt-BR").includes(query))
  );
  renderTable(filtered);
});

function showToast() {
  const toast = document.querySelector("#toast");
  toast.classList.add("visible");
  window.setTimeout(() => toast.classList.remove("visible"), 3500);
}
