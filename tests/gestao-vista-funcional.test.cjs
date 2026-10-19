"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const root = path.join(__dirname, "../src/main/resources/static");
const script = fs.readFileSync(path.join(root,"js/gestao-vista.js"),"utf8");
const html = fs.readFileSync(path.join(root,"gestao-a-vista.html"),"utf8");
const css = fs.readFileSync(path.join(root,"css/gestao-funcional.css"),"utf8");

function mount() {
  const elementIds = [
    "gvPeriod","gvOverviewPeriod","gvConsumed","gvConsumedNote",
    "gvRemaining","gvRemainingNote","gvDelta","gvDeltaNote",
    "gvInsightText","gvInsightIcon","gvInsight","gvTrend",
    "gvOverviewConsumed","gvOverviewConsumedNote","gvOverviewDataNote",
    "gvOverviewUsage","gvOverviewUsageNote","gvOverviewUsageTrack",
    "gvOverviewUsageFill","gvOverviewRemaining","gvOverviewDelta",
    "gvDetailUsage","gvDetailUsageTrack","gvDetailUsageFill",
    "gvDownloadCsv","gvPrintReport"
  ];
  function el() {
    const classes = new Set(), attrs = {}, listeners = {};
    return { classes, attrs, listeners, style:{}, dataset:{}, hidden:false, textContent:"", value:"",
      classList:{toggle(k,on){if(on)classes.add(k);else classes.delete(k);},contains(k){return classes.has(k);}},
      setAttribute(k,v){attrs[k]=String(v);},
      removeAttribute(k){delete attrs[k];},
      addEventListener(k,cb){listeners[k]=cb;},
      fire(k){if(!listeners[k])throw Error("Listener nao conectado: "+k);listeners[k]();}
    };
  }
  const elements = Object.fromEntries(elementIds.map(id=>[id,el()]));
  elements.gvPeriod.value = elements.gvOverviewPeriod.value = "2026-09";
  const bars=["2026-08","2026-09","2026-10"].map(period=>{
    const a=el();a.dataset.period=period;return a;
  });
  const buttons=["2026-08","2026-09","2026-10"].map(period=>{
    const a=el();a.dataset.gvPeriodTarget=period;return a;
  });
  const downloaded = {blob:null,filename:null,revoked:[],printed:0,clicked:0};
  const document = {
    getElementById(id){return elements[id]||null;},
    querySelectorAll(selector) {
      if(selector===".gv-bar-row")return bars;
      if(selector==="[data-gv-period-target]")return buttons;
      return [];
    },
    createElement(name) {
      assert.equal(name,"a");
      const a={download:"",href:"",hidden:false,
        click(){downloaded.clicked++;downloaded.filename=a.download;},
        remove(){downloaded.removed=true;}};
      return a;
    },
    body:{appendChild() { downloaded.appended=true; }}
  };
  class BlobStub {
    constructor(parts,opts) { this.parts=parts;this.type=opts.type;downloaded.blob=this; }
  }
  const URLStub={
    createObjectURL(blob){ assert.equal(downloaded.blob,blob);return "blob:mock-csv"; },
    revokeObjectURL(url){downloaded.revoked.push(url);}
  };
  const window={print(){downloaded.printed++;}};
  vm.runInNewContext(script,{document,window,Blob:BlobStub,URL:URLStub},{filename:"gestao-vista.js"});
  return { elements,bars,buttons,downloaded };
}

test("painel inicial apresenta 38,1% e barra sincronizada",()=>{
  const {elements,buttons}=mount();
  assert.equal(elements.gvOverviewUsage.textContent,"38,1%");
  assert.equal(elements.gvDetailUsage.textContent,"38,1%");
  assert.equal(elements.gvOverviewUsageFill.style.width,"38.05%");
  assert.equal(elements.gvDetailUsageFill.style.width,"38.05%");
  assert.equal(elements.gvOverviewUsageTrack.attrs["aria-valuenow"],"38.1");
  assert.equal(elements.gvOverviewRemaining.textContent,"2.478");
  assert.equal(elements.gvOverviewDelta.textContent,"+506");
  assert.deepEqual(buttons.map(b=>b.attrs["aria-pressed"]),["false","true","false"]);
});

