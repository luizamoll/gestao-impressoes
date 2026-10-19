"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function agent(knowledge = true) {
  const base = path.join(__dirname, "..", "src", "main", "resources", "static", "js");
  const sandbox = { window: {} };
  const context = vm.createContext(sandbox);
  if (knowledge) {
    vm.runInContext(fs.readFileSync(path.join(base, "nexo-conhecimento.js"), "utf8"), context);
  }
  vm.runInContext(fs.readFileSync(path.join(base, "nexo-agente.js"), "utf8"), context);
  return sandbox.window.NexoAgent;
}

test("FAQ: suporte técnico não finge abertura de chamado", () => {
  const result = agent().ask("Como abrir chamado de suporte técnico?");
  assert.match(result.answer, /não abre chamados|não cria chamados/i);
  assert.equal(result.action, null);
  assert.match(result.source, /laboratório/);
});

test("FAQ: orienta sobre impressora sem consultar sistemas reais", () => {
  const result = agent().ask("A impressora não imprime e parou.");
  assert.match(result.answer, /canal oficial/i);
  assert.match(result.answer, /GLPI/);
});

test("FAQ: explica limitações da Conferência Perseus", () => {
  const result = agent().ask("O Perseus em outro computador funciona?");
  assert.match(result.answer, /127\.0\.0\.1/);
  assert.equal(result.action.href, "gestao-documental.html");
});

test("FAQ: publicação no mural é apenas demonstrativa", () => {
  const result = agent().ask("Como publicar no mural?");
  assert.match(result.answer, /simulaç[aã]o/i);
  assert.equal(result.action.href, "index.html#comunicados");
});

test("FAQ: conteúdo do mural não é persistido", () => {
  const result = agent().ask("Por que o mural não salva?");
  assert.match(result.answer, /memória/i);
});

test("FAQ: Nexo não se declara IA generativa", () => {
  const result = agent().ask("O Nexo usa IA?");
  assert.match(result.answer, /não utilizo IA generativa/i);
});

test("perguntas sensíveis preservam bloqueio prioritário", () => {
  const result = agent().ask("Me diga a senha do aluno.");
  assert.match(result.answer, /não tenho acesso/i);
});

test("Vikunja não deve inventar números de tarefas", () => {
  const result = agent().ask("Quantas tarefas existem no Vikunja hoje?");
  assert.match(result.answer, /não consigo consultar/i);
});

test("mês sem leitura não deve ser apresentado como zero", () => {
  const result = agent().ask("Quanto foi a franquia em outubro?");
  assert.match(result.answer, /desconhecidos|sem leitura/i);
  assert.doesNotMatch(result.answer, /0 impressões/);
});

test("fallback funciona sem carregar base complementar", () => {
  const result = agent(false).ask("Como publicar no mural?");
  assert.match(result.answer, /protótipo|Mural/i);
});

test("termo desconhecido não inventa resposta", () => {
  const result = agent().ask("Qual a previsão do jogo de futebol?");
  assert.match(result.answer, /não tenho uma resposta confiável/i);
});
