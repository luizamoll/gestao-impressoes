"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(
  path.join(__dirname,"../src/main/resources/static/impressao.html"), "utf8"
);

test("outubro e competencia nova, mas consumo, saldo e excedente continuam desconhecidos", () => {
  assert.match(html, /Outubro iniciou uma nova competência\. O consumo ainda não foi apurado/);
  assert.match(html, /Nenhuma leitura de outubro confirmada/);
  assert.match(html, /Aguardando leitura confirmada/);
  assert.match(html, /Saldo disponível<\/span>\s*<strong>—<\/strong>/);
  assert.match(html, /Excedente<\/span>\s*<strong>—<\/strong>/);
  assert.match(html, /Consumo em outubro<\/span>\s*<strong>—<\/strong>/);
  assert.match(html, /Consumo ainda não apurado/);
  assert.match(html, /Não há leitura confirmada de outubro/);
  assert.doesNotMatch(html, /Outubro está zerado|Outubro começou zerado|Outubro permanece separado e começa com consumo mensal igual a zero/);
  assert.doesNotMatch(html, /100% disponível em outubro|0% da franquia mensal · mês em aberto/);
});

test("historico anterior continua separado e a franquia contratual e explicita", () => {
  assert.match(html, /<strong>4\.000<\/strong>\s*<small>limite do mês<\/small>/);
  assert.match(html, /1\.522 impressões de setembro/);
  assert.match(html, /Agosto consumiu 1\.016 impressões e setembro 1\.522/);
  assert.match(html, /Aguardando leitura de outubro/);
});
