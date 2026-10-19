package gestao_impressoes.impressoes;

import static gestao_impressoes.impressoes.ApuracaoMensal.Situacao.*;
import static org.junit.jupiter.api.Assertions.*;

import java.time.YearMonth;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * Laboratorio com casos sinteticos, sem arquivos/dados da instituicao.
 * Regras auditaveis: serie -> equipamento -> contador anterior -> consumo;
 * sem leitura/validacao, nunca divulgar saldo como se o consumo fosse zero.
 */
class ApuracaoMensalTests {
    private final ApuracaoMensal motor = new ApuracaoMensal();
    private static final YearMonth AGOSTO = YearMonth.of(2026, 8);
    private static final YearMonth SETEMBRO = YearMonth.of(2026, 9);
    private static final YearMonth OUTUBRO = YearMonth.of(2026, 10);
    private static final String A = "SERIE-A";
    private static final String B = "SERIE-B";

    private static ApuracaoMensal.Equipamento eq(String serie, String local) {
        return new ApuracaoMensal.Equipamento(serie, local);
    }

    private static ApuracaoMensal.Leitura l(String serie, YearMonth mes, long contador) {
        return new ApuracaoMensal.Leitura(serie, mes, contador, true);
    }

    private static ApuracaoMensal.Leitura pendente(String serie, YearMonth mes, long contador) {
        return new ApuracaoMensal.Leitura(serie, mes, contador, false);
    }

    private static List<ApuracaoMensal.Equipamento> duasMaquinas() {
        return List.of(eq(A, "Secretaria"), eq(B, "Biblioteca"));
    }

    @Test
    void calculaConsumoSaldoEEquipamentoMaisUtilizadoPorSerie() {
        // Casos sintéticos que reproduzem a aritmetica conhecida do historico:
        // 1439 + 83 = 1522, sem conexao com a base da UNH.
        var r = motor.apurar(SETEMBRO, 4000, duasMaquinas(), List.of(
                l(A, AGOSTO, 18_318), l(A, SETEMBRO, 19_757),
                l(B, AGOSTO, 17_146), l(B, SETEMBRO, 17_229)));
        assertTrue(r.completa());
        assertEquals(1522L, r.total());
        assertEquals(2478L, r.saldo());
        assertEquals(0L, r.excedente());
        assertEquals(1522L, r.subtotalConferido());
        assertEquals(A, r.maiorSerie());
        assertEquals(2, r.equipamentos().size());
        assertEquals("Secretaria", r.equipamentos().get(0).localizacao());
        assertEquals(1439L, r.equipamentos().get(0).consumo());
        assertEquals(83L, r.equipamentos().get(1).consumo());
        assertEquals(APURADO, r.equipamentos().get(0).situacao());
    }

    @Test
    void excedenteNaoGeraSaldoNegativo() {
        var r = motor.apurar(SETEMBRO, 4000, duasMaquinas(), List.of(
                l(A, AGOSTO, 100), l(A, SETEMBRO, 4_150),
                l(B, AGOSTO, 30), l(B, SETEMBRO, 180)));
        assertTrue(r.completa());
        assertEquals(4200L, r.total());
        assertEquals(0L, r.saldo());
        assertEquals(200L, r.excedente());
    }

    @Test
    void franquiaExataTemSaldoZeroEExcedenteZero() {
        var r = motor.apurar(SETEMBRO, 4000, List.of(eq(A, "TI")),
                List.of(l(A, AGOSTO, 10), l(A, SETEMBRO, 4010)));
        assertTrue(r.completa());
        assertEquals(4000L, r.total());
        assertEquals(0L, r.saldo());
        assertEquals(0L, r.excedente());
    }

    @Test
    void zeroSoExisteQuandoDuasLeiturasConferidasSaoIguais() {
        var r = motor.apurar(SETEMBRO, 4000, List.of(eq(A, "TI")),
                List.of(l(A, AGOSTO, 777), l(A, SETEMBRO, 777)));
        assertTrue(r.completa());
        assertEquals(0L, r.total());
        assertEquals(4000L, r.saldo());
        assertEquals(0L, r.equipamentos().get(0).consumo());
    }

    @Test
    void outubroSemLeituraNaoSignificaConsumoZeroNemFranquiaInteiraDisponivel() {
        var r = motor.apurar(OUTUBRO, 4000, duasMaquinas(), List.of(
                l(A, SETEMBRO, 19_757), l(B, SETEMBRO, 17_229)));
        assertFalse(r.completa());
        assertNull(r.total());
        assertNull(r.saldo());
        assertNull(r.excedente());
        assertNull(r.maiorSerie());
        assertEquals(0L, r.subtotalConferido());
        assertTrue(r.equipamentos().stream().allMatch(x ->
                x.situacao() == SEM_LEITURA && x.consumo() == null));
    }

    @Test
    void leituraParcialNaoSeFazPassarPorTotalDoMes() {
        var r = motor.apurar(SETEMBRO, 4000, duasMaquinas(), List.of(
                l(A, AGOSTO, 100), l(A, SETEMBRO, 180),
                l(B, AGOSTO, 200)));
        assertFalse(r.completa());
        assertEquals(80L, r.subtotalConferido());
        assertNull(r.total());
        assertNull(r.saldo());
        assertEquals(SEM_LEITURA, r.equipamentos().get(1).situacao());
    }

    @Test
    void naoUsaLeituraDeDoisMesesAtrasComoSeFosseMesAnterior() {
        var r = motor.apurar(OUTUBRO, 4000, List.of(eq(A, "RH")), List.of(
                l(A, AGOSTO, 200), l(A, OUTUBRO, 490)));
        assertFalse(r.completa());
        assertEquals(SEM_LEITURA_ANTERIOR, r.equipamentos().get(0).situacao());
        assertNull(r.total());
    }

