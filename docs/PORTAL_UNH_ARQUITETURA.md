# Portal UNH — arquitetura vigente e regras de preservação

**Revisado em:** 28/10/2026. **Branch de desenvolvimento:** `feat/atalhos-apps-home-20261027`.

> Consulte [PORTAL_UNH_PROCESSO.md](PORTAL_UNH_PROCESSO.md) para decisões, histórico de alterações, dívida técnica e o plano de **simplificação futura**. Este documento descreve apenas a arquitetura vigente, sem reproduzir o histórico.

## Navegação atual

- `src/main/resources/static/index.html`: home pública com hero, atalhos rápidos, carrossel **demonstrativo** (`#destaques`), Nexo e rodapé Helpdesk.
- `src/main/resources/static/aplicativos.html`: biblioteca separada com **7 aplicativos** e descrições didáticas. Helpdesk, Teams, Outlook e Vikunja são links externos; o Vikunja aponta para um projeto específico. As demais opções abrem módulos locais.
- `src/main/resources/static/gestao-a-vista.html`: Gestão à Vista.
- `src/main/resources/static/impressao.html`, `esg.html`, `gestao-documental.html`, `automacoes.html`: módulos existentes, com funcionalidades em estágios diferentes.
- `comunicados.html` **não existe mais**. O mural antigo não foi reativado. Não restaurar atalhos para `#comunicados` nem para `#ferramentas`.
- Menu principal de **Início, Aplicativos e Gestão à Vista**: **Início, Aplicativos e Gestão à Vista**, com mesma marca SVG, título **Portal UNH**, altura de 76 px no desktop e estilo em `css/unh-site-header.css`. Na Gestão à Vista, a barra de busca permanece como controle do dashboard abaixo do cabeçalho global.

## Arquitetura de interface

A home é feita com HTML/CSS/JS estáticos servidos pelo Spring Boot; não há necessidade comprovada de reescrever essa camada em framework de front-end. O visual aprovado valoriza **profundidade, iluminação, relevo e tipografia nítida**; evitar rotações de elementos com texto e filtros de blur.

**Entradas mais importantes:**

| Área | Arquivos |
| --- | --- |
| Cabeçalho global | `css/unh-site-header.css` + mesmo HTML institucional nas três páginas principais; a marca é `assets/portal-unh-simbolo.svg` |
| Home | `index.html`, `css/portal-home-v3.css`, `css/unh-app-access-v1.css`, `css/unh-destaques-v1.css`, `css/unh-banner-demo-v1.css`, `css/unh-home-depth-v1.css` |
| Biblioteca | `aplicativos.html`, `css/unh-pages-v1.css`, `css/unh-app-library-v2.css` |
| CSS compartilhado/legado da home | `css/portal.css`, `css/mural.css`, `css/portal-palette-v1.css`, `css/portal-editorial-v1.css`, `css/mural-social-v2.css`, `css/unh-legibilidade-v1.css` |
| Nexo | `js/nexo-agente.js`, `js/nexo-assistente.js`, `css/nexo-assistente.css`, `assets/nexo-robo*.svg` |
| Backend e proteção | `SecurityConfig.java`, `LoginController.java`, `application.properties` |

Os arquivos legados ainda podem definir seletores usados pela home. **Não remover nem consolidar em massa antes de mapear dependências visuais e realizar testes em todas as páginas.** A limpeza gradual está planejada em [PORTAL_UNH_PROCESSO.md](PORTAL_UNH_PROCESSO.md).

## Nexo: orientação ativa e IA opcional

O Nexo está incluído em **7 páginas principais**, responde perguntas conhecidas sobre o Portal usando regras locais e permanece aberto ao navegar dentro da mesma aba, caso o usuário o tenha deixado aberto. Se a IA experimental não responder, usa o guia local como fallback. Nenhuma resposta baseada em regras deve ser apresentada como saída de um modelo generativo.

A IA local é **opt-in** e exige `laboratorio/nexo-local/servidor_nexo.py`, `~/Nexo-Lab/nexo_unh.py` e o modelo configurado. Opera apenas em localhost e não consulta dados institucionais. Para funcionamento real na rede serão necessárias arquitetura, autenticação e autorização próprias. Consulte [NEXO_ATIVO.md](NEXO_ATIVO.md).

## Segurança e preservação

- As rotas GET públicas e os recursos `/css/**`, `/js/**`, `/assets/**` são definidos em `SecurityConfig.java`. Outras operações e APIs não liberadas permanecem sujeitas à segurança do backend. Não inferir autorização institucional apenas por conseguir abrir uma página.
- A rota `/login` redireciona para a home; **isso não é uma autenticação nova**. Revisar o fluxo antes de disponibilizar recursos protegidos.
- Nunca inserir credenciais, tokens, dados pessoais ou relatórios reais em HTML, JS, testes ou na ponte do Nexo.
- Preservar URLs fornecidas e aprovadas, identificando sua finalidade. Não inventar novas URLs de serviços institucionais.
- O repositório também contém o projeto de **Gestão de Impressões**. Evitar eliminar configurações e classes do backend durante mudanças visuais no Portal.

## Critérios para aceitar novas mudanças

1. Branch correta e working tree sem alterações inesperadas.
2. Menor alteração possível; registrar nova decisão no documento central.
3. Verificar referências e sintaxe, rodar testes pertinentes (especialmente `node --test tests/nexo-agente.test.cjs`) e `mvnw.cmd test` quando cabível.
4. Conferir HTML, CSS, JS e imagens no navegador; em alterações de layout, desktop e mobile.
5. Distinguir **publicado no GitHub**, **testado localmente** e **homologado**.

**Meta de longo prazo:** menos arquivos sobrepostos, menos cópias de navegação e menos instruções diferentes para atualizar o ambiente — **sem reescrever tudo nem perder o design aprovado**.
