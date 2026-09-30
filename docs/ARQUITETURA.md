# Arquitetura proposta

## Princípio central

A leitura do arquivo deve ser separada das regras de negócio.

O sistema não deve depender de um único layout de relatório. PDF, PNG e JPG podem exigir estratégias diferentes de extração, mas todos devem entregar ao restante da aplicação uma estrutura de dados comum.

## Fluxo lógico

```text
Upload
  ↓
Identificação do tipo de arquivo
  ↓
Extração de dados
  ↓
Validação / conferência
  ↓
Identificação do equipamento
  ↓
Recuperação do histórico
  ↓
Cálculo do consumo
  ↓
Análise contratual
  ↓
Indicadores e insights
  ↓
Dashboard / exportação
```

## Camadas sugeridas

### 1. Entrada

Responsável por receber PDF, PNG ou JPG e validar requisitos básicos do upload.

Exemplos futuros:

```text
controller/
dto/
```

### 2. Extração

Responsável apenas por transformar o arquivo recebido em dados reconhecidos.

```text
extraction/
  pdf/
  image/
```

A estratégia de PDF poderá usar extração direta de texto quando o documento possuir camada textual. Imagens ou PDFs digitalizados poderão exigir OCR.

A implementação concreta só deverá ser escolhida depois da análise de relatórios reais.

### 3. Regras de negócio

Responsável por cálculos e decisões independentes do formato do arquivo.

```text
domain/
service/
```

Exemplos:

- consumo do mês;
- utilização da franquia;
- excedente;
- equipamento de maior consumo;
- comparação entre períodos.

### 4. Persistência

Responsável por equipamentos, localizações, contratos e histórico de leituras.

```text
repository/
domain/model/
```

A planilha de saída deve ser tratada como relatório/exportação. O histórico interno da aplicação deve ser armazenado de forma estruturada para permitir comparação entre meses e previsões futuras.

### 5. Indicadores e ESG

Responsável por transformar dados operacionais em informações compreensíveis.

```text
insight/
```

Exemplos:

- “O consumo caiu 8% em relação ao mês anterior.”
- “Este equipamento representa 31% das impressões do período.”
- “A franquia já atingiu 92%.”
- “O volume aumentou por três períodos consecutivos.”

Os insights devem ser determinísticos e auditáveis no MVP. IA generativa não é necessária para produzir essas análises iniciais.

### 6. Saída

```text
export/
```

Responsável por dashboard, dados consolidados e futura exportação para Excel.

## Estrutura de pacotes sugerida

```text
gestao_impressoes/
├── controller/
├── dto/
├── domain/
│   ├── model/
│   └── rule/
├── service/
├── repository/
├── extraction/
├── insight/
├── export/
├── exception/
└── config/
```

A criação dos pacotes deve acompanhar funcionalidades reais. Não serão adicionadas classes vazias apenas para preencher a estrutura.

## Decisões deixadas em aberto

Antes de implementar a extração, precisamos confirmar em um relatório real:

- onde aparece o número de série;
- quais contadores existem;
- se há contagem separada por cor/P&B;
- se um arquivo contém um ou vários equipamentos;
- se PDFs possuem texto selecionável;
- se o layout muda entre modelos de impressora;
- quais campos são confiáveis o suficiente para leitura automática.

Essas respostas definirão a tecnologia de extração sem acoplar o restante do sistema a um formato específico.
