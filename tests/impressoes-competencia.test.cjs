"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(
  path.join(__dirname,"../src/main/resources/static/impressao.html"), "utf8"
);

test("outubro e competencia nova, mas consumo, saldo e excedente continuam desconhecidos", () => {
  assert.ok(html.includes('Outubro ainda não tem consumo mensal confirmado'));
  assert.ok(html.includes('Sem leitura com data confirmada de outubro'));
  assert.match(html, /Aguardando leitura confirmada/);
  assert.match(html, /Saldo disponível<\/span>\s*<strong>—<\/strong>/);
  assert.match(html, /Excedente<\/span>\s*<strong>—<\/strong>/);
  assert.match(html, /Consumo em outubro<\/span>\s*<strong>—<\/strong>/);
  assert.match(html, /Consumo ainda não apurado/);
  assert.ok(html.includes('não há leitura com data confirmada de outubro'));
  assert.doesNotMatch(html, /Outubro está zerado|Outubro começou zerado|Outubro permanece separado e começa com consumo mensal igual a zero/);
  assert.doesNotMatch(html, /100% disponível em outubro|0% da franquia mensal · mês em aberto/);
});

test("historico anterior continua separado e a franquia contratual e explicita", () => {
  assert.match(html, /<strong>4\.000<\/strong>\s*<small>limite do mês<\/small>/);
  assert.match(html, /1\.522 impressões de setembro/);
  assert.match(html, /Agosto consumiu 1\.016 impressões e setembro 1\.522/);
  assert.match(html, /Aguardando leitura de outubro/);
});

test("leituras novas precedem apuracao ainda pendente", () => {
  const i = html.indexOf('id="overview"');
  const j = html.indexOf('id="monthly-overview"');
  const k = html.indexOf('id="equipment"');
  assert.ok(i > 0 && j > i && k > j);
  assert.ok(html.includes("Não são consumos mensais"));
  assert.ok(html.includes("Outubro/2026 · competência ainda não apurada"));
});