    @Test
    void marcadorNaoConfirmadoNuncaParticipaDoCalculo() {
        var r = motor.apurar(SETEMBRO, 4000, List.of(eq(A, "TI")),
                List.of(l(A, AGOSTO, 210), pendente(A, SETEMBRO, 220)));
        assertFalse(r.completa());
        assertEquals(AGUARDANDO_CONFERENCIA, r.equipamentos().get(0).situacao());
        assertNull(r.equipamentos().get(0).consumo());
        var anteriorIncerto = motor.apurar(SETEMBRO, 4000, List.of(eq(A, "TI")),
                List.of(pendente(A, AGOSTO, 210), l(A, SETEMBRO, 220)));
        assertEquals(AGUARDANDO_CONFERENCIA, anteriorIncerto.equipamentos().get(0).situacao());
    }

    @Test
    void contadorQueDiminuiExigeAvaliacaoEJamaisProduzConsumoNegativo() {
        var r = motor.apurar(SETEMBRO, 4000, List.of(eq(A, "TI")),
                List.of(l(A, AGOSTO, 900), l(A, SETEMBRO, 100)));
        assertFalse(r.completa());
        assertEquals(CONTADOR_INCONSISTENTE, r.equipamentos().get(0).situacao());
        assertNull(r.total());
        assertNull(r.equipamentos().get(0).consumo());
    }

    @Test
    void leituraDeEquipamentoNaoCadastradoBloqueiaTotalGlobal() {
        var r = motor.apurar(SETEMBRO, 4000, List.of(eq(A, "TI")),
                List.of(l(A, AGOSTO, 100), l(A, SETEMBRO, 110), l(B, SETEMBRO, 220)));
        assertFalse(r.completa());
        assertEquals(10L, r.subtotalConferido());
        assertNull(r.total());
        assertEquals(2, r.equipamentos().size());
        assertEquals(B, r.equipamentos().get(1).serie());
        assertEquals(EQUIPAMENTO_NAO_CADASTRADO, r.equipamentos().get(1).situacao());
    }

    @Test
    void naoMarcaComoCompletoSemEquipamentos() {
        var r = motor.apurar(SETEMBRO, 4000, List.of(), List.of());
        assertFalse(r.completa());
        assertNull(r.total());
        assertTrue(r.equipamentos().isEmpty());
    }

    @Test
    void rejeitaSerieDuplicadaMesmoComCaixaEspacosDiferentes() {
        assertThrows(IllegalArgumentException.class, () -> motor.apurar(
                SETEMBRO, 4000, List.of(eq(" serie-a ", "TI"), eq("SERIE-A", "RH")), List.of()));
    }

    @Test
    void rejeitaLeiturasDuplicadasMesmoSeOsValoresSaoIguais() {
        assertThrows(IllegalArgumentException.class, () -> motor.apurar(
                SETEMBRO, 4000, List.of(eq(A, "TI")), List.of(
                        l(A, AGOSTO, 100), l(A, SETEMBRO, 110), l(" serie-a ", SETEMBRO, 110))));
    }

    @Test
    void normalizaNumeroDeSerieEOrdenaEquipamentos() {
        var r = motor.apurar(SETEMBRO, 4000, List.of(eq("s-b", "Biblioteca"), eq(" s-a ", "TI")),
                List.of(l("S-A", AGOSTO, 100), l(" s-a ", SETEMBRO, 105),
                        l("s-b", AGOSTO, 10), l("S-B", SETEMBRO, 15)));
        assertTrue(r.completa());
        assertEquals("S-A", r.equipamentos().get(0).serie());
        assertEquals("S-B", r.equipamentos().get(1).serie());
        assertEquals("S-A", r.maiorSerie(), "Empate resolvido por ordem de serie, sem aleatoriedade.");
    }

    @Test
    void registrosDeOutroPeriodoNaoAfetamApuracao() {
        var r = motor.apurar(SETEMBRO, 4000, List.of(eq(A, "TI")),
                List.of(l(A, AGOSTO, 10), l(A, SETEMBRO, 15), l("OUTRA", OUTUBRO, 999)));
        assertTrue(r.completa());
        assertEquals(5L, r.total());
    }

    @Test
    void rejeitaContagensNegativasCamposVaziosEFranquiaInvalida() {
        assertThrows(IllegalArgumentException.class, () -> l(A, SETEMBRO, -1));
        assertThrows(IllegalArgumentException.class, () -> eq("", "TI"));
        assertThrows(IllegalArgumentException.class, () -> eq(A, "  "));
        assertThrows(IllegalArgumentException.class, () -> motor.apurar(
                SETEMBRO, 0, List.of(eq(A, "TI")), List.of()));
        assertThrows(NullPointerException.class, () -> motor.apurar(
                null, 4000, List.of(eq(A, "TI")), List.of()));
    }

    @Test
    void overflowNaSomaNuncaRetornaTotalCorrompido() {
        assertThrows(ArithmeticException.class, () -> motor.apurar(SETEMBRO,
                4000, duasMaquinas(), List.of(
                        l(A, AGOSTO, 0), l(A, SETEMBRO, Long.MAX_VALUE),
                        l(B, AGOSTO, 0), l(B, SETEMBRO, 1))));
    }

    @Test
    void resultadoComLeiturasParciaisNaoPodeSerTransformadoEmCompleto() {
        var r = motor.apurar(OUTUBRO, 4000, duasMaquinas(), List.of());
        assertThrows(UnsupportedOperationException.class,
                () -> r.equipamentos().clear(), "Lista de auditoria e imutavel.");
    }
}
