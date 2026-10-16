package gestao_impressoes;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {
        "server.address=127.0.0.1",
        "portal.lab.enabled=true",
        "portal.lab.passwordless=true",
        "PORTAL_LAB_PASSWORD=senha-ficticia-apenas-para-teste-123"
    }
)
@ActiveProfiles("sem-banco")
class PortalLabPasswordlessTests {

    @Value("${local.server.port}")
    int port;

    private HttpResponse<String> get(String path, String accept) throws Exception {
        try (HttpClient client = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.NEVER)
                .connectTimeout(Duration.ofSeconds(4))
                .build()) {
            return client.send(
                HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path))
                    .header("Accept", accept)
                    .timeout(Duration.ofSeconds(8))
                    .GET()
                    .build(),
                HttpResponse.BodyHandlers.ofString());
        }
    }

    @Test
    void paginasLocaisAbremSemSessaoOuSenha() throws Exception {
        assertEquals(200, get("/", "text/html").statusCode());
        assertEquals(200, get("/gestao-a-vista.html", "text/html").statusCode());
        assertEquals(200, get("/impressao.html", "text/html").statusCode());
        assertEquals(200, get("/gestao-documental.html", "text/html").statusCode());
        HttpResponse<String> status = get("/api/gestao-a-vista/status", "application/json");
        assertEquals(200, status.statusCode());
        assertTrue(status.body().contains("aguardando_autorizacao"));
        assertTrue(status.body().contains("\"conectado\":false"));
    }

    @Test
    void loginLocalEncaminhaDiretoSemExibirFormulario() throws Exception {
        HttpResponse<String> login = get("/login", "text/html");
        assertEquals(302, login.statusCode());
        assertTrue(login.headers().firstValue("location").orElse("").endsWith("/gestao-a-vista.html"));
    }

    @Test
    void rotasSensíveisContinuamExigindoAutenticacao() throws Exception {
        HttpResponse<String> account = get("/minha-conta", "text/html");
        assertEquals(302, account.statusCode());
        assertTrue(account.headers().firstValue("location").orElse("").contains("/login"));
    }

    @Test
    void nuncaPermitirBypassNaRedeOuForaDoLaboratorio() {
        assertDoesNotThrow(() -> SecurityConfig.verifyLocalPasswordless(true, true, "127.0.0.1"));
        assertDoesNotThrow(() -> SecurityConfig.verifyLocalPasswordless(false, false, "0.0.0.0"));
        assertThrows(IllegalStateException.class,
            () -> SecurityConfig.verifyLocalPasswordless(true, false, "127.0.0.1"));
        assertThrows(IllegalStateException.class,
            () -> SecurityConfig.verifyLocalPasswordless(true, true, "0.0.0.0"));
        assertThrows(IllegalStateException.class,
            () -> SecurityConfig.verifyLocalPasswordless(true, true, "::"));
    }
}
