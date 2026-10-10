// Navegacao local da demonstracao publica: sem API, armazenamento ou upload.
const sidebar=document.querySelector("#sidebar");
const buttons=document.querySelectorAll("button.nav-item[data-section]");
function goToSection(id){
  document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"});
  buttons.forEach(x=>x.classList.toggle("active",x.dataset.section===id));
  sidebar?.classList.remove("open");
}
buttons.forEach(x=>x.addEventListener("click",()=>goToSection(x.dataset.section)));
document.querySelectorAll("[data-go]").forEach(x=>x.addEventListener("click",()=>goToSection(x.dataset.go)));
document.getElementById("menuButton")?.addEventListener("click",()=>sidebar?.classList.toggle("open"));
const input=document.getElementById("equipmentSearch");
input?.addEventListener("input",()=>{
  const q=input.value.toLocaleLowerCase("pt-BR").trim();
  document.querySelectorAll(".equipment-card[data-search]").forEach(el=>el.hidden=!el.dataset.search.includes(q));
});
