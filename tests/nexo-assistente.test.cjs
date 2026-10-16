"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const script = fs.readFileSync(
  path.join(__dirname, "../src/main/resources/static/js/nexo-assistente.js"),
  "utf8"
);

function mount() {
  const events = {};
  const elements = {};
  let host = null;
  const ids = ["nexo-toggle", "nexo-panel", "nexo-close", "nexo-explain", "nexo-help-answer"];
  for (const id of ids) {
    elements[id] = {
      hidden: id === "nexo-panel" || id === "nexo-help-answer",
      attributes: {},
      handlers: {},
      focused: false,
      addEventListener(type, callback) { this.handlers[type] = callback; },
      setAttribute(name, value) { this.attributes[name] = value; },
      focus() { this.focused = true; },
      click() { this.handlers.click?.(); }
    };
  }
  const document = {
    body: { append(item) { host = item; } },
    createElement(tag) {
      assert.equal(tag, "div");
      return { id: "", className: "", innerHTML: "" };
    },
    getElementById(id) {
      if (id === "nexo-widget") return host;
      return elements[id] || null;
    },
    addEventListener(type, callback) { events[type] = callback; }
  };
  vm.runInNewContext(script, { document });
  return { elements, events, get host() { return host; } };
}

test("robo e atalhos sao locais, sem API, credenciais ou dados ficticios", () => {
  const ui = mount();
  assert.equal(ui.host.id, "nexo-widget");
  assert.match(ui.host.innerHTML, /assets\/nexo-robo\.svg/);
  for (const link of ["index.html#comunicados", "index.html#ferramentas",
                      "gestao-a-vista.html", "impressao.html", "automacoes.html"]) {
    assert.ok(ui.host.innerHTML.includes('href="' + link + '"'));
  }
  assert.match(ui.host.innerHTML, /IA não conectada/);
  assert.doesNotMatch(script, /\bfetch\s*\(|localStorage|\bWebSocket\b/);
});

test("clique abre e fecha painel, atualiza aria e restaura foco", () => {
  const { elements } = mount();
  const toggle = elements["nexo-toggle"], panel = elements["nexo-panel"];
  assert.equal(panel.hidden, true);
  toggle.click();
  assert.equal(panel.hidden, false);
  assert.equal(toggle.attributes["aria-expanded"], "true");
  assert.equal(elements["nexo-close"].focused, true);
  elements["nexo-close"].click();
  assert.equal(panel.hidden, true);
  assert.equal(toggle.attributes["aria-expanded"], "false");
  assert.equal(toggle.focused, true);
});

test("Escape fecha e explicacao funciona sem simular uma IA", () => {
  const { elements, events } = mount();
  elements["nexo-toggle"].click();
  elements["nexo-explain"].click();
  assert.equal(elements["nexo-help-answer"].hidden, false);
  assert.equal(elements["nexo-explain"].attributes["aria-expanded"], "true");
  assert.match(script, /não acesso dados de alunos ou projetos/);
  events.keydown({ key: "Escape" });
  assert.equal(elements["nexo-panel"].hidden, true);
});

test("o balao fica fora do corpo e o robo conserva proporcao", () => {
  const css = fs.readFileSync(
    path.join(__dirname, "../src/main/resources/static/css/nexo-assistente.css"), "utf8"
  );
  const launcher = css.match(/\.nexo-launcher \{([\s\S]*?)\}/)?.[1] || "";
  const robot = css.match(/\.nexo-launcher-avatar \{([\s\S]*?)\}/)?.[1] || "";
  const bubble = css.match(/\.nexo-launcher-label \{([\s\S]*?)\}/)?.[1] || "";
  assert.match(launcher, /height:\s*137px/);
  assert.match(robot, /aspect-ratio:\s*180\s*\/\s*206/);
  assert.match(robot, /height:\s*auto/);
  assert.match(bubble, /top:\s*-27px/);
  assert.match(bubble, /right:\s*30px/);
  assert.match(css, /\.nexo-launcher-label::after\s*\{/);
  assert.match(css, /\.nexo-launcher\[aria-expanded="true"\] \.nexo-launcher-label\s*\{\s*display:\s*none/);
  assert.match(css, /@media\(max-width:\s*600px\)/);
});
