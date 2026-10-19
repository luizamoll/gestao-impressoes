# Gestão de Impressões — motor de apuração mensal (laboratório)

**Status:** componente Java implementado e coberto por testes; **ainda não ligado ao upload, banco de dados ou dashboard**. Não representa operação institucional homologada.

## Por que esse componente existe

Separar a leitura/extracão de PDF ou imagem da **regra de negócio**. O número de série identifica a máquina; a diferença entre dois contadores **confirmados de competências consecutivas** determina o consumo do equipamento.

A interface nunca pode inferir **consumo zero** apenas porque não há relatório novo. Cada competência tem franquia independente, mas até que o consumo seja apurado, o saldo e o excedente também são **desconhecidos**.

## Implementação

Classe: `src/main/java/gestao_impressoes/impressoes/ApuracaoMensal.java`.

Entrada:
- competência de referência (`YearMonth`);
- franquia **global** da competência (valor positivo);
- cadastro de equipamentos (série e localização);
- leituras com série, competência, contador acumulado e marcação de conferência.

Saída:
- situação de cada equipamento e motivo quando há pendência;
- consumo unitário **somente** se duas leituras necessárias estão validadas;
- subtotal das máquinas conferidas — **apenas diagnóstico** se a apuração estiver parcial;
- quando **todos** os equipamentos estão apurados, total global, saldo, excedente e equipamento mais utilizado.

Validações atuais:
- rejeita série vazia, localização ausente, contador negativo e franquia não positiva;
- normaliza séries e rejeita cadastros/leituras duplicados;
- bloqueia apuração global com leitura pendente, anterior ausente, contador decrescente ou equipamento novo sem cadastro;
- números long com aritmética exata; overflow gera erro em vez de resultado incorreto;
- ignora leituras fora da competência selecionada e da imediatamente anterior;
- empate no maior consumo é estável: ordem por série.

**A regra atual considera franquia global de impressões.** A divisão por preto e branco/cor, por equipamento, grupo ou contrato ainda depende de validação. Não calcular custo financeiro nesse motor sem confirmar a tarifa contratual.

## Como verificar

Em Windows, na pasta do projeto, após atualizar a branch de laboratório:

```powershell
.\mvnw.cmd -Dtest=ApuracaoMensalTests test
```

Suíte: `src/test/java/gestao_impressoes/impressoes/ApuracaoMensalTests.java`, com 18 casos sintéticos cobrindo mês fechado, excedente, franquia exata, ausência de leituras, duplicações, valores inconsistentes e erros numéricos.

O GitHub Actions também executa `./mvnw -B -ntp test` ao publicar alterações na branch do laboratório.

## Próxima etapa de integração

1. Receber ao menos um relatório PDF/PNG/JPG **anonimizado** ou um modelo sintético representativo e documentar campos/layout.
2. Construir a extração em módulo separado, com revisão humana dos campos críticos (série, contador, competência).
3. Definir autorização e persistência na infraestrutura aprovada pela TI; **não** colocar dados pessoais, segredos ou arquivos reais no repositório público.
4. Ligar a apuração validada ao painel de Gestão de Impressões e, depois, à Gestão à Vista. Estados pendentes devem ficar explícitos.
5. Não ativar upload com promessa falsa de análise: até integrar o backend, o botão da interface é demonstrativo.

A branch `feat/autenticacao-portal` é de laboratório. Não publicar na `main` sem revisão e aprovação.
