package gestao_impressoes;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import static org.junit.jupiter.api.Assertions.assertTrue;

class PortalStaticResourcesTests {

    @Test
    void paginasPrincipaisEstaoNoJar() {
        assertTrue(new ClassPathResource("static/index.html").exists(), "Portal UNH deve abrir em /");
        assertTrue(new ClassPathResource("static/impressao.html").exists(), "Gestao de Impressoes deve estar disponivel");
        assertTrue(new ClassPathResource("static/esg.html").exists(), "Pagina ESG deve estar disponivel");
        assertTrue(new ClassPathResource("static/gestao-a-vista.html").exists());
        assertTrue(new ClassPathResource("static/gestao-documental.html").exists());
        assertTrue(new ClassPathResource("static/automacoes.html").exists());
    }

    @Test
    void marcaEEstilosEstaoNoJar() {
        assertTrue(new ClassPathResource("static/assets/unh-logo-oficial-branca.png").exists());
        assertTrue(new ClassPathResource("static/assets/portal-unh-favicon-v2.png").exists());
        assertTrue(new ClassPathResource("static/css/styles.css").exists());
        assertTrue(new ClassPathResource("static/css/portal.css").exists());
        assertTrue(new ClassPathResource("static/js/portal.js").exists());
        assertTrue(new ClassPathResource("static/css/mural.css").exists());
        assertTrue(new ClassPathResource("static/js/mural.js").exists());
        assertTrue(new ClassPathResource("static/css/leitura.css").exists());
        assertTrue(new ClassPathResource("static/css/painel-premium.css").exists());
        assertTrue(new ClassPathResource("static/js/sidebar.js").exists());
        assertTrue(new ClassPathResource("static/css/gestao-vista.css").exists());
        assertTrue(new ClassPathResource("static/css/gestao-documental.css").exists());
        assertTrue(new ClassPathResource("static/css/automacoes.css").exists());
        assertTrue(new ClassPathResource("static/js/automacoes.js").exists());
        assertTrue(new ClassPathResource("static/js/gestao-vista.js").exists());
        assertTrue(new ClassPathResource("static/assets/portal-unh-marca-verde.svg").exists());
        assertTrue(new ClassPathResource("static/assets/portal-unh-simbolo.svg").exists());
    }
}
