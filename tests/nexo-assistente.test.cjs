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
const agentScript = fs.readFileSync(
  path.join(__dirname, "../src/main/resources/static/js/nexo-agente.js"), "utf8"
);

function mount(options = {}) {
  const events = {};
  const elements = {};
  let host = null;
  const ids = ["nexo-toggle", "nexo-panel", "nexo-close", "nexo-explain", "nexo-help-answer",
    "nexo-robot", "nexo-panel-robot", "nexo-tip", "nexo-copy", "nexo-feedback",
    "nexo-chat-form", "nexo-chat-input", "nexo-chat-log", "nexo-chat-submit",
    "nexo-lab-toggle", "nexo-chat-disclosure", "nexo-disclaimer"];
  for (const id of ids) {
    elements[id] = {
      hidden: id === "nexo-panel" || id === "nexo-help-answer" || id === "nexo-feedback",
      value: "", textContent: "", children: [],
      append(child) { this.children.push(child); child.parent = this; },
      get firstElementChild() { return this.children[0]; },
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
      assert.ok(["div", "p", "small", "a"].includes(tag));
      return {
        id: "", className: "", innerHTML: "", dataset: {},
        textContent: "", children: [],
        append(child) { this.children.push(child); child.parent = this; },
        remove() {
          if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1);
        }
      };
    },
    getElementById(id) {
      if (id === "nexo-widget") return host;
      return elements[id] || null;
    },
    querySelector(query) {
      if (query === ".nexo-chat-disclosure") return elements["nexo-chat-disclosure"];
      if (query === ".nexo-disclaimer") return elements["nexo-disclaimer"];
      return null;
    },
    addEventListener(type, callback) { events[type] = callback; }
  };
  const window = { location: {
    href: "http://127.0.0.1:18081/" + (options.pathname || "index.html"),
    pathname: "/" + (options.pathname || "index.html")
  }};
  const navigator = { clipboard: options.clipboard };
  vm.runInNewContext(agentScript, { window });
  vm.runInNewContext(script, { document, window, navigator, fetch: options.fetch });
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
  assert.doesNotMatch(script, /localStorage|sessionStorage|\bWebSocket\b/);
  assert.match(script, /fetch\(NEXO_LOCAL_URL/);
  assert.match(script, /credentials: "omit"/);
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
  assert.match(ui.elements["nexo-robot"].src, /nexo-robo-saudacao\.svg/);
  ui.elements["nexo-close"].click();
  assert.equal(ui.host.dataset.nexoEmotion, "normal");
});

test("expandir explicacao realmente muda para respondendo", () => {
  const ui = mount();
  ui.elements["nexo-toggle"].click();
  ui.elements["nexo-explain"].click();
  assert.equal(ui.host.dataset.nexoEmotion, "respondendo");
  assert.match(ui.elements["nexo-panel-robot"].src, /nexo-robo-respondendo\.svg/);
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
  assert.match(copied, /127\.0\.0\.1:18081/);
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
  assert.match(ui.elements["nexo-feedback"].textContent, /Ctrl\+L e Ctrl\+C/);
});

