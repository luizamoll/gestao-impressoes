# Portal UNH — registro de evolução e plano de simplificação

**Atualizado:** 03/11/2026  
**Branch de trabalho:** `feat/atalhos-apps-home-20261027`  
**Papel deste documento:** ser o ponto central de acompanhamento das alterações do Portal, sem criar um documento para cada pequeno ajuste.

> **Objetivo:** permitir muitas iterações agora, preservando rastreabilidade e segurança, e **simplificar a implementação posteriormente**. Uma mudança só está concluída depois de documentarmos a decisão e verificarmos os efeitos nos módulos relacionados.

## 1. Situação atual (código no GitHub; validar no Windows)

| Área | Estado encontrado / decisões | Referência |
| --- | --- | --- |
| Página inicial | Home pública, saudação demonstrativa, atalhos, carrossel de **banners fictícios**, Nexo, Helpdesk no rodapé. Os materiais ganharam relevo e iluminação. | `static/index.html` + `css/unh-home-depth-v1.css` |
| Aplicativos | Biblioteca separada com 7 atalhos didáticos: Helpdesk, Teams, Outlook, Vikunja, Gestão à Vista, Impressões e Automações. | `static/aplicativos.html` + `css/unh-app-library-v2.css` |
| Comunicados | A página independente `comunicados.html` **foi removida** por decisão da usuária. Não ressuscitar links ou o antigo mural. Banners permanecem na home. | `#destaques` na home |
| Nexo | Guia de navegação por regras em 7 páginas. Mantém painel aberto na mesma aba, possui orientações e atalhos atualizados. Se a ponte da IA falhar, faz fallback para o guia local. | `js/nexo-agente.js`, `js/nexo-assistente.js`, `docs/NEXO_ATIVO.md` |
| IA do Nexo | **Opcional e experimental**, somente na máquina local, mediante consentimento; precisa de Python/ponte/modelo configurados. Não é um serviço institucional sempre ligado. | `laboratorio/nexo-local/servidor_nexo.py` |
| Segurança | Páginas e recursos estáticos públicos para navegação; rotas e operações não liberadas seguem protegidas no Spring Security. Nunca publicar dados reais, segredos ou credenciais. | `SecurityConfig.java` |
| Módulos existentes | Gestão à Vista, Gestão de Impressões, ESG, Gestão Documental e Automações preservados; nem toda tela implica integração funcional. | HTML/JS próprios em `static/` |

**Atenção:** "implementado no código" não significa "homologado visualmente", nem implantação definitiva. A inspeção do navegador local (desktop e mobile), a verificação de respostas HTTP e os testes da aplicação continuam sendo critérios de aceite.

## 2. Decisões de produto que devem sobreviver a futuras mudanças

- **Experiência:** interface clara, didática, com fontes nítidas e profundidade realista (superfícies, iluminação, bordas e sombras), **sem** dar espessura exagerada às letras, rotação do texto ou efeitos que causem tremulação.
- **Fluxo:** menu curto `Início → Aplicativos → Gestão à Vista`; serviços e ferramentas com descrições práticas. Não voltar a misturar todos os módulos em uma página longa.
- **Marca e suporte:** cabeçalho global preserva a marca original **Centro Universitário / unihorizontes**, os três links de navegação e o botão vermelho **Abrir chamado**, com destino ao Helpdesk. A identidade do Portal é compartilhada, mas módulos internos podem conservar comandos próprios.
- **Conteúdo:** nunca apresentar exemplos fictícios como comunicados institucionais ou indicadores confirmados.
- **Acessos:** Vikunja é aplicativo externo existente; seu atalho atual leva a um **projeto específico**, não a uma API integrada. Outros endereços exigem verificação antes de trocar.
- **Mascote:** preservar Nexo prateado e separado da identidade verde do restante do Portal.
- **Cuidado com dados:** nenhuma integração de Nexo a alunos, e-mail, chamados ou tarefas sem avaliação e autorização da TI.

## 3. Registro consolidado de alterações relevantes