test("clicar agosto na comparacao seleciona competencias, percentuais e acessibilidade",()=>{
  const {elements,bars,buttons}=mount();
  buttons[0].fire("click");
  assert.equal(elements.gvPeriod.value,"2026-08");
  assert.equal(elements.gvOverviewPeriod.value,"2026-08");
  assert.equal(elements.gvConsumed.textContent,"1.016");
  assert.equal(elements.gvOverviewUsage.textContent,"25,4%");
  assert.equal(elements.gvDetailUsageFill.style.width,"25.40%");
  assert.equal(elements.gvOverviewRemaining.textContent,"2.984");
  assert.equal(elements.gvOverviewDelta.textContent,"—");
  assert.equal(bars[0].classes.has("gv-bar-selected"),true);
  assert.deepEqual(buttons.map(b=>b.attrs["aria-pressed"]),["true","false","false"]);
});

test("outubro mostra leitura ausente, nao zero, sem porcentagem acessivel falsa",()=>{
  const {elements,buttons}=mount();
  buttons[2].fire("click");
  assert.equal(elements.gvConsumed.textContent,"—");
  assert.equal(elements.gvRemaining.textContent,"—");
  assert.equal(elements.gvOverviewRemaining.textContent,"—");
  assert.equal(elements.gvOverviewDelta.textContent,"—");
  assert.equal(elements.gvOverviewUsage.textContent,"—");
  assert.equal(elements.gvDetailUsage.textContent,"—");
  assert.equal(elements.gvDetailUsageFill.style.width,"0%");
  assert.equal(elements.gvOverviewUsageTrack.attrs["aria-valuenow"],undefined);
  assert.match(elements.gvOverviewUsageTrack.attrs["aria-valuetext"],/consumo desconhecido/);
  assert.ok(elements.gvDetailUsageTrack.classes.has("gv-usage-unavailable"));
  assert.match(elements.gvOverviewUsageNote.textContent,/não é zero/);
  buttons[1].fire("click");
  assert.equal(elements.gvOverviewUsage.textContent,"38,1%");
  assert.equal(elements.gvOverviewUsageTrack.attrs["aria-valuenow"],"38.1");
  assert.equal(elements.gvDetailUsageTrack.classes.has("gv-usage-unavailable"),false);
});

test("CSV exporta dois meses conhecidos e outubro vazio, com fonte e formato Excel",()=>{
  const {elements,downloaded}=mount();
  elements.gvDownloadCsv.fire("click");
  assert.equal(downloaded.clicked,1);
  assert.equal(downloaded.filename,"portal-unh-historico-impressoes-2026.csv");
  assert.equal(downloaded.blob.type,"text/csv;charset=utf-8");
  const csv=downloaded.blob.parts.join("");
  assert.ok(csv.startsWith("\uFEFF"),"BOM UTF-8");
  const lines=csv.trim().split("\r\n");
  assert.equal(lines.length,4,"cabecalho + agosto + setembro + outubro");
  assert.match(lines[1],/^"2026-08";"historico";"1016";"4000";"2984";"25,4";"";/);
  assert.match(lines[2],/^"2026-09";"historico";"1522";"4000";"2478";"38,1";"506";/);
  assert.match(lines[3],/^"2026-10";"nao_apurado";"";"4000";"";"";"";/);
  assert.match(csv,/sem sincronizacao automatica/);
  assert.ok(downloaded.removed);
  assert.deepEqual(downloaded.revoked,["blob:mock-csv"]);
});

test("botao de impressao abre dialogo e folha esconde os elementos interativos",()=>{
  const {elements,downloaded}=mount();
  elements.gvPrintReport.fire("click");
  assert.equal(downloaded.printed,1);
  assert.match(css,/@media print/);
  assert.match(css,/\.gv-workspace-sidebar,/);
  assert.match(css,/#gv-impressao-view\[hidden\]/);
  assert.match(css,/\.gv-report-actions\s*\{\s*display:none!important/);
  assert.match(html,/id="gvDownloadCsv"/);
  assert.match(html,/id="gvPrintReport"/);
  assert.match(html,/gestao-funcional\.css\?v=20261019-v1/);
});

test("nao envia os dados historicos para servidores externos",()=>{
  assert.doesNotMatch(script,/localStorage|sessionStorage/);
  assert.match(script,/Historico demonstrativo do projeto/);
});
