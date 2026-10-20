# Nexo contextual — sugestoes e avisos importantes (laboratorio)

## Entregue na branch de laboratorio

O Nexo usa **somente a rota da pagina aberta**, via `window.location.pathname`, para oferecer:
- identificacao do modulo atual;
- sugestao pratica para o contexto;
- **um aviso sobre limitacoes do prototipo**, com fonte visivel;
- duas perguntas recomendadas que preenchem o campo de conversa **sem enviar automaticamente**.

A IA local (Qwen/Ollama) continua sob ativacao explicita e restrita ao computador da pessoa desenvolvedora. Para saudacoes, orientacao e perguntas factuais conhecidas, o JavaScript local responde sem chamada de rede, reduzindo a latencia.

As fontes dos avisos sao apenas o codigo e a documentacao do prototipo, **nunca incidentes institucionais, tarefas ou dados em tempo real**.

## Exemplos em cada modulo

| Pagina | Sugestao | Aviso atual |
|---|---|---|
| Inicio / Mural | Como criar uma publicacao no modo de demonstracao | Perfil simulado, publicacoes descartadas ao atualizar |
| Gestao de Impressoes | Conferir serie, competencia e contadores | Outubro/2026 sem leitura confirmada; consumo desconhecido |
| Gestao a Vista | Comparar apenas meses conhecidos | Indicadores demonstrativos; Vikunja ainda nao conectado |
| Gestao Documental | Conferir integracao Perseus | Nao enviar documentos reais ao laboratorio |
| Automacoes | Consultar estadio das rotinas | Sem execucao institucional autorizada |
| ESG | Comparar dados auditaveis | Sem afirmar CO2/arvores/agua sem metodologia |

## Evolucao desejada: alertas inteligentes de verdade

Nenhum item abaixo esta implementado. Depende de fonte de dados autorizada, autenticacao, permissao por cargo e aprovacao da TI.

1. **Impressoras:** alertar sobre ausencia de leitura, aumento fora do padrao e franquia proxima do limite **somente com dados atualizados**.
2. **GLPI/chamados:** apresentar prazos de atendimento, chamados reincidentes e equipamentos criticos com evidencia verificavel.
3. **Documentos:** sugerir revisao de arquivos duplicados, campos obrigatorios ausentes e falhas de conferencia sem expor dados pessoais ao modelo.
4. **Gestao a Vista:** avisar quando um indicador estiver sem atualizacao ou apresentar variacao relevante, usando fonte e competencia.
5. **Automações:** informar quando uma rotina supervisionada falhar e propor revisao; **nunca executar reparos sem controle humano**.
6. **Mural:** avisar sobre comunicados autenticados e pertinentes ao perfil autorizado, nao publicacoes demonstrativas.

Todo aviso futuro devera ter estrutura `{id, categoria, severidade, titulo, descricao, fonte, atualizado_em, competencia, acao_permitida, exige_confirmacao}`.

Regras obrigatorias:
- diferenciar aviso **informativo**, **importante** e **critico**, sem inventar severidade;
- bloquear evento sem fonte, autenticacao ou data de atualizacao;
- respeitar permissao do usuario no **backend**;
- evitar alertas repetitivos ou alarmismo; permitir dispensar/silenciar;
- executar acoes sensiveis somente apos confirmacao humana e auditoria;
- nunca enviar dados confidenciais ao Qwen local por padrao;
- indicadores sem leitura continuam **desconhecidos**, jamais zero;
- usar APIs de leitura e metricas deterministicas antes de recorrer a IA generativa.

## Verificacao

`node --test tests/nexo-assistente.test.cjs`

`node --test tests/nexo-agente.test.cjs`

Os testes validam sugestoes por rota, avisos nao institucionais, origem, ferramenta rapida offline, envio com opt-in ao servidor local e regressao da interface do mascote.

**Nao confundir CI verde com homologacao funcional em ambiente institucional.**
