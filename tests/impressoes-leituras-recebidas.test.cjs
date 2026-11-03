"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "../src/main/resources/static");
const impressao = fs.readFileSync(path.join(root, "impressao.html"), "utf8");
const gestao = fs.readFileSync(path.join(root, "gestao-a-vista.html"), "utf8");
const app = fs.readFileSync(path.join(root, "js/app.js"), "utf8");
const gestaoLogic = fs.readFileSync(path.join(root, "js/gestao-vista.js"), "utf8");

const leituras = [
  { serie: "BRBST2P00K", anterior: 27582, nova: 28201, diferenca: 619, duplex: "7.763", copias: "995", scanner: "5.465" },
  { serie: "BRBST160GT", anterior: 17468, nova: 17486, diferenca: 18, duplex: "8.593" },
  { serie: "BRBSV730KB", anterior: 56, nova: 1083, diferenca: 1027, duplex: "176", copias: "9", scanner: "233" }
];
const br = n => n.toLocaleString("pt-BR");

test("as 3 fotos de series distintas foram transcritas no cadastro e no painel", () => {
  assert.match(impressao, /recebidos em 03\/11\/2026/i);
  assert.match(gestao, /Relatórios recebidos em 03\/11\/2026/);
  for (const x of leituras) {
    assert.equal(x.nova - x.anterior, x.diferenca, x.serie);
    assert.ok(impressao.includes(x.serie), "serie impressao " + x.serie);
    assert.ok(gestao.includes(x.serie), "serie gestao " + x.serie);
    for (const label of [br(x.anterior), br(x.nova), "+" + br(x.diferenca)]) {
      assert.ok(impressao.includes(label), "impressao " + x.serie + " " + label);
      assert.ok(gestao.includes(label), "gestao " + x.serie + " " + label);
    }
  }
});

test("tabela tecnica usa leitura mais recente por numero de serie", () => {
  const rows = [...impressao.matchAll(/<tr data-search="[^"]+">[\s\S]*?<\/tr>/g)].map(x => x[0]);
  for (const x of leituras) {
    const row = rows.find(row => row.includes(x.serie));
    assert.ok(row, x.serie);
    assert.ok(row.includes("<strong>" + br(x.nova) + "</strong>"), x.serie + " total");
    assert.ok(row.includes("<td>" + x.duplex + "</td>"), x.serie + " frente e verso");
    if (x.copias) assert.ok(row.includes("<td>" + x.copias + "</td>"));
    if (x.scanner) assert.ok(row.includes("<td>" + x.scanner + "</td>"));
  }
  assert.match(impressao, /1\.082,5/); // A4 equivalente do Mestrado difere do contador total 1.083.
  assert.match(impressao, /1\.374/); // Scan para pasta da rede: Graduação/RH.
  assert.match(impressao, /225/); // Scan para pasta da rede: Mestrado.
});

test("duas leituras do Mestrado produzem 1027 no fechamento atribuido a outubro", () => {
  assert.match(impressao, /2 leituras/);
  assert.match(app, /Acréscimo entre leituras/);
  assert.match(app, /Não equivale ao consumo de um mês/);
  assert.doesNotMatch(app, /é necessária uma segunda leitura/);
  assert.match(gestao, /apuração de outubro/);
});

test("outubro fica registrado como periodo informado sem criar dados de novembro", () => {
  assert.match(gestaoLogic, /"2026-09": \{/);
  assert.match(gestaoLogic, /pages: 1522/);
  assert.match(gestaoLogic, /"2026-10": \{\s*pages: 1664/);
  assert.match(impressao, /Contadores de vida útil não são consumo mensal/);
  assert.match(impressao, /data da coleta/);
  assert.match(gestao, /data de coleta/);
});

test("contadores ficam protegidos em detalhes e o resumo mensal permanece visivel", () => {
  assert.match(impressao, /<details class="new-readings-disclosure"/);
  assert.match(gestao, /<details class="gv-latest-readings"/);
  assert.doesNotMatch(impressao, /<details class="new-readings-disclosure"[^>]*\bopen\b/);
  assert.doesNotMatch(gestao, /<details class="gv-latest-readings"[^>]*\bopen\b/);
  assert.ok(impressao.indexOf('id="overview"') < impressao.indexOf('id="contadores-acumulados"'));
  assert.match(gestao, /id="gvRefConsumed">1\.664/);
});

test("cartoes de equipamentos nao destacam acumulados nem totais de vida util", () => {
  const cardStart = impressao.indexOf('class="equipment-cards"');
  const archiveStart = impressao.indexOf('class="equipment-archive"');
  const cards = impressao.slice(cardStart, archiveStart);
  assert.equal((cards.match(/<details class="equipment-counter-detail"/g) || []).length, 3);
  assert.equal((cards.match(/<\/div><\/details>/g) || []).length, 3);
  assert.match(cards, /Consumo em outubro<\/span>\s*<strong>1\.027<\/strong>/);
  assert.doesNotMatch(cards, /Acréscimo entre leituras · não mensal<\/span>/);
  assert.doesNotMatch(cards, /<details class="equipment-counter-detail"[^>]*\sopen(?:\s|>)/);
});

test("tabela e historico de totais acumulados ficam juntos e recolhidos", () => {
  const begin = impressao.indexOf('<details class="equipment-archive"');
  const end = impressao.indexOf('</details>', begin);
  assert.ok(begin > 0 && end > begin);
  const archive = impressao.slice(begin, end);
  assert.match(archive, /Dados técnicos dos relatórios/);
  assert.match(archive, /Histórico de leituras/);
  assert.match(archive, /Leitura total/);
  assert.doesNotMatch(archive.slice(0, 300), /<details[^>]*\sopen(?:\s|>)/);
  assert.match(gestao, /<details class="gv-latest-readings"/);
  const note = gestao.match(/<p class="gv-latest-detail-note">[\s\S]*?<\/p>/)?.[0] || "";
  assert.doesNotMatch(note, /28\.201|17\.486|1\.083/);
});
