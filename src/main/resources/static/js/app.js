const equipmentData = [
  {
    name: "HP LaserJet Pro MFP 4103fdw",
    productNumber: "2Z629A",
    serial: "BRBSV730KB",
    current: 56,
    duplex: 5,
    jams: 0,
    pickupFailures: 0,
    copies: 1,
    scanner: 142
  },
  {
    name: "HP LaserJet Pro MFP 4103fdw",
    productNumber: "2Z629A",
    serial: "BRBST2P00K",
    current: 27582,
    duplex: 7576,
    jams: 1,
    pickupFailures: 28,
    copies: 978,
    scanner: 5349
  },
  {
    name: "HP LaserJet Pro 4003dw",
    productNumber: "2Z610A",
    serial: "BRBST160GT",
    current: 17468,
    duplex: 8589,
    jams: 2,
    pickupFailures: 3,
    copies: null,
    scanner: null
  }
];

const formatNumber = value =>
  value == null ? "—" : new Intl.NumberFormat("pt-BR").format(value);

function renderCards(data) {
  const container = document.querySelector("#equipmentCards");
  container.innerHTML = data.map(item => `
    <article class="equipment-card">
      <h3>${item.name}</h3>
      <div class="serial">${item.serial}</div>
      <div class="reading">
        <span>Contador atual</span>
        <strong>${formatNumber(item.current)}</strong>
      </div>
      <div class="product">Produto ${item.productNumber}</div>
    </article>
  `).join("");
}

function renderTable(data) {
  const body = document.querySelector("#equipmentTable");
  body.innerHTML = data.map(item => `
    <tr>
      <td><strong>${item.name}</strong><small>Produto ${item.productNumber}</small></td>
      <td>${item.serial}</td>
      <td><strong>${formatNumber(item.current)}</strong></td>
      <td>${formatNumber(item.duplex)}</td>
      <td>${formatNumber(item.jams)}</td>
      <td>${formatNumber(item.pickupFailures)}</td>
      <td>${formatNumber(item.copies)}</td>
      <td>${formatNumber(item.scanner)}</td>
    </tr>
  `).join("");
}

function renderAll(data = equipmentData) {
  renderCards(data);
  renderTable(data);
}

renderAll();

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

const search = document.querySelector("#equipmentSearch");
search.addEventListener("input", () => {
  const query = search.value.toLocaleLowerCase("pt-BR").trim();
  const filtered = equipmentData.filter(item =>
    [item.name, item.productNumber, item.serial]
      .some(value => value.toLocaleLowerCase("pt-BR").includes(query))
  );
  renderCards(filtered);
  renderTable(filtered);
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

dropzone.addEventListener("drop", event => handleFile(event.dataTransfer.files[0]));

analyzeButton.addEventListener("click", () => {
  if (!selectedFile) return;
  showToast();
});

function showToast() {
  const toast = document.querySelector("#toast");
  toast.classList.add("visible");
  window.setTimeout(() => toast.classList.remove("visible"), 3000);
}
