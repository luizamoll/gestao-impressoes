"use strict";
// Protótipo com dados históricos fixos. Não consultar API nem apresentar tempo real.
(() => {
 const select=document.getElementById("gvPeriod");
 if(!select)return;
 const data={
  "2026-08":{
    consumed:"1.016",note:"Impressões em agosto",remaining:"2.984",remainingNote:"Após o consumo do mês",
    delta:"—",deltaNote:"Sem mês anterior comparável",
    insight:"Agosto registra 1.016 impressões, ou 25,4% da franquia. Sem histórico anterior confirmado para comparar.",status:"neutral",symbol:"●"
  },
  "2026-09":{
    consumed:"1.522",note:"Impressões em setembro",remaining:"2.478",remainingNote:"Após o consumo do mês",
    delta:"+506",deltaNote:"+49,8% versus agosto",
    insight:"De agosto para setembro, o consumo aumentou 506 impressões (+49,8%). Vale acompanhar essa variação.",status:"bad",symbol:"↗"
  },
  "2026-10":{
    consumed:"—",note:"Consumo ainda não apurado",remaining:"—",remainingNote:"Saldo depende da leitura atual",
    delta:"—",deltaNote:"Sem comparação disponível",
    insight:"Outubro é uma competência nova, mas não há leitura suficiente para determinar consumo. Ausência de registro não significa zero impressões.",status:"neutral",symbol:"○"
  }
 };
 function render(){
  const d=data[select.value];if(!d)return;
  document.getElementById("gvConsumed").textContent=d.consumed;
  document.getElementById("gvConsumedNote").textContent=d.note;
  document.getElementById("gvRemaining").textContent=d.remaining;
  document.getElementById("gvRemainingNote").textContent=d.remainingNote;
  document.getElementById("gvDelta").textContent=d.delta;
  document.getElementById("gvDeltaNote").textContent=d.deltaNote;
  document.getElementById("gvInsightText").textContent=d.insight;
  document.getElementById("gvInsightIcon").textContent=d.symbol;
  document.getElementById("gvInsight").classList.toggle("gv-insight-neutral",d.status==="neutral");
  document.getElementById("gvTrend").classList.toggle("gv-trend-bad",d.status==="bad");
  document.querySelectorAll(".gv-bar-row").forEach(row=>row.classList.toggle("gv-bar-selected",row.dataset.period===select.value));
 }
 select.addEventListener("change",render);render();
})();
