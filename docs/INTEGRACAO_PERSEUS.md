# Portal UNH ↔ Perseus — integração gradual

## Estado confirmado em 2026-10-15

- Portal UNH: repositório `luizamoll/gestao-impressoes`, branch `feat/estrutura-mvp-esg`. Home HTML estática, Gestão de Impressões Java/Spring Boot, em desenvolvimento.
- Perseus: repositório **privado** `luizamoll/perseus-conferencia`, branch de trabalho `feat/nova-interface`. Python local com `app.py` em `http://127.0.0.1:8878`, script `iniciar_windows.bat`, processamento de PDFs, conferência, Excel/CSV/PDF/ZIP.
- Primeira entrega: card "Conferência Perseus" que abre uma página explicativa com link ao servidor Python local e iniciador Windows. **Não há proxy, acesso remoto ou compartilhamento de documentos entre serviços.**
- O Perseus extrai e organiza dados de tabelas; **não promete comprimir o tamanho do arquivo PDF original**.
- O processo Python deve estar rodando no mesmo computador para que o endereço localhost funcione. A URL `127.0.0.1` no celular acessa o próprio celular, portanto esse método não fornece acesso remoto.

## Separação obrigatória

```
Portal UNH (HTML/JS navegação :8000)
  ├── Gestão de Impressões (Spring Boot, módulo próprio)
  ├── Gestão à Vista (painéis e relatórios)
  └── Gestão Documental → Conferência Perseus
                               ↘ Python local :8878
                                ↘ engine perseus.py e exportacao.py
```

Preservar os repositórios, seus testes e seus scripts. Não copiar arquivos Python para a pasta estática da intranet. Não substituir `app.py`, nem modificar sua interface sem análise explícita.

## Evolução sugerida para acesso corporativo (após validação da TI)

1. Confirmar a diferença entre "enxugar relatório", "extrair dados" e "conferir alunos", e quais saídas são realmente necessárias.
2. Testar o Perseus original no Windows com relatório de exemplo sem dados pessoais ou dados autorizados, validar Excel/CSV/PDF e discrepâncias.
3. Desenhar contrato de API: iniciar tarefa, obter progresso, consultar resultados, baixar artefatos com autorização. A API existente é local e utiliza token temporário; **não expô-la na rede sem autenticação, autorização e isolamento reais**.
4. Para hospedagem interna, colocar Perseus como serviço Python próprio atrás de gateway autenticado; conectar Portal via backend/gateway seguro em vez de link a localhost de cada usuário.
5. Usar pastas temporárias não públicas, proteção contra arquivos maliciosos, tamanho máximo, limite de concorrência, prazo de exclusão e logs sem documentos estudantis.
6. Adicionar integração visual ao Portal (upload/progresso/download) somente depois da API interna e da identidade estarem homologadas.
7. n8n opcional apenas para notificações/etapas secundárias; nunca como processador de PDFs ou canal não autorizado de dados pessoais.

## Como testar nesta fase

Portal UNH: iniciar seu servidor local e abrir `http://127.0.0.1:8000/gestao-documental.html`.
Perseus: na pasta Portal UNH, executar `iniciar_perseus_local.bat` (procura o projeto no perfil/área de trabalho); depois clicar em "Abrir Perseus neste computador". A janela do Python deve permanecer aberta.

O usuário deve saber que o link funciona somente com o servidor Python iniciado. Nenhuma etapa cria servidor remoto, hospeda documentos, instala n8n ou modifica os registros.
