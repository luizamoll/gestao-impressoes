"use strict";

/**
 * Motor de intencoes v1 do Nexo. Totalmente local, sem IA generativa.
 * Primeiro agente experimental: interpreta um pedido, seleciona uma resposta
 * e pode propor UM link explicitamente aprovado; nunca executa a navegacao.
 *
 * Dados historicos de laboratorio, NAO institucionalmente homologados.
 * Nunca adicionar dados pessoais, tokens, URLs internos ou segredos aqui.
 */
(() => {
  const safeLinks = Object.freeze({
    mural: Object.freeze({ href: "index.html#comunicados", label: "Ir ao mural" }),
    ferramentas: Object.freeze({ href: "index.html#ferramentas", label: "Explorar ferramentas" }),
    gestao: Object.freeze({ href: "gestao-a-vista.html", label: "Abrir Gestão à Vista" }),
    impressoes: Object.freeze({ href: "gestao-a-vista.html#impressoes", label: "Ver indicadores de Impressões" }),
    equipamentos: Object.freeze({ href: "impressao.html", label: "Abrir Gestão de Impressões" }),
    esg: Object.freeze({ href: "esg.html", label: "Abrir ESG" }),
    documentos: Object.freeze({ href: "gestao-documental.html", label: "Abrir Gestão Documental" }),
    automacoes: Object.freeze({ href: "automacoes.html", label: "Abrir Central de Automações" }),
    projetos: Object.freeze({ href: "gestao-a-vista.html#gv-projetos", label: "Ver área de Projetos" })
  });

  function normalize(value) {
    return String(value || "").normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  function has(text, regex) { return regex.test(text); }
  function reply(answer, key = null, source = "Orientação local do Portal UNH") {
    const action = key && Object.prototype.hasOwnProperty.call(safeLinks, key) ? safeLinks[key] : null;
    return { answer, action, source, emotion: "respondendo" };
  }

  function ask(question, context = {}) {
    if (typeof question !== "string" || !question.trim()) {
      return reply("Escreva uma pergunta sobre o Portal ou seus módulos.");
    }
    if (question.length > 300) {
      return reply("Para esta versão de testes, envie uma pergunta de até 300 caracteres.");
    }
    const text = normalize(question);
    const here = String(context.pathname || "");

    // Nunca prometer acesso ou executar operacoes institucionais.
    if (has(text, /\b(cpf|rg|matriculas?|dados pessoais|dados de aluno|dados dos alunos|senhas?|credenciais|boletim|notas dos alunos|folha de pagamento)\b/)) {
      return reply("Não tenho acesso a informações pessoais, senhas ou registros de alunos. Nesta fase, só uso orientações públicas e dados históricos de laboratório.");
    }

    if (has(text, /\b(oi|ola|bom dia|boa tarde|boa noite)\b/) && text.length < 32) {
      return reply("Olá! Posso ajudar a encontrar uma ferramenta, explicar indicadores históricos ou indicar onde acompanhar projetos. O que você procura?");
    }

    if (has(text, /\b(outubro|2026 10)\b/)) {
      return reply("Outubro de 2026 ainda está sem leitura de Impressões confirmada. O consumo e o saldo são desconhecidos — não representam zero.", "impressoes", "Histórico fixo do laboratório · sem leitura confirmada");
    }
    if (has(text, /\b(agosto|2026 08)\b/)) {
      return reply("Em agosto de 2026, o histórico do protótipo indica 1.016 impressões, cerca de 25,4% da franquia mensal de 4.000. Esses valores ainda exigem validação institucional.", "impressoes", "Histórico fixo do laboratório · agosto/2026");
    }
    if (has(text, /\b(setembro|2026 09)\b/)) {
      return reply("Em setembro de 2026, o histórico do protótipo indica 1.522 impressões, 38,1% da franquia de 4.000, com saldo calculado de 2.478. Foram 506 impressões a mais que em agosto (+49,8%). Dados ainda não homologados.", "impressoes", "Histórico fixo do laboratório · setembro/2026");
    }
    if (has(text, /\b(franquia|saldo|limite mensal|consumo mensal|variacao|comparar meses)\b/)) {
      return reply("No protótipo, a franquia mensal de Impressões é 4.000. Agosto registrou 1.016 e setembro 1.522 (+506, ou +49,8%). Outubro não tem leitura confirmada. São números históricos, não dados em tempo real.", "impressoes", "Histórico fixo do laboratório · agosto e setembro/2026");
    }

    // A base local complementa (não substitui) as regras mais sensíveis acima.
    // Correspondência só por expressões específicas; sem rede ou dados privados.
    const knowledge = typeof window !== "undefined" ? window.NexoKnowledge : null;
    if (knowledge && Array.isArray(knowledge.items)) {
      for (const entry of knowledge.items) {
        if (entry.triggers.some(phrase => text.includes(phrase))) {
          return reply(entry.answer, entry.actionKey, entry.source);
        }
      }
    }

    if (has(text, /\b(tarefas?|projetos?|vikunja|prazos?|pendencias?)\b/)) {
      if (has(text, /\b(ativos?|quantos?|listar|mostr(ar|e)|vencid(as|os)|atrasad(as|os)|quem|responsaveis?|hoje)\b/)) {
        return reply("Não consigo consultar projetos ou tarefas reais: o Vikunja ainda não está conectado nem autorizado pela TI. A área de Projetos explica esse estado sem inventar números.", "projetos");
      }
      return reply("A Gestão à Vista tem uma área para Projetos, mas os dados do Vikunja aguardam autorização da TI. Posso levar você até essa área.", "projetos");
    }

    if (has(text, /\b(impressoes?|impressoras?|equipamentos?|toner|copias?|esg)\b/)) {
      if (has(text, /\besg\b/)) return reply("A área ESG reúne indicadores de consumo responsável. Os dados precisam ter origem e período claros para evitar conclusões erradas.", "esg");
      if (has(text, /\b(equipamentos?|impressoras?|toner|manutencao)\b/)) {
        return reply("A área de Gestão de Impressões é o caminho para equipamentos, leituras e acompanhamento operacional. Esta resposta não consulta equipamentos reais.", "equipamentos");
      }
      return reply("Os indicadores históricos de Impressões estão na Gestão à Vista. Selecione agosto, setembro ou outubro de 2026 para comparar apenas períodos com leitura conhecida.", "impressoes");
    }
    if (has(text, /\b(mural|comunicados?|avisos?|publicacoes?|noticias?)\b/)) {
      return reply("O Mural fica na página inicial, antes do catálogo de ferramentas. Nesta versão ele ainda é um protótipo, e não uma fonte institucional sincronizada.", "mural");
    }
    if (has(text, /\b(automacao|automacoes|automatizar|scripts?|rotinas?)\b/)) {
      return reply("A Central de Automações reúne ferramentas e fluxos em desenvolvimento. Consulte o estágio de cada opção antes de utilizá-la.", "automacoes");
    }
    if (has(text, /\b(documentos?|pdf|planilhas?|perseus|conferencia|alunos?)\b/)) {
      return reply("A Gestão Documental reúne orientações para a conferência de documentos e para a integração local do Perseus. Não recebo nem analiso arquivos nesta versão.", "documentos");
    }
    if (has(text, /\b(ferramentas?|sistemas?|catalogo|servicos?)\b/)) {
      return reply("O catálogo de Ferramentas fica na página inicial, depois dos Comunicados. Lá você encontra as áreas disponíveis e as integrações em desenvolvimento.", "ferramentas");
    }
    if (has(text, /\b(gestao a vista|indicadores?|painel|dashboard|metricas?|resultados?)\b/)) {
      return reply("A Gestão à Vista reúne indicadores e comparações por competência. Por enquanto, só há histórico de Impressões; métricas de tarefas continuam indisponíveis.", "gestao");
    }
    if (has(text, /\b(onde estou|esta pagina|aqui|o que e isso)\b/)) {
      const contexts = {
        "gestao-a-vista.html": "Você está na Gestão à Vista, que organiza indicadores históricos de Impressões e áreas ainda não conectadas.",
        "impressao.html": "Você está em Gestão de Impressões, dedicada a equipamentos e registros de consumo.",
        "esg.html": "Você está na área ESG, ligada à leitura de indicadores de consumo responsável.",
        "automacoes.html": "Você está na Central de Automações, com ferramentas em diferentes estágios.",
        "gestao-documental.html": "Você está em Gestão Documental, que reúne a conferência de relatórios e a integração Perseus."
      };
      return reply(contexts[here.split("/").pop()] || "Você está no Portal UNH. Os comunicados aparecem primeiro, seguidos do catálogo de ferramentas.", "ferramentas");
    }
    return reply("Ainda não tenho uma resposta confiável sobre isso. Posso orientar sobre Mural, Impressões, Gestão à Vista, Projetos, documentos e Automações. Para perguntas abertas, precisaremos conectar um modelo de IA autorizado.");
  }

  // As respostas são deliberadamente sem HTML e só retornam URLs conhecidas.
  if (typeof window !== "undefined") {
    window.NexoAgent = Object.freeze({ ask, normalize });
  }
})();
