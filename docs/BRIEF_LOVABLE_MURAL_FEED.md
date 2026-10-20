# Brief oficial para Lovable — Mural UNH / Feed Premium

## Missão
Refinar visualmente o mural da intranet **Portal UNH (Unihorizontes)** para torná-lo o centro de atenção da homepage, com comportamento visual de um feed social moderno, porém identidade institucional sofisticada. **Trabalhar sobre o código existente: nunca recriar o projeto do zero.**

## Código de referência e isolamento
- Repositório: `luizamoll/gestao-impressoes`.
- **Branch de trabalho exclusiva:** `feat/mural-social-integracao-lovable-20261020`. Não editar `main`, `feat/autenticacao-portal`, `feat/mural-persistente-lab-20261020` nem `feat/nexo-conhecimento-local-20261019`.
- Esta branch nasceu do commit `083c2973674d972dabcfa26341b2928f2ceabed0`, que já contém o laboratório de mural persistente (PR #5) sobre o Nexo contextual atual.
- Backend: Spring Boot, Java 21. Frontend atual: **HTML/CSS/JavaScript estático**, não React. Não migrar a stack nem criar outro app como substituto.
- Home: `src/main/resources/static/index.html`, seção `#comunicados`, painel `#muralPanel`, lista `#muralFeed`; estilos `src/main/resources/static/css/mural.css`, `css/portal-home-v3.css`; comportamento `js/mural.js`.
- O protótipo atual já suporta postagens de teste, reações "Útil", comentários, respostas, moderação, permissões simuladas e aviso de dados fictícios.
- Separadamente, o mural **persistente de laboratório** está em `mural-lab.html` + `js/mural-lab.js` + backend `src/main/java/gestao_impressoes/mural/**`, perfil `mural-lab`, porta `127.0.0.1:18082`, autenticação HTTP Basic estritamente local. **Não conectá-lo automaticamente ao mural principal.**
- O Nexo tem mascote, scripts, CSS e modo IA local. **Não alterar seus arquivos nem sua aparência.**
- O FAQ antigo do PR #4 não foi mesclado; não sobrescrever as mudanças modernas do Nexo com arquivos antigos.

## Direção criativa
**Feed editorial institucional premium**: atmosfera contemporânea de rede social, mas com elegância, legibilidade e credibilidade. Visual adulto, clean e responsivo; sofisticado sem excesso de verde, sombras pesadas, gradientes berrantes ou aparência infantil.

Conceito visual:
1. **Mural como protagonista:** destaque do bloco na home por contraste tonal sutil (off-white frio, verde acinzentado ou areia suave), espaçamento generoso, moldura refinada e profundidade moderada. Não afetar a identidade visual do cabeçalho, menu ou ferramentas vizinhas.
2. **Topo editorial marcante:** “Mural institucional” com mensagem de acolhimento objetiva, indicação de demonstração e pequenos detalhes tipográficos. Nada de número de usuários online, curtidas inventadas ou novidades falsas.
3. **Cards com camadas:** superfícies brancas, bordas suaves, sombras difusas discretas e hover de elevação de 1–3 px; microinterações rápidas (120–220 ms) e respeito a `prefers-reduced-motion`.
4. **Hierarquia de leitura:** avatar/autoria e metadados bem resolvidos, categoria discreta, título de leitura imediata, corpo confortável, ações "Útil" e "Comentários" bem alinhadas, estados clicáveis claros.
5. **Primeiro conteúdo editorial em destaque:** pode ganhar mais espaço e tratamento tipográfico, **mas não rotular “fixado” ou “destaque oficial” sem dado real que justifique isso**. Não inventar imagem/capa nem conteúdo institucional.
6. **Compositor convidativo:** formulário claro, CTA "Publicar no teste" elegante, foco bem marcado, mensagens de erro/sucesso acessíveis. Perfil de teste NÃO equivale a autorização real.
7. **Sensação de vida discreta:** estados vazios, carregamento, confirmações, comentários e respostas bem cuidados. Nenhum auto-scroll, banners piscantes, feed infinito artificial ou contagens enganosas.
8. **Responsividade:** mobile primeiro, bom desktop com trilho lateral existente preservado; cards sem overflow horizontal, alvos clicáveis >=44px, contraste WCAG AA, navegação por teclado.

Paleta orientativa, sujeita a combinar com os tokens existentes: verde UNH somente em acentos (ex. `#165740`), fundo cinza-esverdeado muito claro (`#F5F8F6`), branco nos cards (`#FFFFFF`), texto carvão (`#24372F`), bordas `#DFE8E2`. Evitar criar um segundo sistema de design.

## Regras absolutas para não perder trabalho
- **Não apagar, substituir ou recriar** `mural.js`, `nexo-agente.js`, `nexo-assistente.js`, `mural-lab.js`, classes/IDs usados por JS, controllers, persistência, testes ou regras de autenticação.
- Preservar os controles existentes: `#muralRole`, `#muralRoleHelp`, `#muralPostForm`, `#muralPostTitle`, `#muralPostText`, `#muralFeed`, `#muralFeedback`.
- Não criar “login real” visual que represente autenticação verdadeira no mural de demonstração.
- Não remover o texto de demonstração nem fingir que publicações são persistentes na home.
- Não migrar dados, não configurar Supabase/Cloud, não solicitar credenciais institucionais, não publicar, não conectar API remota.
- Trabalhar de preferência em CSS específico com modificações HTML pequenas e compatíveis; só editar JS do mural se indispensável à usabilidade e com testes de regressão.
- Usar DOM seguro (`textContent`), evitando `innerHTML` para conteúdo criado por usuários.
- Preservar marca e SVG originais, inclusive robô Nexo, navegação, ferramentas e layout global.
- Se a plataforma não suportar diretamente o backend Spring/HTML estático, **entregar uma prévia isolada e uma especificação de CSS/HTML incremental**, não um site React novo apresentado como substituição do Portal.

## Fluxo de execução requerido
1. Primeiro **inspecionar o projeto existente** e enumerar, brevemente, os arquivos que pretende tocar e os que permanecerão protegidos.
2. Produzir uma proposta visual para o mural da página inicial, com estética premium e comportamento social discreto.
3. Implementar melhorias incrementais **somente na branch exclusiva**, sem alterar servidor, permissões, módulos não relacionados ou workflow de produção.
4. Manter o laboratório persistente do PR #5 separado e intacto. Se desejar harmonizar visualmente `mural-lab.html`, fazê-lo como segunda entrega isolada e sem tocar no comportamento/autenticação.
5. Apresentar antes/depois e listar precisamente os arquivos alterados, o motivo de cada alteração e como testar.
6. Rodar testes disponíveis, no mínimo `node --test tests/portal-home-v3.test.cjs`, `node --test tests/nexo-assistente.test.cjs`, `node --test tests/nexo-agente.test.cjs`, além dos testes específicos do mural existentes. Caso não seja possível executar, declarar explicitamente.
7. **Não efetuar merge, deploy ou publicação.** Enviar alterações para revisão humana via PR em rascunho.

## Critérios de aceitação
- A home mostra o mural como área editorial mais marcante sem desorganizar o menu, o catálogo ou o Nexo.
- Tudo que funciona hoje continua funcionando: reações, comentários, respostas, publicação simulada, mensagens e perfis do protótipo.
- O mural persistente Java + arquivos locais continua presente, isolado e protegido.
- As interfaces deixam evidente o que é laboratório e o que é informação real.
- Mobile, teclado, foco, contraste e redução de movimento foram verificados.
- **Nenhuma funcionalidade removida e nenhuma identidade visual institucional inventada.**

Entrega final: **um redesign cirúrgico, esteticamente irresistível e fiel ao projeto — não uma reconstrução.**
