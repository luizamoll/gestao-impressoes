# Portal UNH — Mural com persistência experimental (20/10/2026)

## Escopo implementado

Laboratório local separado da página institucional. **Não é implantação, publicação oficial nem autenticação via Active Directory.**

- Somente perfil `mural-lab` inicia API e armazenamento.
- Porta 18082 e bind `127.0.0.1`: não serve acesso à rede.
- Três identidades de laboratório autenticadas com HTTP Basic e senhas fornecidas **em variáveis de ambiente**: `responsavel-lab` publica, exclui e modera; `colaborador-lab` comenta; `leitor-lab` apenas lê. Permissões são verificadas na cadeia de segurança do servidor, não no seletor de papel do navegador.
- Arquivo de persistência privado no computador: por padrão `${user.home}/.portal-unh-lab/mural.properties`. Salva publicações, data, autor, comentário e moderação em gravação temporária com substituição atômica quando suportada.
- Limites para testes: até 100 publicações e 100 comentários por publicação, texto e título com limites. Não colocar informações pessoais ou institucionais reais.
- Página independente: `http://127.0.0.1:18082/mural-lab.html`. A página inicial permanece com mural demonstrativo; portanto, **ainda não foi substituído o mural público pela versão persistente**.
- A senha digitada permanece apenas na memória JS, não em cookies, armazenamento local ou repositório. Por usar Basic, o laboratório deve permanecer **somente no próprio computador**, nunca ser exposto por HTTP na rede. A segurança HTTP/SSO de produção exigirá revisão da TI.

## Executar em Windows (PowerShell)

Na pasta do repositório, em uma cópia de laboratório e na branch `feat/mural-persistente-lab-20261020`:

```powershell
$env:SPRING_PROFILES_ACTIVE = "mural-lab"
$env:MURAL_LAB_RESPONSAVEL_PASSWORD = "defina-uma-senha-local-diferente"
$env:MURAL_LAB_COLABORADOR_PASSWORD = "defina-outra-senha-local"
$env:MURAL_LAB_LEITOR_PASSWORD = "defina-terceira-senha-local"
.\mvnw.cmd spring-boot:run
```

Abra `http://127.0.0.1:18082/mural-lab.html`. No perfil responsável, crie uma publicação fictícia. Recarregue a página e autentique novamente: a publicação deve continuar presente. Teste comentário como colaborador e tentativa de publicação como leitor (HTTP 403). Pare o servidor com `Ctrl+C`. Não use senhas institucionais. Remova as variáveis da sessão PowerShell quando encerrar (ou feche a janela).

Se quiser testes isolados sem servidor: `.\mvnw.cmd -Dtest=MuralLabStoreTest test`.

## Critérios antes de integrar na intranet

1. Executar testes automatizados Java e smoke HTTP; conferir CI no PR.
2. Revisar interface, acessibilidade, proteção contra CSRF/XSS, políticas de logs e retenção; definir banco institucional e backup.
3. Definir perfis/setores e integração de autenticação com TI, incluindo permissões por setor no backend.
4. Decidir política editorial e moderação, audiência/setor, anexos e exclusão.
5. Só então transformar a página principal para consumir a API, em branch distinta, com testes end-to-end e homologação.

**Não ativar na produção apenas alterando SPRING_PROFILES_ACTIVE.** Esse perfil foi desenvolvido exclusivamente para testes locais sem usuários reais.
