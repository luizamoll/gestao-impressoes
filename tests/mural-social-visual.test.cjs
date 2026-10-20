"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "../src/main/resources/static");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const home = read("index.html");
const css = read("css/mural-social-v2.css");
const oldMuralJs = read("js/mural.js");
const lab = read("mural-lab.html");
const labJs = read("js/mural-lab.js");

test("redesign premium preserva os IDs do mural e a rota dos comunicados", () => {
  assert.match(home, /id="comunicados"/);
  assert.match(home, /id="newsTitle"/);
  assert.match(home, /class="portal-feature-head mural-social-hero"/);
  assert.match(home, /css\/mural-social-v2\.css\?v=/);
  assert.ok(home.indexOf("mural-social-v2.css") > home.indexOf("portal-editorial-v1.css"),
    "CSS do mural deve vir depois do CSS editorial");
  assert.ok(home.indexOf('id="comunicados"') < home.indexOf('id="ferramentas"'));
  for (const id of ["muralPanel","muralRole","muralRoleHelp","muralPostForm","muralPostTitle",
    "muralPostText","muralFeed","muralFeedback","muralCommentsAllowed"]) {
    assert.ok(home.includes('id="' + id + '"'), "Campo preservado: " + id);
  }
  assert.match(home, /Ambiente de demonstração/);
  assert.match(home, /Tudo reinicia ao atualizar a página/);
});

test("estilo muda a composição com destaque, camadas e responsividade", () => {
  for (const selector of ["mural-social-hero", "mural-post:first-child",
    "mural-composer", "mural-post-actions", "mural-panel", "mural-social-hero-features"]) {
    assert.ok(css.includes(selector), "Seletor esperado: " + selector);
  }
  assert.match(css, /background:\s*linear-gradient\(125deg/);
  assert.match(css, /box-shadow:/);
  assert.match(css, /@media \(max-width:650px\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.doesNotMatch(css, /\.nexo-robot|\.nexo-launcher|\.nexo-panel\b/);
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  let balance = 0;
  for (const ch of noComments) {
    if (ch === "{") balance++;
    if (ch === "}") balance--;
    assert.ok(balance >= 0, "Chaves do CSS em ordem");
  }
  assert.equal(balance, 0, "Chaves CSS equilibradas");
});

test("interações do protótipo continuam disponíveis e não simulam persistência", () => {
  for (const capability of ["like", "thread", "reply", "hide-comment", "remove-post"]) {
    assert.ok(oldMuralJs.includes('"' + capability + '"'), capability);
  }
  assert.match(oldMuralJs, /canPost/);
  assert.match(oldMuralJs, /canComment/);
  assert.match(oldMuralJs, /Sem|demonstração|prototipo/i);
  assert.doesNotMatch(oldMuralJs, /\bfetch\s*\(/);
});

test("laboratório persistente mantém login e armazenamento separados", () => {
  assert.match(lab, /mural-lab\.js/);
  assert.match(lab, /Somente dados fictícios/);
  assert.match(lab, /#feed article:first-child/);
  assert.match(lab, /id="loginForm"/);
  assert.match(lab, /id="postForm"/);
  assert.match(labJs, /Authorization/);
  assert.match(labJs, /api\/laboratorio\/mural\/posts/);
  assert.doesNotMatch(home, /js\/mural-lab\.js/);
  assert.doesNotMatch(home, /id="loginForm"/);
});

test("Nexo e demais módulos não são substituídos pelo redesenho", () => {
  assert.match(home, /js\/nexo-agente\.js/);
  assert.match(home, /js\/nexo-assistente\.js/);
  assert.match(home, /href="gestao-a-vista\.html"/);
  assert.match(home, /href="impressao\.html"/);
  assert.match(home, /href="gestao-documental\.html"/);
});


test("verde original so perde 8% de opacidade no mural e no inicio", () => {
  assert.match(css,/rgba\(18,63,52,\.92\)/);
  assert.match(css,/rgba\(18,78,60,\.92\)/);
  assert.match(css,/rgba\(10,89,69,\.92\)/);
  assert.match(css,/rgba\(18,101,79,\.92\)/);
  assert.match(css,/rgba\(11,81,62,\.92\)/);
  assert.match(css,/rgba\(7,64,54,\.92\)/);
  assert.match(home,/mural-social-v2\.css\?v=20261020-b/);
});

test("atalhos visuais ganham relevo 3D sem alterar os destinos", () => {
  assert.match(css,/\.portal-hero-v3-quick-list a/);
  assert.match(css,/\.portal-home-v3-rail-card a/);
  assert.match(css,/border-bottom:\s*3px solid/);
  assert.match(css,/box-shadow:\s*inset 0 1px 0/);
  assert.match(css,/:hover/);
  assert.match(css,/:active/);
  assert.match(css,/:focus-visible/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(home,/href="gestao-a-vista\.html"/);
  assert.match(home,/href="impressao\.html"/);
  assert.match(home,/href="automacoes\.html"/);
});
