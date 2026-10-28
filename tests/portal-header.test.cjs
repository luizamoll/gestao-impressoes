"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "../src/main/resources/static");
const pages = [
  ["index.html", "index.html"],
  ["aplicativos.html", "aplicativos.html"],
  ["gestao-a-vista.html", "gestao-a-vista.html"]
];
const standardLinks = ["index.html", "aplicativos.html", "gestao-a-vista.html"];

test("cabecalho e marca institucional identicos nas tres paginas principais", () => {
  const logos = new Set();
  for (const [file, active] of pages) {
    const html = fs.readFileSync(path.join(root, file), "utf8");
    assert.match(html, /css\/unh-site-header\.css\?v=/, file);
    assert.equal((html.match(/<header class="unh-site-header"/g) || []).length, 1, file);
    const header = html.match(/<header class="unh-site-header"[^>]*>[\s\S]*?<\/header>/)?.[0];
    assert.ok(header, file);
    const brand = header.match(/<a class="unh-site-brand"[\s\S]*?<\/a>/)?.[0];
    assert.ok(brand, file);
    assert.match(brand, /Portal UNH/);
    const logo = brand.match(/src="([^"]+)"/)?.[1];
    logos.add(logo);
    for (const href of standardLinks) {
      assert.ok(header.includes(`href="${href}"`), `${file} missing ${href}`);
    }
    const current = header.match(/<a href="([^"]+)" aria-current="page"/g) || [];
    assert.equal(current.length, 1, file);
    assert.ok(current[0].includes(`href="${active}"`), file);
  }
  assert.deepEqual([...logos], ["assets/portal-unh-simbolo.svg"]);
});

test("cabecalho compartilhado preserva altura aprovada e painel preserva pesquisa", () => {
  const css = fs.readFileSync(path.join(root,"css/unh-site-header.css"),"utf8");
  const dashboardCss = fs.readFileSync(path.join(root,"css/gestao-dashboard-ref-v1.css"),"utf8");
  const dashboard = fs.readFileSync(path.join(root,"gestao-a-vista.html"),"utf8");
  assert.match(css, /height:76px/);
  assert.match(css, /\.gv-ref-body > \.unh-site-header \{ grid-area:site/);
  assert.match(dashboardCss, /grid-template-areas: "site site site"/);
  assert.match(dashboardCss, /top: 76px;/);
  assert.match(dashboard, /id="gvRefSearch"/);
  assert.match(dashboard, /id="gvRefMenuToggle"/);
});
