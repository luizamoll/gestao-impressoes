"use strict";

/**
 * Base pública de orientação do Nexo — LABORATÓRIO.
 * NÃO é procedimento institucional homologado.
 * Conteúdo local e estático; não contém dados pessoais, URLs internos ou tokens.
 * Revisão editorial: 2026-10-19.
 */
(() => {
  const source = "FAQ de laboratório · revisão 19/10/2026 · não homologado pela TI";
  const items = [
    {
      id: "impressora-suporte",
      triggers: ["impressora nao imprime", "impressora com problema", "problema na impressora", "atolamento de papel", "papel atolado", "manutencao de impressora", "impressora puxando papel", "impressora travou"],
      answer: "Se uma impressora apresenta falha, anote o setor, a identificação do equipamento e o sintoma (por exemplo, papel parando no meio do percurso). Registre a solicitação no canal oficial indicado pela TI; o Portal ainda não cria chamados nem consulta o GLPI. Evite incluir documentos ou dados pessoais na descrição.",
      actionKey: null
    },
    {
      id: "suporte",
      triggers: ["abrir chamado", "criar chamado", "solicitar suporte", "pedir suporte", "preciso de suporte", "suporte tecnico", "abrir ticket", "falar com a ti"],
      answer: "O Portal UNH ainda não abre chamados automaticamente. Para solicitar atendimento, utilize o canal oficial divulgado pela equipe de TI. A consulta ao GLPI poderá ser integrada depois de autorização institucional; não há conexão ativa nesta versão.",
      actionKey: null
    },
    {
      id: "perseus-acesso",
      triggers: ["perseus em outro computador", "perseus de outro computador", "perseus nao abre", "conferencia perseus nao abre", "acessar perseus pela rede", "127 0 0 1", "localhost 8878"],
      answer: "A Conferência Perseus é indicada no Portal como ferramenta de acesso local. Um endereço 127.0.0.1 aponta para o próprio computador, não para um servidor compartilhado. É necessário iniciar o programa naquele computador; o acesso pela rede depende de hospedagem e autorização da TI.",
      actionKey: "documentos"
    },
    {
      id: "mural-publicar",
      triggers: ["publicar no mural", "postar no mural", "quem pode publicar", "criar publicacao", "postar comunicado"],
      answer: "No mural demonstrativo, selecione o perfil 'Responsável autorizado' para testar a criação de publicações. A seleção é apenas uma simulação no navegador, não uma permissão institucional real. O mural ainda não publica comunicados oficiais.",
      actionKey: "mural"
    },
    {
      id: "mural-persistencia",
      triggers: ["mural nao salva", "publicacao desapareceu", "publicacoes sumiram", "comentarios somem", "salvar publicacao", "mural persistente", "mensagem sumiu"],
      answer: "As publicações e os comentários do mural demonstrativo ficam somente na memória da página. Ao recarregar, os testes são reiniciados. Persistência, autenticação e moderação no servidor ainda não foram implantadas.",
      actionKey: "mural"
    },
    {
      id: "nexo-limites",
      triggers: ["nexo usa ia", "nexo e inteligencia artificial", "nexo e chatbot", "voce tem ia", "o nexo aprende"],
      answer: "Nesta etapa, sou um orientador local com respostas por regras e uma base pequena de perguntas revisadas para laboratório. Não utilizo IA generativa, não aprendo com mensagens e não consulto sistemas institucionais ou dados pessoais.",
      actionKey: null
    },
    {
      id: "login",
      triggers: ["como entrar no portal", "como fazer login", "acesso institucional no portal", "entrar no portal"],
      answer: "O Portal tem uma tela de entrada no ambiente de desenvolvimento. A autenticação institucional definitiva e as permissões por usuário/setor ainda dependem de implantação e homologação com a TI. Não informe sua senha em mensagens ao Nexo.",
      actionKey: null
    },
    {
      id: "conhecimento",
      triggers: ["onde encontro manual", "manuais de ti", "base de conhecimento", "perguntas frequentes", "procedimentos de ti"],
      answer: "Estamos organizando orientações e perguntas frequentes para o Nexo. Este conteúdo ainda é uma base experimental, não uma biblioteca institucional homologada. Para procedimentos oficiais, confirme as instruções com o setor responsável.",
      actionKey: "ferramentas"
    }
  ];
  window.NexoKnowledge = Object.freeze({
    version: "2026-10-19-lab",
    items: Object.freeze(items.map(item => Object.freeze({
      ...item,
      triggers: Object.freeze([...item.triggers]),
      source
    })))
  });
})();
