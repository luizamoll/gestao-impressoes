"use strict";

// Regressao da Home premium: roda o JS original com DOM minimo, sem bibliotecas.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "../src/main/resources/static");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "css/portal-home-v3.css"), "utf8");
const source = fs.readFileSync(path.join(root, "js/portal.js"), "utf8");

function mock() {
  const byId = {};
  const tools = [
    { name: "Impressões", category: "gestao", keywords: "gestao impressao franquia equipamentos" },
    { name: "Gestão", category: "gestao", keywords: "gestao a vista indicadores" },
    { name: "Perseus", category: "documentos", keywords: "perseus pdf documentos" },
    { name: "Automações", category: "automacoes", keywords: "automacoes rotinas python" }
  ].map(x => ({ dataset: { category: x.category }, hidden: false,
    getAttribute(name) { return name === "data-search" ? x.keywords : null; }
  }));
  const eventHandlers = {};
  function element() {
    const handlers = {};
    const attrs = {};
    const active = new Set();
    return { handlers, attrs, dataset: {}, hidden: false, textContent: "", value: "",
      classList: { toggle(token, on) { if(on) active.add(token); else active.delete(token); },
        remove(token) { active.delete(token); }, has(token) { return active.has(token); } },
      setAttribute(k,v){attrs[k]=v;}, getAttribute(k){return attrs[k] || null;},
      addEventListener(k,cb){handlers[k]=cb;}, contains(){return false;},
      querySelectorAll(){return [];}
    };
  }
  byId.portalMenuButton = element();
  byId.portalMenuButton.attrs["aria-expanded"] = "false";
  byId.portalNav = element();
  byId.portalToolSearch = element();
  byId.portalToolEmpty = element();
  byId.portalToolCount = element();
  const filters = ["todas","gestao","documentos","automacoes"].map(key => {
    const b = element(); b.dataset.portalToolFilter = key; return b;
  });
  const document = {
    getElementById(id) { return byId[id] || null; },
    querySelectorAll(selector) {
      return selector === ".portal-tools-card[data-search]" ? tools
        : selector === "[data-portal-tool-filter]" ? filters : [];
    },
    addEventListener(k,cb){eventHandlers[k]=cb;}
  };
  vm.runInNewContext(source,{document});
  return { byId, tools, filters, eventHandlers };
}

test("a home premium preserva o mural antes das ferramentas e todas as integracoes", () => {
  assert.ok(html.indexOf('id="comunicados"') < html.indexOf('id="ferramentas"'));
  assert.match(html, /portal-home-v3\.css\?v=/);
  assert.match(html, /id="muralRole"/);
  assert.match(html, /id="muralPostForm"/);
  assert.match(html, /js\/mural\.js/);
  assert.match(html, /js\/nexo-agente\.js/);
  assert.match(html, /href="\/login"/);
  assert.match(html, /aria-label="Navegação principal"/);
  assert.match(html, /portal-mural-layout/);
  assert.match(html, /portal-home-v3-tool-grid/);
  assert.match(html, /portal-hero-v3-workspace/);
  assert.match(html, /Áreas internas protegidas/);
  assert.doesNotMatch(html, /dados em tempo real|projetos conectados/);
});

test("filtros sao funcionais e combinam categoria com busca por texto", () => {
  const {byId,tools,filters} = mock();
  assert.equal(byId.portalToolCount.textContent, "4 ferramentas encontradas");
  assert.equal(byId.portalToolEmpty.hidden, true);
  filters[1].handlers.click();
  assert.deepEqual(tools.map(t=>t.hidden),[false,false,true,true]);
  assert.equal(byId.portalToolCount.textContent, "2 ferramentas encontradas");
  assert.equal(filters[1].attrs["aria-pressed"],"true");
  byId.portalToolSearch.value = "impressao";
  byId.portalToolSearch.handlers.input();
  assert.deepEqual(tools.map(t=>t.hidden),[false,true,true,true]);
  assert.equal(byId.portalToolCount.textContent,"1 ferramenta encontrada");
  filters[2].handlers.click();
  assert.equal(byId.portalToolEmpty.hidden,false);
  assert.equal(byId.portalToolCount.textContent,"0 ferramentas encontradas");
  byId.portalToolSearch.value = "";
  byId.portalToolSearch.handlers.input();
  assert.deepEqual(tools.map(t=>t.hidden),[true,true,false,true]);
});

test("menu movel conserva interacao, fechar por Esc e link", () => {
  const { byId,eventHandlers }=mock();
  const menu=byId.portalMenuButton;
  menu.handlers.click();
  assert.equal(menu.attrs["aria-expanded"], "true");
  assert.equal(byId.portalNav.classList.has("is-open"),true);
  eventHandlers.keydown({key:"Escape"});
  assert.equal(menu.attrs["aria-expanded"],"false");
});

test("design usa verde UNH, tipografia legivel, mobile e movimento reduzido",()=>{
  assert.match(css, /--home-green:#075641/);
  assert.match(css, /font-family:"Plus Jakarta Sans"/);
  assert.match(css, /@media\(max-width:650px\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /\.portal-home-v3-tool-grid/);
  assert.match(css, /\.portal-home-v3-rail/);
  assert.doesNotMatch(source, /\bfetch\s*\(|localStorage|sessionStorage/);
});
