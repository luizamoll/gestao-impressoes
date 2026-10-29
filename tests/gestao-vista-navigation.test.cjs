"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "../src/main/resources/static");
const html = fs.readFileSync(path.join(root,"gestao-a-vista.html"), "utf8");
const search = fs.readFileSync(path.join(root,"js/gestao-dashboard-ref-v1.js"),"utf8");
const style = fs.readFileSync(path.join(root,"css/gestao-vista.css"),"utf8");

test("busca da Gestao a Vista nao retorna secoes removidas", () => {
  assert.doesNotMatch(search, /href:\s*"index\.html#(?:comunicados|ferramentas)"/);
  assert.match(search, /href:\s*"index\.html#destaques"/);
  assert.match(search, /href:\s*"aplicativos\.html"/);
  assert.match(search, /label: "Destaques da home"/);
  assert.match(html, /Destaques da home/);
});

test("Vikunja e somente um atalho externo e nao fonte de tarefas no painel", () => {
  const url = "https://vikunja.unihorizontes.local/projects/3/12";
  assert.ok(search.includes(url));
  assert.ok(html.includes(url));
  assert.match(html, /Projetos não disponíveis neste painel/);
  assert.match(html, /integração autorizada/);
  assert.match(html, /Abrir projetos no Vikunja/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.match(style, /\.gv-workspace-empty \.gv-project-open/);
});

test("dados sem leitura e estado do conector continuam explicitamente indisponiveis", () => {
  const calc = fs.readFileSync(path.join(root,"js/gestao-vista.js"),"utf8");
  assert.match(calc, /"2026-10": \{\s*pages: null/);
  assert.match(html, /Outubro\/2026 · sem leitura/);
  assert.match(html, /Vikunja não conectado/);
  assert.match(html, /id="gvRefPeriod"/);
  assert.match(html, /id="gvDownloadCsv"/);
  assert.match(html, /unh-site-header\.css/);
});
