# Portal UNH — arquitetura, baseline e regras de preservação

Atualizado: 2026-10-27. Documento de referência para reorganizar a intranet, sem reescrever o Portal.

## Baseline aprovado
- Base de desenvolvimento: `feat/atalhos-apps-home-20261027`.
- Nunca copiar blocos de outras branches para a home sem análise de dependências.
- Home pública e sem botão de login; APIs e operações internas permanecem protegidas.
- Identidade visual aprovada: verde institucional, grafismos circulares translúcidos, tipografia forte, cartões em relevo suave. A estética do mural antigo é referência, **não** a sua funcionalidade.
- Nexo prateado é componente próprio, com sua identidade preservada.
- Rodapé da home: **Abra aqui seu chamado** → `https://helpdesk.unihorizontes.local/Helpdesk`.

## Diagnóstico do estado atual
- `src/main/resources/static/index.html` contém hero, mural demonstrativo, catálogo de ferramentas e atalhos: é essa concentração que alonga a home.
- `src/main/resources/static/js/mural.js` e `css/mural.css` ainda estão ligados à home.
- CSS da home usa `portal.css`, `portal-home-v3.css`, `portal-palette-v1.css`, `portal-editorial-v1.css`, `mural-social-v2.css` e `unh-app-access-v1.css`. Não apagar nem renomear em massa: há seletores dependentes de `.portal-home-v3`.
- Componentes JavaScript incluem `portal.js`, `nexo-agente.js` e `nexo-assistente.js`.
- Há módulos independentes já existentes: `gestao-a-vista.html`, `impressao.html`, `esg.html`, `gestao-documental.html`, `automacoes.html`.
- Autenticação de backend continua necessária apenas onde há operações protegidas; navegação pública não pode ser redirecionada ao login.

## Arquitetura de navegação desejada
1. `index.html`: hero redesenhado, **atalhos imediatamente visíveis**, carrossel pequeno de comunicados relevantes, Nexo e Helpdesk no rodapé. Home curta.
2. `aplicativos.html`: biblioteca de cartões com links para aplicativos *existentes*; nunca recriar Vikunja. Confirmar URL de cada app antes de publicar.
3. `comunicados.html`: comunicados institucionais, **sem** feed social, comentários e reações.
4. Módulos existentes continuam com suas rotas até a migração gradual.
5. Menu com navegação direta por páginas; nenhuma seção principal escondida em âncoras dentro de scroll infinito.

## Estrutura de pastas-alvo (incremental)
```
src/main/resources/
  static/
    index.html
    aplicativos.html
    comunicados.html
    gestao-a-vista.html           # existentes preservados
    impressao.html
    gestao-documental.html
    automacoes.html
    css/
      portal.css                  # legado; migrar por etapas
      portal-home-v3.css          # legado; não deletar até testes visuais
      portal-palette-v1.css
      portal-editorial-v1.css
      unh-app-access-v1.css
      ...                         # CSS dos módulos existentes
    js/
      portal.js
      nexo-agente.js
      nexo-assistente.js
      ...                         # scripts de módulos existentes
    assets/
  templates/                     # telas autenticadas: proteger conforme necessidade
docs/
  PORTAL_UNH_ARQUITETURA.md
```

## Ordem segura de implementação
1. Congelar o baseline e listar dependências reais entre HTML, CSS e JS.
2. Criar `aplicativos.html` e `comunicados.html` sem tocar na home original.
3. Testar cada página isoladamente, links e assets públicos; incluir testes de segurança de assets.
4. Somente depois editar `index.html` com mudança pequena: trocar âncoras por links e extrair mural/catálogo da home; manter atalhos visíveis.
5. Redesenhar o hero **depois** da separação, mantendo CSS isolado e screenshots de comparação.
6. Excluir códigos de mural apenas após confirmar que nenhum outro módulo depende deles.

## Prevenção de regressões
- Uma branch de desenvolvimento contínuo, sem merges cruzados feitos por `git pull origin outra-branch`.
- `git status` limpo antes de sincronizar; commits pequenos e com escopo.
- Não mover pastas nem renomear arquivos com referências ativas sem atualizar todas as dependências e testes.
- Antes de divulgar como pronto: `mvnw test`, testes JS aplicáveis, GET 200 para HTML/CSS/JS/assets e inspeção visual desktop/mobile.
- Não publicar dados reais, credenciais, endpoints internos além dos explicitamente autorizados.
