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
    }

    @Test
    void marcaEEstilosEstaoNoJar() {
        assertTrue(new ClassPathResource("static/assets/unh-logo-oficial-branca.png").exists());
        assertTrue(new ClassPathResource("static/assets/portal-unh-favicon-v2.png").exists());
        assertTrue(new ClassPathResource("static/css/styles.css").exists());
    }
}
