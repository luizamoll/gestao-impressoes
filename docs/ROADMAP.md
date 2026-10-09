# Roadmap

## Fase 0 — Entender o relatório real

Objetivo: mapear o documento antes de escolher a tecnologia de extração.

- coletar exemplos de PDF, PNG e JPG;
- localizar número de série e contadores;
- verificar se o PDF possui texto selecionável;
- identificar variações de layout;
- definir os campos mínimos obrigatórios;
- registrar casos de erro.

**Saída:** mapa do relatório + estratégia de extração.

## Fase 1 — Importação e validação

- upload de PDF, PNG e JPG;
- validação de extensão e tamanho;
- extração inicial;
- tela de conferência;
- tratamento de equipamento não reconhecido.

**Saída:** dados confiáveis prontos para análise.

## Fase 2 — Equipamentos, histórico e contrato

- cadastro de equipamentos;
- associação número de série → localização;
- armazenamento das leituras;
- recuperação do período anterior;
- cadastro da franquia;
- cálculo de consumo e excedente.

**Saída:** núcleo de regras de negócio funcionando.

## Fase 3 — Dashboard e exportação

- consumo total;
- franquia utilizada;
- excedente;
- gráfico por equipamento;
- destaque de maior utilização;
- exportação para planilha.

**Saída:** MVP operacional.

## Fase 4 — Consumo responsável / ESG

- comparação mensal;
- tendência de consumo;
- metas;
- alertas;
- cards explicativos;
- insights automáticos baseados em regras;
- histórico por localização/equipamento.

**Saída:** camada ESG mensurável e didática.

## Fase 5 — Previsão

- projeção de fechamento;
- análise de tendência;
- alerta antecipado de possível excedente;
- refinamento com histórico suficiente.

**Saída:** apoio à previsão do volume e planejamento contratual.

## Critérios de qualidade do MVP

O MVP deve:

- manter rastreabilidade entre arquivo, leitura e resultado;
- impedir que leitura incerta seja tratada como dado confirmado;
- manter regras de cálculo testáveis;
- separar extração do arquivo das regras de negócio;
- não inventar métricas ambientais;
- permitir evolução sem depender de um único layout de relatório.
