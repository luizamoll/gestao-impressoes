# Experiência do Portal UNH — Home v1

## Direção aprovada (14/10/2026)

Home **equilibrada**: ferramentas de trabalho e comunicados têm peso equivalente.
Visual editorial claro com verde como acento, não áreas inteiras verde sobre verde.
Usar a marca institucional aprovada no projeto sem apresentar como master oficial.

## Entregue nesta etapa

- Cabeçalho responsivo com logo, título e menu funcional Início / Comunicados / Ferramentas.
- Hero de apresentação com hierarquia clara e CTAs que levam às seções existentes.
- Dois painéis lado a lado no desktop e empilhados em telas menores: Ferramentas e Comunicados.
- Acesso real à Gestão de Impressões (frontend já existente).
- Mural de comunicados com estado vazio explícito; **nenhuma notícia fictícia publicada**.
- Módulos planejados (Tarefas/Projetos, Suporte interno, Gestão à Vista) sem links inativos.
- Menu mobile expansível e fechamento por Escape / seleção / clique externo.
- CSS e JS dedicados à home; não alteram os painéis de Impressões e ESG.
- Elementos sem funcionalidades reais (login, notificações, busca global) não foram exibidos.

## Próximos passos

1. Definir com a Comunicação e TI quem publica, edita, aprova e arquiva comunicados.
2. Modelar conteúdo: título, resumo, corpo, categoria, publicação, autor/setor, status e visibilidade.
3. Criar API de comunicados em Spring Boot com PostgreSQL, autenticação institucional e autorização por perfil.
4. Implementar cards reais (recente, fixado e/ou urgente) somente após aprovação e conteúdo oficial.
5. Montar catálogo de ferramentas a partir de serviços aprovados, com público-alvo e URL de acesso autorizada.
6. Estudar acesso por LDAP/AD antes de criar "Meu trabalho", favoritos por usuário ou notificações.
7. Homologar acessibilidade e visual em desktop, tablet e celular com usuários da UNH.

## Escopo e segurança

A mudança é apenas na branch de desenvolvimento. A homepage é estática; não publica mensagens,
não faz login, não gerencia arquivos e não tem backend de comunicados.
A imagem arquitetônica ilustrativa do mockup aprovado não foi tratada como foto real do campus;
foi substituída por uma composição abstrata de marca.
Nenhum deploy para o servidor da UNH é realizado automaticamente.


## Protótipo do Mural Interativo (14/10/2026)

**Regra escolhida:** somente responsáveis e setores autorizados criam publicações.
Colaboradores comentam e reagem em posts permitidos. Leitores apenas visualizam.

A home agora contém um protótipo com alternância de perfis simulados, publicação
de teste, comentário, resposta em um nível, reação "Útil", bloqueio/habilitação
de comentários por publicação, ocultação/restauração de comentários e exclusão
das publicações de teste criadas pelo responsável.

O formulário recusa links, endereços de e-mail, três exemplos de termos ofensivos
e comentários idênticos. Esses filtros existem SOMENTE no navegador para ilustrar
o comportamento; não são uma solução de segurança ou moderação suficiente.

O protótipo utiliza apenas memória JavaScript e reinicia ao atualizar. Não há
autenticação, persistência, publicação institucional real, anexos ou notificações.
A alternância de perfis serve para avaliar a interface e **não constitui permissão real**.

Antes do uso institucional:
- integração de contas institucionais e autorização no backend;
- modelo persistido PostgreSQL para usuários, postagens, comentários, reações,
  permissões por post, moderação e auditoria;
- revisão e aplicação no servidor das políticas de conteúdo (não confiar no JS);
- limite de requisições, antifraude, XSS, CSRF, privacidade e ciclo de retenção;
- especificar quem aprova comunicados oficiais e o que deve ser público/restrito.


## Revisão de hierarquia da home (14/10/2026)

- Ferramentas deixam de competir lado a lado com um feed crescente: catálogo compacto e horizontal logo depois do destaque.
- Mural institucional vem em seção separada, abaixo, em coluna de leitura de até 900px.
- Hero troca composição gráfica genérica pela fotografia real da entrada da instituição fornecida pela usuária; o arquivo é otimizado em AVIF e não usa imagem sintética de fachada.
- Responsividade: cartão de ferramenta reorganiza-se para telas pequenas; foto ganha recorte adaptável.
- Sem alteração do mural interativo, da Gestão de Impressões, do Dockerfile ou da hospedagem institucional.


## Correção do hero após revisão visual

A foto ficou artificial e borrada por compressão excessiva (arquivo inicial do repositório de apenas 5,4 KB para 800 × 446). Alteração de layout: o hero agora usa foto em proporção natural 16:9, recorte retangular discreto, sem selo sobre a imagem e sem bordas orgânicas exageradas, com texto independente à esquerda. O recurso atual permanece provisório até que uma fotografia com qualidade adequada seja incorporada ao repositório. Esta correção não altera a intranet institucional nem o feed.


## Novo visual conceitual aprovado

O mockup visual aprovado pela usuária foi tratado como referência de direção de arte, não como captura de tela para inserir inteira. A home referencia `assets/portal-unh-conceito.webp`, um recorte do ambiente gerado. Este ativo é uma imagem **conceitual**, não uma fotografia oficial das instalações. A imagem deve ser adicionada ao diretório estático antes da publicação; se estiver ausente no ambiente local, um fallback visual evita imagem quebrada. Cabeçalho, botões e atalhos permanecem HTML funcionais. A mudança não altera o dashboard Gestão à Vista, o mural nem o deploy da TI.