test("as seis expressoes preservam a mesma estrutura do uniforme e a marca", () => {
  const root = path.join(__dirname, "../src/main/resources/static/assets");
  const base = fs.readFileSync(path.join(root, "nexo-robo.svg"), "utf8");
  const logo = base.match(/M402,230 390,242/);
  assert.doesNotMatch(base, /M64 157Q90 163 115 157/, "Blusa padrao nao deve ter bolso.");
  assert.ok(logo);
  const faces = ["saudacao","pensando","respondendo","confirmacao","dica"];
  for (const emotion of faces) {
    const svg = fs.readFileSync(path.join(root, "nexo-robo-" + emotion + ".svg"), "utf8");
    assert.match(svg, /viewBox="0 0 180 206"/);
    assert.ok(svg.includes(logo[0]), "Logo precisa permanecer no uniforme: " + emotion);
    assert.match(svg, /M54 123Q72 114 90 114/);
    assert.doesNotMatch(svg, /M64 157Q90 163 115 157/, "Blusa sem bolso: " + emotion);
    assert.doesNotMatch(svg, /#[0-9a-f]{0,2}(?:00ff00|008000|075641)/i);
  }
});

test("conversa local transforma pergunta em resposta e acao com fonte", () => {
  const ui = mount();
  const input = ui.elements["nexo-chat-input"];
  const form = ui.elements["nexo-chat-form"];
  const log = ui.elements["nexo-chat-log"];
  input.value = "Onde fica o mural?";
  let prevented = false;
  form.handlers.submit({ preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(input.value, "");
  assert.equal(log.children.length, 2);
  assert.equal(log.children[0].children[0].textContent, "Onde fica o mural?");
  const assistant = log.children[1];
  assert.match(assistant.children[0].textContent, /Mural/);
  assert.equal(assistant.children[2].href, "index.html#comunicados");
  assert.equal(ui.host.dataset.nexoEmotion, "respondendo");
});

test("agente nao transforma texto do usuario em HTML nem acessa a rede", () => {
  const ui = mount();
  const input = ui.elements["nexo-chat-input"];
  const form = ui.elements["nexo-chat-form"];
  input.value = "<img src=x onerror=alert(1)>";
  form.handlers.submit({ preventDefault() {} });
  const user = ui.elements["nexo-chat-log"].children[0].children[0];
  assert.equal(user.textContent, "<img src=x onerror=alert(1)>");
  assert.equal(user.innerHTML, "");
  assert.match(script, /labEnabled && isLocalPortal/);
  assert.equal(script.includes("localStorage"), false);
  assert.equal(script.includes("sessionStorage"), false);
});

test("conversa nao mantem mais que doze mensagens em memoria da pagina", () => {
  const ui = mount();
  const input = ui.elements["nexo-chat-input"];
  const form = ui.elements["nexo-chat-form"];
  for (let i=0; i<8; i++) {
    input.value = "oi";
    form.handlers.submit({ preventDefault() {} });
  }
  assert.equal(ui.elements["nexo-chat-log"].children.length, 12);
});

test("modo IA exige opt-in e envia somente para o servidor loopback", async () => {
  const requests = [];
  const ui = mount({ fetch: async (url, opts) => {
    requests.push({ url, opts });
    return { ok: true, async json() {
      return { modo: "laboratorio_local", dados_reais: false,
        resposta: "Outubro sem leitura confirmada.", fontes: ["histórico demonstrativo"],
        ferramentas: ["consultar_impressoes"], duracao_s: 0.0 };
    }};
  }});
  const toggle = ui.elements["nexo-lab-toggle"];
  assert.equal(toggle.hidden, false);
  assert.equal(requests.length, 0);
  toggle.click();
  assert.equal(toggle.attributes["aria-pressed"], "true");
  assert.equal(toggle.textContent, "Voltar ao modo de regras");
  ui.elements["nexo-chat-input"].value = "Qual o consumo de outubro?";
  await ui.elements["nexo-chat-form"].handlers.submit({ preventDefault() {} });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "http://127.0.0.1:18767/chat");
  assert.equal(requests[0].opts.credentials, "omit");
  assert.equal(requests[0].opts.method, "POST");
  assert.match(JSON.parse(requests[0].opts.body).pergunta, /outubro/);
  assert.equal(ui.elements["nexo-chat-log"].children[1].children[0].textContent, "Outubro sem leitura confirmada.");
  assert.match(ui.elements["nexo-chat-log"].children[1].children[1].textContent, /histórico demonstrativo/);
  assert.equal(ui.elements["nexo-chat-input"].disabled, false);
  toggle.click();
  assert.equal(toggle.attributes["aria-pressed"], "false");
  ui.elements["nexo-chat-input"].value = "Onde fica o mural?";
  await ui.elements["nexo-chat-form"].handlers.submit({ preventDefault() {} });
  assert.equal(requests.length, 1, "Modo de regras não consulta IA");
});

test("falha do servidor local não simula resposta do modelo", async () => {
  const ui = mount({ fetch: async () => { throw new Error("offline"); } });
  ui.elements["nexo-lab-toggle"].click();
  ui.elements["nexo-chat-input"].value = "Explique IA";
  await ui.elements["nexo-chat-form"].handlers.submit({ preventDefault() {} });
  const log = ui.elements["nexo-chat-log"].children;
  assert.match(log[1].children[0].textContent, /Não consegui acessar o Nexo local/);
  assert.equal(ui.elements["nexo-chat-input"].disabled, false);
});
