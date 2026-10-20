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

  // Contexto da pagina: somente estado documentado do PROTOTIPO, nunca alertas ao vivo.
  // Alertas operacionais futuros exigem API autenticada, origem e confirmacao.
  const pageGuides = Object.freeze({
    "index.html": Object.freeze({
      title: "Início e Mural",
      suggestion: "Para experimentar uma publicação, use o seletor 'Testar como' e escolha 'Responsável autorizado'. Preencha título e mensagem e clique em 'Publicar no teste'.",
      alert: "Mural demonstrativo: perfis simulados, sem login real. As publicações desaparecem ao atualizar a página.",
      prompts: Object.freeze(["Como publicar no mural de testes?", "Quais ferramentas estão disponíveis?"]),
      source: "Código do protótipo do Mural · sem consulta institucional"
    }),
    "impressao.html": Object.freeze({
      title: "Gestão de Impressões",
      suggestion: "Confira número de série, competência e leituras anterior e atual antes de interpretar o consumo.",
      alert: "Outubro/2026 ainda não possui leitura confirmada. Consumo, saldo e excedente são desconhecidos, não zero.",
      prompts: Object.freeze(["Como conferir uma leitura de impressora?", "O que sabemos do consumo em outubro?"]),
      source: "Regras e histórico demonstrativos de Impressões"
    }),
    "gestao-a-vista.html": Object.freeze({
      title: "Gestão à Vista",
      suggestion: "Compare apenas competências com leituras verificadas e consulte a origem dos indicadores.",
      alert: "Indicadores de Impressões são históricos do laboratório; integração institucional e métricas do Vikunja ainda estão pendentes.",
      prompts: Object.freeze(["Compare agosto e setembro de 2026.", "Por que outubro não tem saldo calculado?"]),
      source: "Indicadores demonstrativos e estado das integrações"
    }),
    "gestao-documental.html": Object.freeze({
      title: "Gestão Documental",
      suggestion: "Confira os módulos experimentais e a situação da integração Perseus antes de utilizar documentos.",
      alert: "Ainda não existe análise de documentos institucionais autorizada pelo Nexo. Não envie arquivos reais ao laboratório.",
      prompts: Object.freeze(["O que funciona na Gestão Documental?", "O Perseus já está integrado?"]),
      source: "Documentação do laboratório · integração pendente"
    }),
    "automacoes.html": Object.freeze({
      title: "Central de Automações",
      suggestion: "Explore as rotinas em desenvolvimento, verificando o estágio antes de executar qualquer processo.",
      alert: "O laboratório não executa automações institucionais nem possui autorização para operar sistemas reais.",
      prompts: Object.freeze(["O que a Central de Automações faz?", "Há automações institucionais conectadas?"]),
      source: "Estado demonstrativo da Central de Automações"
    }),
    "esg.html": Object.freeze({
      title: "ESG e Consumo Responsável",
      suggestion: "Comece pelos dados de consumo de páginas e compare períodos com fonte e competência informadas.",
      alert: "Não é possível afirmar árvores, CO₂ ou água economizados sem metodologia validada e dados suficientes.",
      prompts: Object.freeze(["Quais indicadores de ESG são confiáveis?", "O que podemos comparar nas impressões?"]),
      source: "Diretrizes de ESG do protótipo"
    })
  });

  function contextForPage(pathname = "") {
    const name = String(pathname).split(/[?#]/, 1)[0].split("/").pop() || "index.html";
    return pageGuides[name] || Object.freeze({
      title: "Portal UNH",
      suggestion: "Posso orientar sobre Mural, Impressões, Gestão à Vista, ESG, documentos e Automações.",
      alert: "Este assistente usa orientações de laboratório, não avisos institucionais em tempo real.",
      prompts: Object.freeze(["Sabe me guiar?", "Quais módulos estão disponíveis?"]),
      source: "Orientações locais do Portal UNH"
    });
  }

  // Respostas verificadas instantaneas: funcionam inclusive com IA ligada.
  // Retorna null para perguntas abertas, que continuam no Ollama mediante opt-in.
  function fastAnswer(question, context = {}) {
    if (typeof question !== "string" || !question.trim() || question.length > 280) return null;
    const text = normalize(question);
    const guide = contextForPage(context.pathname);
    // Nunca contornar recusas para dados protegidos.
    if (has(text, /\b(cpf|rg|matriculas?|dados pessoais|dados de aluno|dados dos alunos|senhas?|credenciais|boletim|notas dos alunos|folha de pagamento)\b/)) {
      return reply("Não tenho acesso a informações pessoais, senhas ou registros de alunos. Esta ajuda utiliza apenas dados do protótipo.", null, "Regra local de proteção");
    }
    if (/^(oi|ola|bom dia|boa tarde|boa noite|e ai|eae|hey)[!. ]*$/.test(text)) {
      return reply("Olá! Você está em " + guide.title + ". Quer uma sugestão para esta página ou prefere acessar outro módulo?", null, "Guia local · " + guide.title);
    }
    if (has(text, /\b(como|consigo|posso|quero|preciso)\b/) && has(text, /\b(postar|publicar|criar (um |uma )?(post|publicacao|comunicado))\b/) && has(text, /\b(mural|comunicados?|publicacao|post)\b/)) {
      return reply("No Mural de testes, vá a Comunicados e, no campo 'Testar como', selecione 'Responsável autorizado'. Preencha título e mensagem e clique em 'Publicar no teste'. A publicação só existe nesta demonstração e desaparece ao recarregar. Essa seleção não concede permissão institucional.", "mural", "Interface e código do Mural demonstrativo");
    }
    if (has(text, /\b(me gui(ar|e)|orient(ar|e)|por onde (comecar|começo)|o que fazer aqui|onde estou|esta pagina|sugest(ao|oes)|aviso(s)?|atencao aqui)\b/)) {
      return reply("Você está em " + guide.title + ". Sugestão: " + guide.suggestion + " Atenção (laboratório): " + guide.alert, null, guide.source);
    }
    if (has(text, /\b(compare|comparar|comparacao)\b/) && has(text, /\bagosto\b/) && has(text, /\bsetembro\b/)) {
      return reply("Histórico demonstrativo: agosto/2026 teve 1.016 impressões e setembro/2026 teve 1.522. Aumento de 506 (+49,8%). Outubro não tem leitura confirmada, então consumo e saldo são desconhecidos.", "impressoes", "Histórico fixo e não homologado de agosto/setembro 2026");
    }
    return null;
  }

  function ask(question, context = {}) {
    if (typeof question !== "string" || !question.trim()) {
      return reply("Escreva uma pergunta sobre o Portal ou seus módulos.");
    }
    if (question.length > 300) {
      return reply("Para esta versão de testes, envie uma pergunta de até 300 caracteres.");
    }
    const quick = fastAnswer(question, context);
    if (quick) return quick;
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
    window.NexoAgent = Object.freeze({ ask, normalize, fastAnswer, contextForPage });
  }
})();
