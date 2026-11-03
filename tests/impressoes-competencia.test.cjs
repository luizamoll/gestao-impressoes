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

test("resumo mensal tem prioridade e contadores de vida util ficam recolhidos", () => {
  const mensal = html.indexOf('id="overview"');
  const equipamentos = html.indexOf('id="equipment"');
  const detalhes = html.indexOf('id="contadores-acumulados"');
  assert.ok(mensal > 0 && equipamentos > mensal && detalhes > equipamentos);
  assert.ok(html.includes('<details class="new-readings-disclosure"'));
  assert.ok(!html.includes('<details class="new-readings-disclosure" open'));
  assert.ok(html.includes("Não são consumos mensais"));
  assert.ok(html.includes("Outubro/2026 · competência ainda não apurada"));
  assert.ok(html.includes("Último mês apurado"));
  assert.ok(html.includes("Setembro/2026 · 1.522 impressões"));
});
test("comparativo do mes mostra apenas consumo, com contador bruto recolhido", () => {
  const inicio = html.indexOf('<section class="month-comparison"');
  const fim = html.indexOf('<section class="equipment-section"', inicio);
  const comparacao = html.slice(inicio, fim);
  const detalhes = comparacao.indexOf('<details class="monthly-technical-comparison"');
  const tabela = comparacao.indexOf('<div class="timeline-table-wrap">');
  assert.ok(inicio > 0 && fim > inicio);
  assert.ok(detalhes > 0 && tabela > detalhes);
  assert.match(comparacao, /Consumo mensal confirmado/);
  assert.match(comparacao, /Agosto\/2026[\s\S]*?<strong>1\.016<\/strong>/);
  assert.match(comparacao, /Setembro\/2026 · último mês apurado[\s\S]*?<strong>1\.522<\/strong>/);
  assert.match(comparacao, /Outubro\/2026[\s\S]*?<strong>—<\/strong>/);
  assert.doesNotMatch(comparacao.slice(0, detalhes), /18\.318|19\.757|17\.229/);
  assert.doesNotMatch(comparacao.slice(detalhes, detalhes + 110), /\sopen(?:\s|>)/);
  assert.match(comparacao.slice(tabela), /19\.757/);
});