| Período | Mudança | Motivo / efeito |
| --- | --- | --- |
| Outubro/2026 — estrutura | Home pública, biblioteca independente e atalhos diretos | Reduzir navegação confusa e eliminar dependência de login na entrada |
| Outubro/2026 — navegação | Inclusão do Vikunja e descrições curtas nos aplicativos | Transformar cartões decorativos em ferramentas compreensíveis |
| Outubro/2026 — interface | Abandono de negrito excessivo; adoção de profundidade no CSS da biblioteca e da home | Clareza visual com camadas, sombras e tipografia sem tremulação |
| 27/10/2026 — escopo | Exclusão da página de Comunicados; carrossel demonstrativo mantido na home | Evitar área vazia e links sem função |
| 27/10/2026 — Nexo | Inclusão do Nexo nas páginas, estado do painel na aba, links atuais e script `iniciar-portal.ps1` | Assistente disponível sem depender da ponte |
| 27/10/2026 — Nexo | Resposta aos próprios limites e fallback quando IA experimental está desconectada | Não interromper pergunta simples sobre o Portal por falha da IA |
| 28/10/2026 — organização | Criação deste registro de evolução e plano de consolidação | Evitar que dezenas de correções virem dívida técnica invisível |
| 28/10/2026 — consistência visual | Padronização de altura do cabeçalho e espaçamentos da Biblioteca de Aplicativos, com responsividade explícita | Evitar que navegação e área útil mudem desnecessariamente quando a janela varia; manter profundidade 3D existente |
| 28/10/2026 — cabeçalho unificado | Home, Biblioteca e Gestão à Vista passaram a usar a mesma marca Portal UNH, logo SVG, menu de três links e CSS compartilhado de 76 px no desktop | Evitar que a identidade e a navegação mudem ao trocar de página; Gestão mantém busca/menus internos abaixo do cabeçalho global |
| 29/10/2026 — identidade e suporte | Mantida a barra unificada de 76 px; restaurada a marca anterior de duas linhas **Centro Universitário / unihorizontes** nas três páginas; adicionado botão vermelho **Abrir chamado** no topo; cartões Helpdesk destacados em vermelho na home e biblioteca | Melhorar a identificação institucional e dar prioridade ao suporte, sem redesenhar hero, cartões, menus, Nexo ou dashboards |
| 29/10/2026 — Gestão à Vista | Corrigidos resultados de busca que apontavam para âncoras removidas; adicionado acesso ao projeto no Vikunja a partir da área Projetos; criado teste de navegação e estado sem integração | Tornar o painel útil agora sem inventar tarefas nem interferir no cabeçalho homologado |
| 03/11/2026 — Gestão à Vista | **Decisão revisada:** não integrar Vikunja ao painel. Removidas as áreas Projetos/Indicadores sem dados, criada Central de ferramentas com 7 acessos existentes (4 internos e 3 externos); busca e Nexo atualizados; endpoint de status agora descreve o catálogo. | Focar em integrar ferramentas realmente disponíveis, começando por navegação, sem alegar sincronização ou inventar indicadores |
| 03/11/2026 — Impressões | Novos relatórios HP recebidos em cinco fotografias: atualizados contadores de três séries, histórico preservado e Gestão à Vista ganhou cartões de leituras recentes; data da coleta não informada | Diferenciar nova leitura do consumo por competência e evitar atualização falsa do mês |

**Como manter o registro:** adicionar uma linha somente para cada decisão/entrega relevante; detalhes de cada ajuste ficam no histórico do Git. Não registrar cada cor, margem, commit ou teste trivial aqui.

**Comparação de capturas da biblioteca (28/10):** o banner e os cartões mantinham dimensões praticamente iguais nas duas imagens; a diferença aparente incluía enquadramento distinto do navegador. Ajustamos a estrutura da barra superior e os pontos responsivos, mas a área externa ao site (abas, barra de endereço, zoom e escala do Windows) não é controlável via CSS. A validação deve comparar a mesma largura útil e o mesmo zoom (100%), além de telas diferentes.

### Gestão à Vista — estado e próximos passos (03/11/2026)

**Decisão de escopo:** o Vikunja pode continuar na Biblioteca de Aplicativos como um atalho independente, mas **não será integrado** à Gestão à Vista. Não recriar a área "Projetos acompanhados" ou indicadores de tarefas vazios.

- **Implementado no código:** três áreas — Visão geral, Ferramentas e Impressões. A Central de ferramentas oferece navegação real para Gestão de Impressões, ESG, Automações, Gestão Documental, Helpdesk, Teams e Outlook.
- **Tipo de integração entregue:** **acesso/navegação**, não sincronização de dados. Os quatro módulos internos abrem dentro do Portal; os três serviços externos abrem em nova aba, podendo exigir acesso institucional.
- **Dados atuais:** métricas de Impressões ainda vêm de um histórico demonstrativo fixo (agosto/setembro de 2026; outubro sem leitura). A ausência de informação **não equivale a zero**.
- **API de status:** `/api/gestao-a-vista/status` agora relata `catalogo_disponivel` e `conectado=false`, sem afirmar conexões institucionais. Permanece protegida pelas regras existentes do backend.
- **P1 — Validação local:** abrir as três áreas, conferir links dos sete sistemas, busca, CSV, competências, Nexo, cabeçalho, responsividade e testes Maven/Node. Alterações no GitHub não substituem homologação no Windows.
- **P2 — Integração de dados verdadeira:** identificar junto à TI quais fontes/APIs existentes são autorizadas para leitura (prioridade: módulo de Impressões). Construir adaptador server-side com contrato mínimo, dados/erros rastreáveis e autenticação adequada. Nunca acessar contas pessoais, tokens de cliente ou sistemas sem aprovação.
- **P3 — Simplificação:** eliminar a duplicação de métricas de Impressões entre Visão Geral e análise detalhada quando a origem dos dados estiver consolidada; evitar adicionar CSS de correção em cascata.
- **P4 — Design:** preservar cabeçalho UniHorizontes e botão Abrir chamado, além do Nexo. Ajustar apenas conforme capturas reais da Gestão à Vista.

