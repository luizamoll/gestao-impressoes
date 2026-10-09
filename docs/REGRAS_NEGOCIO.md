# Regras de negócio

Este documento registra o que já está confirmado pelo escopo e separa isso das decisões que ainda precisam de validação.

## Regras confirmadas

### RN-01 — Identificação do equipamento

O número de série será a referência usada para identificar cada equipamento.

### RN-02 — Localização

Após identificar o número de série, o sistema deve recuperar a localização associada ao equipamento.

### RN-03 — Leitura anterior

O sistema deve recuperar a última contagem registrada, referente ao período anterior.

### RN-04 — Consumo mensal

O volume de impressões do período é calculado pela diferença entre a contagem atual e a contagem anterior.

```text
consumo = contagem_atual - contagem_anterior
```

### RN-05 — Consumo total

O consumo total do mês corresponde à soma do consumo de todos os equipamentos processados.

### RN-06 — Franquia

O consumo total deve ser comparado à franquia contratada.

### RN-07 — Excedente

Quando o consumo ultrapassar a franquia, o excedente é:

```text
excedente = consumo_total - franquia
```

Quando a franquia não for ultrapassada, o excedente deve ser zero.

### RN-08 — Maior utilização

O painel deve identificar o equipamento com maior volume de impressões no período.

### RN-09 — Histórico

A leitura atual validada deve poder ser utilizada como referência para a análise do período seguinte.

### RN-10 — Indicadores ESG

Indicadores de consumo responsável devem ser derivados de dados observados e do histórico armazenado.

Exemplos válidos:

- redução percentual de páginas;
- aumento percentual de páginas;
- tendência de consumo;
- participação de um equipamento no total;
- progresso em relação a uma meta definida.

Conversões ambientais indiretas exigem metodologia e fonte documentadas.

## Situações que ainda precisam de regra

### Equipamento não cadastrado

Definir se o usuário poderá cadastrá-lo durante a importação ou se o processamento ficará pendente.

### Contagem atual menor que a anterior

Pode indicar:

- erro de leitura;
- troca do equipamento;
- troca/reset de contador;
- cadastro incorreto.

O sistema não deve transformar automaticamente essa diferença em consumo negativo sem regra definida.

### Equipamento substituído

Definir como preservar o histórico quando uma impressora for substituída.

### Tipos de contador

Confirmar se o relatório possui:

- contador total;
- preto e branco;
- colorido;
- cópia;
- impressão;
- digitalização.

### Franquia

Confirmar se a franquia é:

- global por contrato;
- por equipamento;
- por grupo de equipamentos;
- diferente para P&B e colorido.

### Excedente financeiro

O escopo atual prevê quantidade excedente. Para calcular custo excedente, será necessário conhecer a regra tarifária do contrato.

### Previsão

Para uma previsão confiável, definir:

- frequência das leituras;
- quantidade mínima de histórico;
- se haverá projeção dentro do mês;
- se a sazonalidade deve ser considerada.

## Validação de extração

Antes de gravar dados reconhecidos de PDF ou imagem, o sistema deverá permitir conferência quando houver risco de leitura incorreta.

Campos críticos:

- número de série;
- contagem atual;
- competência/período.

A experiência deve priorizar correção dos dados, não apenas automação.
