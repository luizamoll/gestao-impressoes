"use strict";

// Teste de interface sem browser nem novas dependencias. Exercita o JS real
// com elementos minimos suficientes para verificar sincronizacao e estados vazios.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const script = fs.readFileSync(
  path.join(__dirname, "../src/main/resources/static/js/gestao-vista.js"), "utf8"
);

function mount() {
  const ids = [
    "gvPeriod", "gvOverviewPeriod", "gvConsumed", "gvConsumedNote",
    "gvRemaining", "gvRemainingNote", "gvDelta", "gvDeltaNote",
    "gvInsightText", "gvInsightIcon", "gvInsight", "gvTrend",
    "gvOverviewConsumed", "gvOverviewConsumedNote", "gvOverviewDataNote"
  ];
  const elements = Object.fromEntries(ids.map(id => {
    const handlers = {};
    const classes = new Set();
    return [id, {
      textContent: "",
      value: "",
      handlers,
      classes,
      classList: {
        toggle(name, active) {
          if (active) classes.add(name);
          else classes.delete(name);
        }
      },
      addEventListener(type, fn) { handlers[type] = fn; },
      change() { handlers.change?.(); }
    }];
  }));
  elements.gvPeriod.value = "2026-09";
  elements.gvOverviewPeriod.value = "2026-09";
  const bars = ["2026-08", "2026-09", "2026-10"].map(period => {
    const classes = new Set();
    return {
      dataset: { period },
      classes,
      classList: {
        toggle(name, active) {
          if (active) classes.add(name);
          else classes.delete(name);
        }
      }
    };
  });

  const document = {
    getElementById(id) { return elements[id] || null; },
    querySelectorAll(selector) { return selector === ".gv-bar-row" ? bars : []; }
  };
  vm.runInNewContext(script, { document, window: {} }, { filename: "gestao-vista.js" });
  return { elements, bars };
}

test("setembro inicia igual nos dois modulos", () => {
  const { elements, bars } = mount();
  assert.equal(elements.gvConsumed.textContent, "1.522");
  assert.equal(elements.gvOverviewConsumed.textContent, "1.522");
  assert.equal(elements.gvPeriod.value, "2026-09");
  assert.equal(elements.gvOverviewPeriod.value, "2026-09");
  assert.equal(bars.find(bar => bar.dataset.period === "2026-09").classes.has("gv-bar-selected"), true);
});

test("selecionar agosto na visao geral altera os indicadores de impressoes", () => {
  const { elements, bars } = mount();
  elements.gvOverviewPeriod.value = "2026-08";
  elements.gvOverviewPeriod.change();
  assert.equal(elements.gvPeriod.value, "2026-08");
  assert.equal(elements.gvConsumed.textContent, "1.016");
  assert.equal(elements.gvOverviewConsumed.textContent, "1.016");
  assert.equal(elements.gvRemaining.textContent, "2.984");
  assert.equal(elements.gvDelta.textContent, "—");
  assert.equal(bars.find(bar => bar.dataset.period === "2026-08").classes.has("gv-bar-selected"), true);
});

test("outubro sem leitura nao se transforma em zero nem gera saldo ficticio", () => {
  const { elements, bars } = mount();
  elements.gvPeriod.value = "2026-10";
  elements.gvPeriod.change();
  assert.equal(elements.gvOverviewPeriod.value, "2026-10");
  assert.equal(elements.gvConsumed.textContent, "—");
  assert.equal(elements.gvOverviewConsumed.textContent, "—");
  assert.equal(elements.gvRemaining.textContent, "—");
  assert.match(elements.gvOverviewDataNote.textContent, /desconhecido, não zero/);
  assert.match(elements.gvOverviewConsumedNote.textContent, /sem leitura confirmada/);
  assert.equal(bars.find(bar => bar.dataset.period === "2026-10").classes.has("gv-bar-selected"), true);
  assert.equal(elements.gvInsight.classes.has("gv-insight-neutral"), true);
});

test("trocar de outubro para setembro recupera dados apurados", () => {
  const { elements } = mount();
  elements.gvOverviewPeriod.value = "2026-10";
  elements.gvOverviewPeriod.change();
  elements.gvOverviewPeriod.value = "2026-09";
  elements.gvOverviewPeriod.change();
  assert.equal(elements.gvConsumed.textContent, "1.522");
  assert.equal(elements.gvRemaining.textContent, "2.478");
  assert.equal(elements.gvDelta.textContent, "+506");
  assert.equal(elements.gvTrend.classes.has("gv-trend-bad"), true);
});