### Leituras HP recebidas em 03/11/2026 — transcrição conferível

As fotografias compartilhadas na conversa apresentam relatórios de uso **sem data visível de coleta**. Registrar a **data de recebimento (03/11/2026)** não permite afirmar a competência mensal. Dados transcritos manualmente, sujeitos à conferência com os relatórios originais; as imagens **não foram adicionadas ao repositório**.

| Série | Equipamento/setor | Leitura anterior no Portal | Novo contador | Acréscimo *entre leituras* | Frente/verso | Cópias | Scanner* | Pasta na rede |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `BRBST2P00K` | HP MFP 4103fdw · Graduação/RH | 27.582 | **28.201** | **+619** | 7.763 | 995 | 5.465 (4.724 + 741) | 1.374 |
| `BRBST160GT` | HP 4003dw · Reserva Graduação/RH | 17.468 | **17.486** | **+18** | 8.593 | — | — | — |
| `BRBSV730KB` | HP MFP 4103fdw · Mestrado | 56 | **1.083** | **+1.027** | 176 | 9 | 233 (167 + 66) | 225 |

*Scanner = contadores do mecanismo, alimentador + vidro; não somar novamente à quantidade de impressões.* A4 equivalente do Mestrado = **1.082,5**, diferente do contador bruto de **1.083** (mídias de tamanhos distintos). Valores A4 equivalentes dos demais relatórios: **28.201,0** e **17.486,0**. Congestões/falhas de coleta: Graduação/RH **1/29**, reserva **2/3**, Mestrado **0/0**.

**Regra de cálculo:** subtrair apenas contadores acumulados do **mesmo número de série** e em ordem conhecida; apresentar os resultados como *diferença desde o registro anterior*, nunca como total mensal sem datas verificadas. Os valores históricos de agosto/setembro de 2026 (1.016/1.522) e outubro sem consumo apurado permanecem **inalterados**.

**Ajuste de apresentação (03/11/2026):** a captura da Gestão de Impressões mostrou que a seção antiga de outubro recebia destaque antes das leituras recém-cadastradas. Reorganizamos a Visão geral para abrir com os três contadores atualizados e as diferenças por série; a competência de outubro aparece depois, com aviso de que não pode ser apurada sem datas de coleta. O atalho Visão geral agora aponta para as leituras recentes; Equipamentos mantém tabela e histórico completos.

**Próxima integração real:** capturar data da emissão ou da leitura e fonte verificável; cadastrar cada registro em uma fonte única persistente com série, data, contador, mídia e proveniência; consolidar os valores repetidos de HTML/JS no futuro para evitar manutenção de múltiplas cópias. Nada de considerar a seleção de arquivo como importação automática antes de implementar parser e validações.

## 4. Problemas e dívida técnica identificados

1. **CSS em camadas:** a home importa `portal.css`, `mural.css`, `portal-home-v3.css`, `portal-palette-v1.css`, `portal-editorial-v1.css`, `mural-social-v2.css`, `unh-app-access-v1.css`, `unh-destaques-v1.css`, `unh-legibilidade-v1.css`, `unh-banner-demo-v1.css` e `unh-home-depth-v1.css`. Há sobreposições e estilos históricos. **Não apagar em massa**: mapear primeiro quais seletores ainda afetam a página.
2. **Visual duplicado:** biblioteca e home têm cartões/cores/sombras equivalentes implementados em estilos diferentes. Consolidar depois em tokens e componentes compartilhados.
3. **HTML repetido:** a **aparência** dos cabeçalhos e a logo já foram unificadas via `css/unh-site-header.css` nas três páginas principais. O mesmo trecho de HTML ainda aparece em três arquivos: avaliar fragmento reutilizável antes de alterações futuras. Navegação de módulos, rodapés e importações do Nexo também merecem consolidação, sem framework desnecessário.
4. **Nexo com muitas regras no JS:** centralizar catálogo de ferramentas, contexto das páginas e respostas comuns em um único esquema versionado, com testes. Separar definitivamente orientações confiáveis, dados demonstrativos e IA experimental.
5. **Mensagens e nomes de laboratório:** verificar textos por desatualização; a saudação com nome fixo na home é uma demonstração, **não** personalização autenticada. Ajustar antes de uso institucional.
6. **Automação local:** o `iniciar-portal.ps1` inicia o ambiente, mas **não** faz atualização do Git. Bloqueios de execução PowerShell podem vir da política corporativa. Planejar rotina única de atualizar/testar/iniciar **somente após** validação do fluxo e respeitando a TI.
7. **Revisão de segurança e operação:** confirmar controles e serviços antes de qualquer publicação na rede; nunca presumir que uma tela pública ou um atalho conceda autorização para dados reais.

