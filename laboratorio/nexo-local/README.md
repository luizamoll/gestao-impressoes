# Nexo UNH — IA local dentro do navegador (laboratório)

O Portal UNH mantém **o mascote e o chat de regras existentes**. Apenas no navegador local (localhost) surge um botão de ativação **manual** do modo IA. O serviço Python é executado na estação de desenvolvimento e usa o `nexo_unh.py` da versão rápida v2 já instalada em `C:\Users\<usuario>\Nexo-Lab`.

## Para usar no Windows

1. Sincronize a branch `feat/autenticacao-portal` do GitHub com a pasta onde você já inicia o Portal.
2. Não abra `index.html` como arquivo. **Inicie o Portal como de costume**, acessando pelo navegador `http://127.0.0.1:18081/` (ou `http://localhost:18081/`; porta 8080 também é aceita).
3. Abra **um segundo PowerShell**, deixando o Portal rodando no primeiro (se ele usa terminal), e execute na pasta do projeto:

```powershell
py laboratorio\nexo-local\servidor_nexo.py
```

4. Mantenha a janela do servidor aberta: ela deve indicar `http://127.0.0.1:18767`. O arquivo `nexo_unh.py` deve continuar em `$HOME\Nexo-Lab`. O Ollama/Qwen3 instalado no seu computador atende perguntas abertas.
5. Abra o Nexo no canto da página e clique em **Ativar IA local (laboratório)**.
6. Pergunte: `Compare agosto e setembro, explique outubro e liste os módulos do Portal UNH.`
7. Ao terminar, use **Voltar ao modo de regras**, ou `Ctrl+C` para encerrar o servidor.

Se não aparecer o botão, confira se o Portal está em **localhost / 127.0.0.1**, porta **18081 ou 8080**. Em instalações remotas o botão não aparece de propósito.

## Segurança e limites

- Serviço restrito a `127.0.0.1:18767`, sem escutar na rede interna ou Internet.
- Somente páginas locais do Portal nas portas permitidas conseguem acessar a resposta no navegador (CORS restrito).
- O modo IA **não liga automaticamente**: precisa clicar no botão.
- Não há armazenamento de conversas, upload de arquivos, tokens, cookies ou integração com GLPI, Vikunja, banco de dados ou dados de alunos.
- **Somente dados demonstrativos** do `nexo_unh.py`; estados documentados podem ficar desatualizados.
- O filtro básico de termos sensíveis não garante proteção de privacidade. **Não digite dados pessoais, senhas ou relatórios reais.**
- Não publicar esse servidor em produção. A integração institucional exige aprovação da TI, autenticação no backend, autorização, limites de uso e auditoria.
- Perguntas simples podem usar resposta instantânea; perguntas abertas ainda podem demorar com 8 GB de RAM.

Testes (sem Ollama):

```powershell
py -m unittest discover -s laboratorio/nexo-local -p "test_*.py" -q
```

A versão rápida v2 do agente é uma dependência **local**, não incluída neste repositório. Esta ponte preserva o laboratório já testado pela usuária sem alterar o Java nem o servidor institucional.
