package gestao_impressoes.impressoes;

import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;

/**
 * Motor deterministico de consumo, separado da extracao dos PDFs/imagens e do banco.
 * Trabalha somente com contadores conferidos; ausencia de leitura NUNCA equivale a zero.
 * Este componente NAO expoe endpoint publico nem grava dados institucionais.
 */
public final class ApuracaoMensal {
    public enum Situacao {
        APURADO,
        SEM_LEITURA,
        SEM_LEITURA_ANTERIOR,
        AGUARDANDO_CONFERENCIA,
        CONTADOR_INCONSISTENTE,
        EQUIPAMENTO_NAO_CADASTRADO
    }

    public record Equipamento(String serie, String localizacao) {
        public Equipamento {
            serie = normalizarSerie(serie);
            if (localizacao == null || localizacao.isBlank()) {
                throw new IllegalArgumentException("Localizacao do equipamento obrigatoria.");
            }
            localizacao = localizacao.trim();
        }
    }

    public record Leitura(String serie, YearMonth competencia, long contador, boolean confirmada) {
        public Leitura {
            serie = normalizarSerie(serie);
            Objects.requireNonNull(competencia, "Competencia da leitura obrigatoria.");
            if (contador < 0) throw new IllegalArgumentException("Contador nao pode ser negativo.");
        }
    }

    public record Linha(
            String serie,
            String localizacao,
            Situacao situacao,
            Long consumo,
            String motivo) {
        public Linha {
            Objects.requireNonNull(situacao);
            if (consumo != null && consumo < 0) {
                throw new IllegalArgumentException("Consumo nao pode ser negativo.");
            }
        }
    }

    /**
     * Quando completa=false, total/saldo/excedente/maiorSerie sao null.
     * subtotalConferido e apenas diagnostico (nunca o consumo global).
     */
    public record Resultado(
            YearMonth competencia,
            long franquia,
            List<Linha> equipamentos,
            boolean completa,
            long subtotalConferido,
            Long total,
            Long saldo,
            Long excedente,
            String maiorSerie) {
        public Resultado {
            equipamentos = List.copyOf(equipamentos);
            if (!completa && (total != null || saldo != null || excedente != null || maiorSerie != null)) {
                throw new IllegalArgumentException("Apuracao parcial nao pode divulgar total ou saldo.");
            }
        }
    }

    public Resultado apurar(
            YearMonth competencia,
            long franquia,
            List<Equipamento> equipamentos,
            List<Leitura> leituras) {
        Objects.requireNonNull(competencia, "Competencia de referencia obrigatoria.");
        Objects.requireNonNull(equipamentos, "Cadastro de equipamentos obrigatorio.");
        Objects.requireNonNull(leituras, "Leituras obrigatorias.");
        if (franquia <= 0) throw new IllegalArgumentException("Franquia deve ser positiva.");

        Map<String, Equipamento> cadastrados = new TreeMap<>();
        for (Equipamento item : equipamentos) {
            Objects.requireNonNull(item, "Equipamento nulo.");
            if (cadastrados.putIfAbsent(item.serie(), item) != null) {
                throw new IllegalArgumentException("Numero de serie duplicado: " + item.serie());
            }
        }

        // Uma leitura por equipamento/competencia. Registros duplicados exigem revisao,
        // nunca escolher silenciosamente uma das contagens.
        Map<String, Leitura> porPeriodo = new HashMap<>();
        YearMonth periodoAnterior = competencia.minusMonths(1);
        for (Leitura leitura : leituras) {
            Objects.requireNonNull(leitura, "Leitura nula.");
            if (!leitura.competencia().equals(competencia)
                    && !leitura.competencia().equals(periodoAnterior)) continue;
            String chave = leitura.serie() + "|" + leitura.competencia();
            if (porPeriodo.putIfAbsent(chave, leitura) != null) {
                throw new IllegalArgumentException("Leitura duplicada: " + chave);
            }
        }

        List<Linha> linhas = new ArrayList<>();
        long subtotal = 0;
        long maiorConsumo = -1;
        String maiorSerie = null;
        boolean completa = !cadastrados.isEmpty();

        for (Equipamento equipamento : cadastrados.values()) {
            String serie = equipamento.serie();
            Leitura atual = porPeriodo.get(serie + "|" + competencia);
            Leitura anterior = porPeriodo.get(serie + "|" + periodoAnterior);
            Linha linha;

            if (atual == null) {
                linha = pendente(equipamento, Situacao.SEM_LEITURA, "Sem leitura na competencia.");
            } else if (!atual.confirmada()) {
                linha = pendente(equipamento, Situacao.AGUARDANDO_CONFERENCIA,
                        "Leitura atual ainda nao validada.");
            } else if (anterior == null) {
                linha = pendente(equipamento, Situacao.SEM_LEITURA_ANTERIOR,
                        "Falta contador confirmado da competencia imediatamente anterior.");
            } else if (!anterior.confirmada()) {
                linha = pendente(equipamento, Situacao.AGUARDANDO_CONFERENCIA,
                        "Leitura anterior ainda nao validada.");
            } else if (atual.contador() < anterior.contador()) {
                linha = pendente(equipamento, Situacao.CONTADOR_INCONSISTENTE,
                        "Contador diminuiu: verificar troca, reset ou erro de leitura.");
            } else {
                long consumo = Math.subtractExact(atual.contador(), anterior.contador());
                linha = new Linha(serie, equipamento.localizacao(), Situacao.APURADO, consumo,
                        "Diferenca entre duas leituras validadas e consecutivas.");
                subtotal = Math.addExact(subtotal, consumo);
                if (consumo > maiorConsumo) {
                    maiorConsumo = consumo;
                    maiorSerie = serie;
                }
            }
            linhas.add(linha);
            if (linha.situacao() != Situacao.APURADO) completa = false;
        }

        // Detectar equipamento com leitura atual, mas sem cadastro.
        // Apenas leituras do mes solicitado participam dos indicadores.
        List<String> desconhecidos = porPeriodo.values().stream()
                .filter(leitura -> leitura.competencia().equals(competencia)
                        && !cadastrados.containsKey(leitura.serie()))
                .map(Leitura::serie)
                .sorted().toList();
        for (String serie : desconhecidos) {
            linhas.add(new Linha(serie, null, Situacao.EQUIPAMENTO_NAO_CADASTRADO,
                    null, "Confirmar cadastro e localizacao antes da apuracao."));
            completa = false;
        }

        if (!completa) {
            return new Resultado(competencia, franquia, linhas, false, subtotal,
                    null, null, null, null);
        }
        // O valor pode superar a franquia. Excedente e saldo nao podem ser negativos.
        long saldo = subtotal >= franquia ? 0 : Math.subtractExact(franquia, subtotal);
        long excedente = subtotal <= franquia ? 0 : Math.subtractExact(subtotal, franquia);
        return new Resultado(competencia, franquia, linhas, true, subtotal,
                subtotal, saldo, excedente, maiorSerie);
    }

    private static Linha pendente(Equipamento equipamento, Situacao situacao, String motivo) {
        return new Linha(equipamento.serie(), equipamento.localizacao(), situacao, null, motivo);
    }

    private static String normalizarSerie(String serie) {
        if (serie == null || serie.isBlank()) {
            throw new IllegalArgumentException("Numero de serie obrigatorio.");
        }
        return serie.trim().toUpperCase(Locale.ROOT);
    }
}