## 5. Plano de simplificação (posterior, incremental)

| Ordem | Entrega | Critério para considerar concluída |
| --- | --- | --- |
| P0 | **Congelar referência visual** da home e apps | Capturas aprovadas em desktop/mobile, links checados e principais testes passando |
| P1 | **Mapear CSS usado e remover estilos legados** em pequenos grupos | Aparência preservada, nenhuma regressão em módulos e redução mensurável de duplicidade |
| P2 | **Criar design tokens/estilos compartilhados** para cartões, botões, relevo e tipografia | Home e apps sincronizadas por poucas variáveis; sem cadeia de `!important` crescente |
| P3 | **Padronizar navegação e imports** sem reescrever o backend | Menos cópias de menus/rodapé/Nexo, comportamento idêntico nas rotas |
| P4 | **Simplificar conhecimento do Nexo** em catálogo e regras testáveis | Editar um aplicativo/rota em um lugar atualiza sugestões coerentes; sem referências órfãs |
| P5 | **Simplificar o fluxo local de atualização** | Um comando seguro que verifica a branch/alterações locais, faz `fetch + ff-only`, opcionalmente roda testes e inicia o Portal; sem sobrescrever trabalho |
| P6 | **Homologar segurança/acesso institucional** | Verificação da TI, dados reais fora do laboratório e permissões explícitas onde forem necessárias |

**Regra:** não reescrever o Portal inteiro, não excluir arquivos apenas por parecerem antigos e não acrescentar uma nova camada de CSS para cada ajuste pequeno. Quando a interface estiver aprovada, priorizar **substituir/limpar**, não apenas sobrepor.

## 6. Rotina curta para cada nova alteração

1. **Antes:** confirmar a branch e `git status --short`; identificar arquivo, objetivo e possível regressão. Se houver modificações locais, interromper a sincronização automática e analisar.
2. **Durante:** fazer a menor alteração útil possível, com mensagem de commit explícita; não alterar partes independentes por conveniência.
3. **Depois:** validar sintaxe, navegação, testes relevantes (`node --test tests/nexo-agente.test.cjs` quando o Nexo mudar), `mvnw.cmd test` quando aplicável e inspeção visual.
4. **Registrar:** atualizar apenas a linha correspondente neste documento se houve mudança de arquitetura, regra, navegação ou escolha de UX. Registrar falhas reais e o que as resolveu.
5. **Fechar:** documentar o que está efetivamente testado versus o que só foi enviado ao GitHub. Não chamar de "pronto" sem essa distinção.

### Sincronização manual segura no Windows

Parar o servidor (`Ctrl+C`), estar na branch correta e verificar que a pasta está sem modificações:

```powershell
cd "$HOME\Desktop\portal-unh-lab"
git status --short
git branch --show-current
git fetch origin refs/heads/feat/atalhos-apps-home-20261027
git merge --ff-only FETCH_HEAD
.\mvnw.cmd spring-boot:run
```

**Não** executar o merge se a branch não for `feat/atalhos-apps-home-20261027`, se houver arquivos alterados localmente ou se o `fetch` falhar. Não usar `reset --hard`, `git clean` ou mesclar outras branches para contornar erros. `iniciar-portal.ps1` é opção para iniciar o Portal, não atualização Git; caso seja bloqueado por política do Windows, usar diretamente o Maven.

## 7. Documentos complementares (sem duplicar responsabilidades)

- [Arquitetura e regras de preservação](PORTAL_UNH_ARQUITETURA.md): referência de rotas, dependências e critérios técnicos.
- [Nexo ativo](NEXO_ATIVO.md): comportamento, limites, operação da ponte local e testes.
- [Gestão de Impressões](../README.md): projeto de origem e objetivo funcional do repositório.

**Princípio de manutenção:** uma fonte central de decisões e pendências (este arquivo); os outros documentos explicam detalhes técnicos duradouros. Quando houver simplificação de código, **simplificar também a documentação**: remover instruções obsoletas em vez de acumular ressalvas.
