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
