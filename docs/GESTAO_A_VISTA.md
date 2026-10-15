# Gestão à Vista — primeira etapa

## Visão
Submódulo do Portal UNH para concentrar indicadores operacionais com leitura didática,
comparações históricas, identificação de fonte e regras de cálculo transparentes.
Não deve se limitar ao sistema de impressões: este é apenas o primeiro conjunto de indicadores.

## Implementado na branch de desenvolvimento
- Página própria `gestao-a-vista.html` com layout responsivo e navegação de volta ao Portal UNH.
- Cartão de acesso na carteira de ferramentas; busca da home ampliada para vários cartões.
- Resumo de impressão por competência escolhida.
- Histórico baseado nos relatórios já empregados no projeto:
  - Agosto/2026: 1.016; franquia 4.000; saldo calculado 2.984; utilização 25,4%.
  - Setembro/2026: 1.522; franquia 4.000; saldo calculado 2.478; utilização 38,1%.
  - Setembro − Agosto = 506 impressões a mais, ou cerca de 49,8% de crescimento.
  - Outubro/2026: sem leitura registrada suficiente; consumo e saldo **desconhecidos**,
    jamais apresentar como 0 de consumo real.
- Barras de comparação e contexto de interpretação. Saldo e evolução não são estimados.
- Futuras áreas explicitamente sem indicador nem fonte ainda definida.
- Identificação permanente de que os dados são estáticos e requerem validação institucional.

## Para tornar operacional
1. Definir setores e decisões que cada indicador deve subsidiar.
2. Identificar fonte, dono do dado, fórmula, período, frequência e permissões.
3. Modelar APIs + armazenamento com autenticação institucional e auditoria.
4. Substituir os dados fixos por informações verificadas e atualizadas.
5. Testar com gestores e colaboradores; homologar com TI antes de produção.

Não houve publicação na hospedagem institucional nem alteração dos dados originais.

## Planejamento V2 — Gestão à Vista com Vikunja

A direção de produto definida em 15/10/2026 é manter **Vikunja como sistema de tarefas** e fazer da Gestão à Vista um painel gerencial de leitura, com filtros, indicadores, fonte e autorização por usuário/setor. Integração API **ainda não habilitada**; nenhum número de Vikunja foi coletado nem inventado. O visual futuro deve privilegiar neutros, usando verde UNH apenas em pontos de destaque e admitindo paisagens conceituais como elementos atmosféricos.

Ver especificação: [GESTAO_A_VISTA_V2_REQUISITOS.md](GESTAO_A_VISTA_V2_REQUISITOS.md).
