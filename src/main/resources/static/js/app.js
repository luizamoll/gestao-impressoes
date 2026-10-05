const equipmentData = [
  {
    name: "HP LaserJet Pro MFP 4103fdw",
    productNumber: "2Z629A",
    serial: "BRBSV730KB",
    location: "Não cadastrada",
    previous: null,
    current: 56,
    consumption: null
  },
  {
    name: "HP LaserJet Pro MFP 4103fdw",
    productNumber: "2Z629A",
    serial: "BRBST2P00K",
    location: "Não cadastrada",
    previous: null,
    current: 27582,
    consumption: null
  },
  {
    name: "HP LaserJet Pro 4003dw",
    productNumber: "2Z610A",
    serial: "BRBST160GT",
    location: "Não cadastrada",
    previous: null,
    current: 17468,
    consumption: null
  }
];

const formatNumber = value =>
  value == null ? "—" : new Intl.NumberFormat("pt-BR").format(value);

function renderChart(data) {
  const chart = document.querySelector("#barChart");
  const max = Math.max(...data.map(item => item.current));

  chart.innerHTML = data.map((item, index) => {
    const height = Math.max(8, (item.current / max) * 100);
    return `
      <div class="bar-column" title="${item.name}: ${formatNumber(item.current)} páginas acumuladas">
        <div class="bar-track">
          <div class="bar ${index === 1 ? "highlight" : ""}" style="height:${height}%"></div>
        </div>
        <span class="bar-value">${formatNumber(item.current)}</span>
        <span class="bar-label">${item.serial}</span>
      </div>
    `;
  }).join("");
}

function renderTable(data) {
  const body = document.querySelector("#equipmentTable");

  body.innerHTML = data.map(item => `
    <tr>
      <td>
        <strong>${item.name}</strong>
        <small>Produto ${item.productNumber}</small>
      </td>
      <td>${item.serial}</td>
      <td>${item.location}</td>
      <td>${formatNumber(item.previous)}</td>
      <td><strong>${formatNumber(item.current)}</strong></td>
      <td>${item.consumption == null ? "Aguardando leitura anterior" : formatNumber(item.consumption)}</td>
      <td><span class="pending">Histórico inicial</span></td>
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

const search = document.querySelector("#equipmentSearch");
search.addEventListener("input", () => {
  const query = search.value.toLocaleLowerCase("pt-BR").trim();
  const filtered = equipmentData.filter(item =>
    [item.name, item.productNumber, item.serial, item.location]
      .some(value => value.toLocaleLowerCase("pt-BR").includes(query))
  );
  renderTable(filtered);
});

function showToast() {
  const toast = document.querySelector("#toast");
  toast.classList.add("visible");
  window.setTimeout(() => toast.classList.remove("visible"), 3500);
}
