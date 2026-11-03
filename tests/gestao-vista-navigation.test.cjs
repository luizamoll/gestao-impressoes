"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "../src/main/resources/static");
const html = fs.readFileSync(path.join(root,"gestao-a-vista.html"),"utf8");
const search = fs.readFileSync(path.join(root,"js/gestao-dashboard-ref-v1.js"),"utf8");
const logic = fs.readFileSync(path.join(root,"js/gestao-vista.js"),"utf8");
const css = fs.readFileSync(path.join(root,"css/gestao-vista.css"),"utf8");

test("tres areas uteis substituem indicadores vazios e o Vikunja",()=>{
  assert.equal((html.match(/data-gv-nav=/g)||[]).length,3);
  assert.equal((html.match(/data-gv-view/g)||[]).length,3);
  assert.match(html,/id="gv-ferramentas"/);
  assert.match(html,/id="gv-impressao-view"/);
  assert.doesNotMatch(html,/Vikunja|vikunja|gv-projetos|gv-indicadores/);
  assert.match(logic,/"gv-ferramentas": "gv-ferramentas"/);
  assert.doesNotMatch(logic,/checkConnector|Vikunja|gv-projetos|gv-indicadores/);
});

test("ferramentas existentes abrem rotas e servicos reais, sem tokens",()=>{
  const internal=["impressao.html","esg.html","automacoes.html","gestao-documental.html"];
  const external=[
    "https://helpdesk.unihorizontes.local/Helpdesk",
    "https://teams.microsoft.com/","https://outlook.office.com/mail/"
  ];
  for(const href of [...internal,...external]){
    assert.ok(html.includes('href="'+href+'"'),href);
  }
  assert.equal((html.match(/class="gv-tool-card"/g)||[]).length,7);
  assert.match(html,/Ainda não há sincronização/);
  assert.match(css,/\.gv-tools-grid/);
  assert.match(html,/target="_blank" rel="noopener noreferrer"/);
});

test("busca aponta para tres areas e ferramentas existentes",()=>{
  assert.doesNotMatch(search,/gv-projetos|gv-indicadores|Vikunja|index\.html#comunicados|index\.html#ferramentas/);
  assert.match(search,/href: "index\.html#destaques"/);
  assert.match(search,/href: "#gv-ferramentas"/);
  assert.match(search,/href: "gestao-documental\.html"/);
  assert.match(search,/href: "https:\/\/teams\.microsoft\.com\/"/);
});

test("historico continua sem transformar leitura ausente em zero",()=>{
  assert.match(logic,/"2026-10": \{\s*pages: 1664/);
  assert.match(html,/Outubro\/2026 · apuração informada/);
  assert.match(html,/id="gvRefPeriod"/);
  assert.match(html,/id="gvDownloadCsv"/);
  assert.match(html,/unh-site-header\.css/);
});
