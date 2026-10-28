# Portal UNH — registro de evolução e plano de simplificação

**Atualizado:** 28/10/2026  
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

**Como manter o registro:** adicionar uma linha somente para cada decisão/entrega relevante; detalhes de cada ajuste ficam no histórico do Git. Não registrar cada cor, margem, commit ou teste trivial aqui.

**Comparação de capturas da biblioteca (28/10):** o banner e os cartões mantinham dimensões praticamente iguais nas duas imagens; a diferença aparente incluía enquadramento distinto do navegador. Ajustamos a estrutura da barra superior e os pontos responsivos, mas a área externa ao site (abas, barra de endereço, zoom e escala do Windows) não é controlável via CSS. A validação deve comparar a mesma largura útil e o mesmo zoom (100%), além de telas diferentes.

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
