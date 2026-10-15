# Gestão à Vista V2 — requisitos e plano de integração com Vikunja

Estado: especificação preliminar, 15/10/2026. **Ainda não há integração real com Vikunja nem dados operacionais sincronizados.**
Escopo do trabalho: branch de laboratório `feat/autenticacao-portal`; não alterar o Portal UNH de produção, Perseus, nem Gestão de Impressões.

## 1. Decisão de produto

Gestão à Vista é uma camada **gerencial, de leitura**, que apresenta o andamento do trabalho e indicadores de processos com origem verificável. O Vikunja permanece **fonte principal de tarefas e projetos**. Evitar criar um gerenciador concorrente e evitar replicar funções Kanban, edição, Gantt, comentários, anexos ou configurações.

O painel pode resumir a situação do setor e oferecer um botão "Abrir no Vikunja" somente quando a URL institucional e as regras de autorização forem validadas. Manter a área atual de **Impressões** em uma aba própria, preservando histórico e fórmulas.

## 2. Públicos e permissões propostas (pendente validação TI)

- Visitante não autenticado: não recebe nomes, tarefas ou métricas internas. O Portal pode ter home pública.
- Colaborador autenticado: enxerga somente projetos, tarefas e indicadores que a identidade dele tem direito de ver.
- Gestor autorizado: pode ver agregações da equipe ou setor, conforme permissão explícita.
- Administrador técnico: configura conectores, escopos e logs; não ganha acesso automático ao conteúdo sigiloso dos demais setores.

**Regras obrigatórias:** autorização backend por identidade/escopo a cada consulta, e não apenas ocultação de cartões na interface. Segredo de integração somente em backend/variável de ambiente. Nunca salvar senha, token, nomes de estudantes ou dados reais neste repositório público. A conta `admin.lab` não equivale a autorização institucional.

Não assumir que um token único da instituição pode compartilhar dados de todas as equipes. Avaliar integração por usuário/delegação ou por conectores de escopo mínimo, homologados pela TI. Revalidar direitos nos detalhes e nas agregações.

## 3. Escopo MVP — mínimo que agrega valor

1. **Visão geral**: total de tarefas abertas do escopo permitido, atrasadas, concluídas no período e próximas do vencimento. Números reais somente após integração e cálculo verificados; caso contrário apresentar estado "Não conectado", nunca zero fictício.
2. **Projetos e setores**: cartões por projeto/área autorizado, com estado da atualização e caminho para abrir a fonte original.
3. **Foco operacional**: lista somente de tarefas autorizadas "Atrasadas", "Vencem em breve", "Prioridade alta" e "Sem responsável" (quando pertinente); sem exibir dados de outras equipes.
4. **Filtros**: projeto, equipe autorizada, janela temporal e status. Exibir período e data/hora da última sincronização.
5. **Histórico e comparações**: só se houver dados consolidados e definição clara das fórmulas. Não inferir produtividade individual pela simples contagem de tarefas.
6. **Indicadores existentes de impressões**: manter os valores históricos marcados como **estáticos**, inclusive Outubro/2026 como "sem leitura" — não zero.

Fora do MVP: criação/edição/arrastar tarefas, chat, anexos, clonagem de Vikunja, gamificação/rankings individuais, notificações automáticas, conexão direta do navegador com API interna.

## 4. Fórmulas e interpretação

- **Abertas**: tarefas do escopo permitido com `done=false` no momento da consulta.
- **Atrasadas**: tarefas abertas com prazo anterior ao momento da consulta, sem contar tarefas sem prazo como atrasadas.
- **Próximos vencimentos**: tarefas abertas com `due_date` na janela escolhida, considerando fuso e horários definidos.
- **Concluídas no período**: tarefas concluídas cuja data de conclusão esteja no período selecionado (se campo e versão forem suportados e auditáveis).
- **Percentual concluído**: somente quando houver denominador coerente e estável, explicitando filtros e período. Percentual de tarefas concluídas **não é equivalente** a percentual do esforço/projeto.
- **Quadros Kanban**: colunas variam por projeto; não afirmar que uma coluna é equivalente ao campo `done` sem mapeamento e validação da organização.
- Falha na origem / conexão / sem autorização / sem leitura / vazio genuíno são estados distintos.

## 5. Integração técnica faseada

**Fase A — levantamento institucional**
- Confirmar URL da instância Vikunja, versão instalada, API v1/v2 disponível, projetos e setores piloto, regras de acesso, dados permitidos e aprovação da TI.
- Obter exemplos **sintéticos** de JSON ou acesso técnico de escopo mínimo; nunca compartilhar token na conversa, no frontend ou GitHub.
- Confirmar que o servidor Java tem acesso à instância; validar HTTPS/TLS e política de rede.

