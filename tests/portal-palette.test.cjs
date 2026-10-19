"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname,"../src/main/resources/static");
const css=fs.readFileSync(path.join(root,"css/portal-palette-v1.css"),"utf8");
const pages=["index.html","gestao-a-vista.html","automacoes.html","gestao-documental.html"];

test("tokens de marca, superficies e apoio semantico estao declarados",()=>{
  const required={
    "--unh-brand":"#075641",
    "--unh-brand-strong":"#084c38",
    "--unh-analytics":"#2e5b74",
    "--unh-sage":"#7e9f90",
    "--unh-warning":"#93610b",
    "--unh-danger":"#ad4339",
    "--unh-ink":"#1d2a24",
    "--unh-canvas":"#f7f9f8"
  };
  for(const [token,hex] of Object.entries(required)){
    assert.match(css,new RegExp(token+":\\s*"+hex+"\\s*;","i"),"Token "+token);
  }
  assert.match(css,/--unh-analytics-soft/);
  assert.match(css,/--unh-warning-soft/);
  assert.match(css,/--unh-danger-soft/);
});

test("as quatro paginas do Portal carregam a paleta depois dos CSS de modulos",()=>{
  for(const name of pages){
    const html=fs.readFileSync(path.join(root,name),"utf8");
    assert.match(html,/css\/portal-palette-v1\.css\?v=20261019-v1/);
    assert.ok(html.indexOf("css/portal-palette-v1.css")>html.indexOf("css/portal.css"),
      "A paleta deve vir depois dos estilos base em "+name);
    assert.match(html,/js\/nexo-assistente\.js/);
  }
});

test("cores identificam funções e nao pintam o mascote de verde",()=>{
  assert.match(css,/\.gv-page \.gv-workspace-menu a\.gv-workspace-menu-current/);
  assert.match(css,/\.gv-page \.gv-history-snapshot-metric strong/);
  assert.match(css,/\.gv-page \.gv-workspace-status\[data-connection="unavailable"\]/);
  assert.match(css,/\.gv-page \.gv-bar-selected \.gv-track span/);
  assert.match(css,/\.gv-page \.gv-insight\.gv-insight-neutral/);
  assert.match(css,/\.portal-home-v3 \.gv-home-status/);
  assert.match(css,/\.portal-home-v3 \.gd-home-state/);
  assert.match(css,/\.portal-body \.nexo-panel/);
  assert.doesNotMatch(css,/\.nexo-launcher-avatar\s*\{/);
  assert.doesNotMatch(css,/\.nexo-panel-avatar\s*\{/);
  assert.doesNotMatch(css,/\bfetch\s*\(|localStorage|sessionStorage/);
});

test("sintaxe basica CSS valida e todas as referencias de cores tem 6 digitos",()=>{
  let depth=0;
  for(const ch of css){
    if(ch==="{")depth++;
    if(ch==="}")depth--;
    assert.ok(depth>=0,"Chave fechada sem abertura");
  }
  assert.equal(depth,0,"Todas as regras devem ser fechadas");
  const values=[...css.matchAll(/#[\da-fA-F]{3,8}\b/g)].map(m=>m[0]);
  assert.ok(values.length>20,"Paleta deve ter os tons de apoio");
  assert.ok(values.every(c=>/^#(?:[\da-fA-F]{3}|[\da-fA-F]{6})$/.test(c)),
    "Cores hex CSS devem ter 3 ou 6 digitos");
});
