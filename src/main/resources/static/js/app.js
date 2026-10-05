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
