"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const html = fs.readFileSync(path.join(__dirname,"../src/main/resources/static/impressao.html"),"utf8");

test("outubro informado tem consumo por serie, franquia, saldo e excedente coerentes",()=>{
  const a = 28201-27582, b = 17486-17468, c = 1083-56;
  assert.equal(a,619);assert.equal(b,18);assert.equal(c,1027);
  assert.equal(a+b+c,1664);
  assert.equal(4000-(a+b+c),2336);
  assert.equal(Math.round((a+b+c)/4000*1000)/10,41.6);
  assert.ok(html.includes('Outubro/2026 · apuração informada pela responsável'));
  assert.match(html,/Consumido em outubro<\/span><strong>1\.664<\/strong>/);
  assert.match(html,/Saldo disponível<\/span><strong>2\.336<\/strong>/);
  assert.match(html,/Excedente<\/span><strong>0<\/strong>/);
  assert.match(html,/Custo do excedente<\/span><strong>R\$ 0,00<\/strong>/);
  assert.ok(html.includes("relatórios não mostram a data da coleta"));
});

test("tres meses aparecem com apenas consumo em destaque, sem contadores brutos",()=>{
  const start = html.indexOf('<section class="month-comparison"');
  const end = html.indexOf('<section class="equipment-section"',start);
  const block = html.slice(start,end);
  const tech = block.indexOf('<details class="monthly-technical-comparison"');
  assert.ok(start>0 && end>start && tech>0);
  const visible = block.slice(0,tech);
  for(const value of ["1.016","1.522","1.664"])assert.ok(visible.includes("<strong>"+value+"</strong>"));
  assert.doesNotMatch(visible,/18\.318|19\.757|17\.229|28\.201|17\.486/);
  assert.match(block.slice(tech),/19\.757|28\.201/);
  assert.ok(html.indexOf('id="overview"') < html.indexOf('id="equipment"'));
});

test("contadores técnicos permanecem recolhidos e mensais nos cartões",()=>{
  assert.ok(html.includes('<details class="new-readings-disclosure"'));
  assert.ok(html.includes('<details class="equipment-archive"'));
  assert.equal((html.match(/<details class="equipment-counter-detail"/g)||[]).length,3);
  assert.match(html,/Consumo em outubro<\/span>\s*<strong>1\.027<\/strong>/);
  assert.match(html,/Consumo em outubro<\/span>\s*<strong>619<\/strong>/);
  assert.match(html,/Consumo em outubro<\/span>\s*<strong>18<\/strong>/);
});
