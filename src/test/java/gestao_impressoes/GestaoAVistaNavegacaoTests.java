package gestao_impressoes;

import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GestaoAVistaNavegacaoTests {

    private String resource(String path) throws Exception {
        return new ClassPathResource(path).getContentAsString(StandardCharsets.UTF_8);
    }

    private int count(String text, String occurrence) {
        return (text.length() - text.replace(occurrence, "").length()) / occurrence.length();
    }

    @Test
    void quatroModulosTemLinksEConteudoSeparados() throws Exception {
        String html = resource("static/gestao-a-vista.html");

        assertEquals(4, count(html, "data-gv-view"));
        assertEquals(4, count(html, "data-gv-nav="));
        for (String id : new String[]{"gv-visao-geral", "gv-projetos", "gv-indicadores", "impressoes"}) {
            assertTrue(html.contains("href=\"#" + id + "\""), "Menu precisa navegar para " + id);
        }
        assertTrue(html.contains("id=\"gv-impressao-view\""));
        assertTrue(html.contains("id=\"gvPeriod\""));
        assertTrue(html.contains("id=\"gvConsumed\""));
        assertTrue(html.contains("Setembro/2026"));
        assertTrue(html.contains("Outubro/2026 · sem leitura"));
        assertTrue(html.contains("class=\"gv-next-modules\""),
            "Visão geral deve oferecer navegação rápida para módulos futuros.");
        assertTrue(html.contains("Versão de laboratório"),
            "Dados históricos devem permanecer claramente identificados.");

    }

    @Test
    void navegacaoPermiteHashEDegradacaoProgressiva() throws Exception {
        String javascript = resource("static/js/gestao-vista.js");
        String css = resource("static/css/gestao-vista.css");
        assertTrue(javascript.contains("hashchange"), "Voltar/avançar deve atualizar a visão.");
        assertTrue(javascript.contains("view.hidden"), "Visões devem alternar sem recarregar.");
        assertTrue(javascript.contains("aria-current"), "Menu deve identificar visão atual.");
        assertTrue(css.contains("[data-gv-view][hidden]"), "Conteúdo oculto não pode reaparecer pelo CSS.");
        assertTrue(javascript.contains("aguardando_autorizacao"));
    }

    @Test
    void semConexaoNaoInventaDadosDeTarefas() throws Exception {
        String html = resource("static/gestao-a-vista.html");
        assertTrue(html.contains("Nenhum nome, responsável ou tarefa institucional"));
        assertTrue(html.contains("Aguardando integração"));
        assertTrue(html.contains("O Vikunja institucional ainda não foi conectado."));
    }
}
