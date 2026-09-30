# Gestão de Impressões

Sistema para análise de relatórios de impressão, controle de consumo, apoio à gestão de contratos e evolução para indicadores de consumo responsável.

## Objetivo

Receber relatórios de impressoras em PDF, PNG ou JPG, identificar os equipamentos pelo número de série, recuperar a leitura anterior e calcular o volume mensal de impressões.

A solução deverá apoiar duas frentes:

1. **Gestão operacional e contratual** — acompanhar consumo, franquia e excedentes.
2. **Consumo responsável** — transformar o histórico de impressão em indicadores didáticos, comparações e oportunidades de redução, sem atribuir impacto ambiental não comprovado.

## Fluxo previsto do MVP

1. Upload do relatório.
2. Extração dos dados disponíveis no arquivo.
3. Validação dos dados reconhecidos.
4. Identificação do equipamento pelo número de série.
5. Recuperação da localização e da leitura do mês anterior.
6. Cálculo do consumo mensal por equipamento.
7. Consolidação do consumo total.
8. Comparação com a franquia contratada.
9. Identificação de excedente e do equipamento com maior utilização.
10. Exibição em painel e exportação do resultado.

## Indicadores iniciais

- Total de impressões no mês.
- Percentual da franquia consumida.
- Impressões excedentes.
- Volume por equipamento.
- Equipamento com maior utilização.
- Variação em relação ao período anterior, quando houver histórico.

## Camada ESG

O ESG será aplicado como uma camada de gestão e educação baseada em dados reais.

O sistema poderá apresentar:

- evolução mensal do consumo;
- redução ou aumento em relação ao período anterior;
- concentração de impressões por equipamento ou localização;
- alertas de consumo fora do padrão;
- metas de redução;
- explicações curtas sobre o significado de cada indicador;
- recomendações de ação baseadas nos dados disponíveis.

> Conversões como “árvores salvas”, CO₂ ou consumo de água só deverão aparecer quando existir metodologia definida, fonte documentada e dados suficientes para sustentar o cálculo.

## Tecnologia atual

- Java 21
- Spring Boot
- Maven

## Estado do projeto

A estrutura inicial foi criada. A implementação da leitura dos relatórios permanecerá desacoplada até a análise de arquivos reais, evitando assumir um formato que ainda não foi validado.

Consulte também:

- [Arquitetura proposta](docs/ARQUITETURA.md)
- [Regras de negócio](docs/REGRAS_NEGOCIO.md)
- [Roadmap](docs/ROADMAP.md)
