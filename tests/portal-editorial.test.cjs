"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "../src/main/resources/static");
const editorial = fs.readFileSync(path.join(root,"css/portal-editorial-v1.css"),"utf8");
const svg = fs.readFileSync(path.join(root,"assets/unh-horizonte-linhas.svg"),"utf8");

test("grafismo local abstrato nao troca a logomarca UNH", () => {
  assert.match(svg,/^<svg\b/);
  assert.match(svg,/viewBox="0 0 1000 680"/);
  assert.match(svg,/<path\s+d="M-96 350/);
  assert.doesNotMatch(svg,/<script\b|onload=|<foreignObject|https?:\/\//i);
  for (const name of ["index.html","gestao-a-vista.html"]) {
    const html=fs.readFileSync(path.join(root,name),"utf8");
    assert.match(html,/assets\/portal-unh-simbolo\.svg/);
    assert.match(html,/portal-editorial-v1\.css\?v=20261019-v1/);
    assert.ok(html.indexOf("portal-editorial-v1.css") > html.indexOf("portal-palette-v1.css"),"editorial deve sobrescrever paleta em "+name);
  }
});

test("hero editorial troca fundo pesado por fundo claro e preserva painel", () => {
  assert.match(editorial,/\.portal-home-v3 \.portal-hero\s*\{/);
  assert.match(editorial,/background:\s*linear-gradient\(113deg,#f8f7f2/);
  assert.match(editorial,/\.portal-home-v3 \.portal-hero::after\s*\{/);
  assert.match(editorial,/width:\s*51%/);
  assert.match(editorial,/unh-horizonte-linhas\.svg/);
  assert.match(editorial,/\.portal-home-v3 \.portal-hero-v3-workspace\s*\{/);
  assert.match(editorial,/\.portal-home-v3 \.portal-hero h1 em/);
  const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
  assert.match(html,/href="#comunicados"/);
  assert.match(html,/href="#ferramentas"/);
  assert.match(html,/href="gestao-a-vista\.html"/);
  assert.match(html,/id="muralPostForm"/);
  assert.match(html,/data-portal-tool-filter="gestao"/);
});

test("grafismo se repete na Gestao e responsividade preservada", () => {
  assert.match(editorial,/\.gv-page \.gv-workspace-sidebar::after/);
  assert.match(editorial,/\.gv-page \.gv-intro-copy/);
  assert.match(editorial,/@media\(max-width:850px\)/);
  assert.match(editorial,/@media\(max-width:650px\)/);
  assert.match(editorial,/prefers-reduced-motion:reduce/);
  assert.doesNotMatch(editorial,/\.nexo-launcher-avatar\s*\{|\.nexo-panel-avatar\s*\{/);
  assert.doesNotMatch(editorial,/fetch\s*\(|localStorage|sessionStorage/);
});

test("blocos CSS tem pares completos",()=>{
  const noComments=editorial.replace(/\/\*[\s\S]*?\*\//g,"");
  let balance=0;
  for(const ch of noComments){
    if(ch==="{")balance++;
    if(ch==="}")balance--;
    assert.ok(balance>=0);
  }
  assert.equal(balance,0);
});
