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

function mount(options = {}) {
  const events = {};
  const elements = {};
  let host = null;
  const ids = ["nexo-toggle", "nexo-panel", "nexo-close", "nexo-explain", "nexo-help-answer",
    "nexo-robot", "nexo-panel-robot", "nexo-tip", "nexo-copy", "nexo-feedback"];
  for (const id of ids) {
    elements[id] = {
      hidden: id === "nexo-panel" || id === "nexo-help-answer" || id === "nexo-feedback",
      attributes: {},
      handlers: {},
      focused: false,
      addEventListener(type, callback) { this.handlers[type] = callback; },
      setAttribute(name, value) { this.attributes[name] = value; },
      focus() { this.focused = true; },
      click() { return this.handlers.click?.(); }
    };
  }
  const document = {
    body: { append(item) { host = item; } },
    createElement(tag) {
      assert.equal(tag, "div");
      return { id: "", className: "", innerHTML: "", dataset: {} };
    },
    getElementById(id) {
      if (id === "nexo-widget") return host;
      return elements[id] || null;
    },
    addEventListener(type, callback) { events[type] = callback; }
  };
  const window = { location: {
    href: "http://127.0.0.1:18081/" + (options.pathname || "index.html"),
    pathname: "/" + (options.pathname || "index.html")
  }};
  const navigator = { clipboard: options.clipboard };
  vm.runInNewContext(script, { document, window, navigator });
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

test("abertura usa saudacao e fechamento volta ao estado normal", () => {
  const ui = mount();
  assert.equal(ui.host.dataset.nexoEmotion, "normal");
  ui.elements["nexo-toggle"].click();
  assert.equal(ui.host.dataset.nexoEmotion, "saudacao");
  assert.match(ui.elements["nexo-robot"].src, /nexo-robo-saudacao\\.svg/);
  ui.elements["nexo-close"].click();
  assert.equal(ui.host.dataset.nexoEmotion, "normal");
});

test("expandir explicacao realmente muda para respondendo", () => {
  const ui = mount();
  ui.elements["nexo-toggle"].click();
  ui.elements["nexo-explain"].click();
  assert.equal(ui.host.dataset.nexoEmotion, "respondendo");
  assert.match(ui.elements["nexo-panel-robot"].src, /nexo-robo-respondendo\\.svg/);
});

test("dica contextual so aparece sob solicitacao e nao utiliza rede", () => {
  const ui = mount({ pathname: "gestao-a-vista.html" });
  ui.elements["nexo-toggle"].click();
  assert.equal(ui.elements["nexo-feedback"].hidden, true);
  ui.elements["nexo-tip"].click();
  assert.equal(ui.host.dataset.nexoEmotion, "dica");
  assert.equal(ui.elements["nexo-feedback"].hidden, false);
  assert.match(ui.elements["nexo-feedback"].textContent, /Outubro ainda está sem leitura/);
});

test("pensando so durante copia assincrona real e confirma apenas ao concluir", async () => {
  let finish;
  let copied;
  const gate = new Promise(resolve => { finish = resolve; });
  const ui = mount({ clipboard: {
    async writeText(value) { copied = value; await gate; }
  }});
  ui.elements["nexo-toggle"].click();
  const pending = ui.elements["nexo-copy"].click();
  assert.equal(ui.host.dataset.nexoEmotion, "pensando");
  assert.equal(ui.elements["nexo-copy"].disabled, true);
  assert.match(copied, /127\\.0\\.0\\.1:18081/);
  finish();
  await pending;
  assert.equal(ui.host.dataset.nexoEmotion, "confirmacao");
  assert.equal(ui.elements["nexo-copy"].disabled, false);
  assert.match(ui.elements["nexo-feedback"].textContent, /copiado/);
});

test("copia indisponivel nao informa conclusao nem usa confirmacao", async () => {
  const ui = mount();
  ui.elements["nexo-toggle"].click();
  await ui.elements["nexo-copy"].click();
  assert.equal(ui.host.dataset.nexoEmotion, "respondendo");
  assert.match(ui.elements["nexo-feedback"].textContent, /Ctrl\\+L e Ctrl\\+C/);
});

test("as seis expressoes preservam a mesma estrutura do uniforme e a marca", () => {
  const root = path.join(__dirname, "../src/main/resources/static/assets");
  const base = fs.readFileSync(path.join(root, "nexo-robo.svg"), "utf8");
  const logo = base.match(/M402,230 390,242/);
  assert.ok(logo);
  const faces = ["saudacao","pensando","respondendo","confirmacao","dica"];
  for (const emotion of faces) {
    const svg = fs.readFileSync(path.join(root, "nexo-robo-" + emotion + ".svg"), "utf8");
    assert.match(svg, /viewBox="0 0 180 206"/);
    assert.ok(svg.includes(logo[0]), "Logo precisa permanecer no uniforme: " + emotion);
    assert.match(svg, /M54 123Q72 114 90 114/);
    assert.doesNotMatch(svg, /#[0-9a-f]{0,2}(?:00ff00|008000|075641)/i);
  }
});
