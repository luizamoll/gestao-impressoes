"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const root = path.join(__dirname,"../src/main/resources/static");
const html = fs.readFileSync(path.join(root,"gestao-a-vista.html"),"utf8");
const css = fs.readFileSync(path.join(root,"css/gestao-dashboard-ref-v1.css"),"utf8");
const script = fs.readFileSync(path.join(root,"js/gestao-dashboard-ref-v1.js"),"utf8");

function mount() {
  const listeners={};
  function node() {
    const el={ attrs:{}, handlers:{}, children:[], hidden:false, value:"", textContent:"",
      contains(t){return this===t||this.children.includes(t);},
      addEventListener(k,fn){this.handlers[k]=fn;},
      setAttribute(k,v){this.attrs[k]=String(v);},
      replaceChildren(){this.children=[];},
      append(child){this.children.push(child);},
      click(){this.handlers.click?.();},
      focus(){this.focused=true;},
      querySelectorAll(){return[];} };
    return el;
  }
  const ids={};
  ["gvRefMenuToggle","gvRefSidebar","gvRefSearch","gvRefSearchResults","gvRefHelp","nexo-widget","nexo-panel","nexo-toggle","nexo-chat-input"]
    .forEach(id=>ids[id]=node());
  ids["nexo-panel"].hidden=true;
  ids["nexo-toggle"].click=()=>{
    ids["nexo-panel"].hidden=!ids["nexo-panel"].hidden;
    ids["nexo-toggle"].setAttribute("aria-expanded",String(!ids["nexo-panel"].hidden));
  };
  const classNames=new Set();
  const document={
    body:{classList:{
      add(k){classNames.add(k);}, remove(k){classNames.delete(k);},
      contains(k){return classNames.has(k);},
      toggle(k,b){if(b)classNames.add(k);else classNames.delete(k);}
    }},
    getElementById(id){return ids[id]||null;},
    createElement(){return node();},
    addEventListener(k,fn){listeners[k]=fn;}
  };
  const location={assigned:null,assign(url){this.assigned=url;}};
  const media={matches:true,listeners:{},addEventListener(k,fn){this.listeners[k]=fn;}};
  const window={location,matchMedia(){return media;}};
  vm.runInNewContext(script,{document,window},{filename:"gestao-dashboard-ref-v1.js"});
  return {ids,document,window,media,listeners,classNames};
}

test("a tela usa menu lateral, historico real e Nexo original",()=>{
  assert.match(html,/class="portal-body gv-body gv-ref-body"/);
  assert.match(html,/id="gvRefSidebar"/);
  assert.equal((html.match(/data-gv-nav=/g)||[]).length,4);
  assert.equal((html.match(/data-gv-view/g)||[]).length,4);
  assert.match(html,/id="gvRefConsumed"/);
  assert.match(html,/id="gvRefVariation"/);
  assert.match(html,/id="gvRefPeriod"/);
  assert.match(html,/id="gvRefSearch"/);
  assert.match(html,/id="gvRefHelp"/);
  assert.match(html,/id="gvConnectorStatus"/);
  assert.match(html,/href="index\.html#comunicados"/);
  assert.match(html,/gestao-dashboard-ref-v1\.css/);
  assert.match(html,/gestao-dashboard-ref-v1\.js/);
  assert.match(html,/Vikunja não conectado/);
  assert.doesNotMatch(html,/12 projetos ativos|<strong>12<\/strong>/);
  assert.doesNotMatch(html,/Mai\/2026|Jun\/2026|Jul\/2026/);
  assert.match(css,/\.gv-ref-body \.nexo-widget/);
  assert.match(css,/@media screen and \(max-width:600px\)/);
  assert.match(css,/@media print/);
});

test("busca aponta apenas para modulos reais sem consultar API",()=>{
  const {ids,window}=mount();
  assert.equal(ids["nexo-panel"].hidden,false,"Nexo encaixado em telas largas");
  ids.gvRefSearch.value="perseus";
  ids.gvRefSearch.handlers.input();
  assert.equal(ids.gvRefSearchResults.hidden,false);
  assert.equal(ids.gvRefSearchResults.children.length,1);
  assert.equal(ids.gvRefSearchResults.children[0].href,"gestao-documental.html");
  ids.gvRefSearch.handlers.keydown({key:"Enter",preventDefault(){}});
  assert.equal(window.location.assigned,"gestao-documental.html");
  assert.equal(ids.gvRefSearchResults.hidden,true);
  assert.doesNotMatch(script,/fetch\s*\(|localStorage|sessionStorage/);
});

test("menu mobile e ajuda sao interativos",()=>{
  const {ids,media,classNames,listeners}=mount();
  ids.gvRefMenuToggle.handlers.click();
  assert.equal(classNames.has("gv-ref-menu-open"),true);
  assert.equal(ids.gvRefMenuToggle.attrs["aria-expanded"],"true");
  listeners.keydown({key:"Escape"});
  assert.equal(classNames.has("gv-ref-menu-open"),false);
  media.matches=false;
  media.listeners.change();
  assert.equal(ids["nexo-panel"].hidden,true);
  ids.gvRefHelp.handlers.click();
  assert.equal(ids["nexo-panel"].hidden,false);
  assert.equal(ids["nexo-chat-input"].focused,true);
});

test("indicadores acompanham competencia sem inventar leitura",()=>{
  const logic=fs.readFileSync(path.join(root,"js/gestao-vista.js"),"utf8");
  assert.match(logic,/refPeriod\?\.addEventListener\("change"/);
  assert.match(logic,/if \(refConsumed\) refConsumed\.textContent = d\.consumed/);
  assert.match(logic,/if \(refVariation\) refVariation\.textContent = period === "2026-09"/);
  assert.match(logic,/barButtons\.forEach/);
  assert.match(html,/Outubro\/2026 · sem leitura/);
  assert.match(html,/Sem leitura/);
});