**Fase B — protótipo desacoplado**
- Desenhar visão geral com estados vazios reais e dados simulados claramente marcados como **demonstração**, sem sugerir que descrevem a operação da UNH.
- Criar DTOs e cliente Java isolado com fake server/testes automatizados; integração desligada por padrão.
- Definir contrato de resposta com `source`, `scopedProjectIds`, `retrievedAt`, `period`, `status` e contadores derivados de tarefas efetivamente autorizadas.

**Fase C — leitura de produção, só após homologação**
- Backend Java busca dados do Vikunja, sem expor tokens ao browser.
- Autenticação institucional (LDAP/SSO ou equivalente), autorização por setor/projeto, paginação, timeout, cache de curta duração, auditoria sem detalhes sensíveis.
- Tratamento de rate-limit, rede indisponível, expiração de token e origem desatualizada.
- Testes de vazamento entre colaboradores/equipes, login anônimo, volume, falhas, acessibilidade.
- Implantação apenas aprovada pela TI. Não usar a conta efêmera do laboratório com dados reais.

**Documentação oficial:** a API v1 é documentada em https://vikunja.io/docs/api-documentation/ ; versões recentes oferecem API v2 em https://vikunja.io/docs/api-v2/ (verificar qual versão existe na instância UNH antes de implementar). Filtros: https://vikunja.io/help/filters/ . Em fase posterior, webhooks opcionais com validação de assinatura e política de rede, não necessários ao MVP.

## 6. Estrutura visual inspirada no Vikunja, sem copiá-lo

- Menu lateral compacto: "Visão geral", "Projetos/Setores", "Indicadores" e "Impressões".
- Barra superior: nome da área, seleção de período, filtro de equipe permitido, fonte e "última atualização".
- Área principal: KPIs resumidos; lista de pontos que exigem atenção; cartões de projetos.
- Página "Impressões" mantém os gráficos existentes e a fonte explícita.
- Link para tarefas abre o Vikunja original quando homologado; o Portal não edita dados.

### Direção de cor e imagem — não deixar tudo verde

- Base visual preferencialmente clara/neutra: branco, gelo, cinza suave, grafite; **verde UNH como acento** de marca, foco e CTA, não fundo de cada painel.
- Hierarquia de referência para exploração: aproximadamente 70% neutros, 20% fotografia/elementos atmosféricos, 10% verde e cor funcional, sem aplicação rígida.
- Paisagens/ilustrações conceituais podem dar atmosfera a áreas de boas-vindas, login e cabeçalhos, usando também céu/azul, dourado suave, pedra e vegetação — não saturar tudo de verde.
- **Imagens ficcionais:** não apresentá-las como fotos reais das instalações; descrição e contexto acessíveis devem ser fiéis. Evitar sobrepor dados e texto em cenários com pouco contraste.
- Reservar cores semânticas para estados: alerta/atraso âmbar ou vermelho com rótulo; concluído/neutro com texto claro; não depender apenas da cor.
- Legibilidade: corpo típico 15–17px, contraste WCAG adequado, foco visível, responsividade, movimentos reduzidos.
- Produzir primeiro um estilo refinado do painel; só posteriormente harmonizar login/home e as demais áreas, com aprovação visual.

## 7. Critérios de aceite e pendências

- [ ] Escopo dos setores/projetos e quem pode ver cada indicador definidos com a TI.
- [ ] Versão e autenticação suportadas pelo Vikunja institucional confirmadas.
- [ ] Sem login: nenhuma métrica ou detalhe operacional exposto.
- [ ] Login com papel insuficiente: vedado acessar projetos e agregações de outros setores.
- [ ] Nunca mostrar contagens inventadas nem converter ausência de dados em "0".
- [ ] Se o conector cair: mostrar "indisponível" + última sincronização, não dados apresentados como atuais.
- [ ] Números respeitam janelas temporais, conclusão, prazo, timezone e paginação.
- [ ] Portal original, Perseus e Gestão de Impressões continuam funcionais e independentes.
- [ ] Aprovar a proposta estética equilibrada (sem excesso de verde) antes da reestruturação visual.

**Próximo bloqueio real:** autorização e detalhes da instância Vikunja UNH. Até lá, somente documentação e protótipo sem dados institucionais.

## 8. Protótipo local da Gestão à Vista

Implementação de interface em `gestao-a-vista.html` + `css/gestao-vista.css` na branch de laboratório, sem mexer nas APIs e sem integrar com a instância Vikunja. Navegação lateral, visão geral, projetos, indicadores indisponíveis e atalho para a seção de Impressões. Valores de tarefas representados por traço (—), rótulos explícitos de integração pendente; nenhum dado fictício foi criado. A área histórica de Gestão de Impressões permanece intacta e separada.
