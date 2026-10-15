package gestao_impressoes;

import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {
        "server.address=127.0.0.1",
        "portal.lab.enabled=true",
        "PORTAL_LAB_PASSWORD=senha-ficticia-apenas-para-teste-123"
    }
)
@ActiveProfiles("sem-banco")
class PortalLoginFlowTests {

    @Value("${local.server.port}")
    int port;

    private URI url(String path) {
        return URI.create("http://127.0.0.1:" + port + path);
    }

    private HttpClient client() {
        return HttpClient.newBuilder()
            .cookieHandler(new CookieManager(null, CookiePolicy.ACCEPT_ALL))
            .followRedirects(HttpClient.Redirect.NEVER)
            .connectTimeout(Duration.ofSeconds(4))
            .build();
    }

    private HttpResponse<String> get(HttpClient client, String path) throws Exception {
        return client.send(
            HttpRequest.newBuilder(url(path)).GET().timeout(Duration.ofSeconds(8)).build(),
            HttpResponse.BodyHandlers.ofString());
    }

    private String csrfFrom(String html) {
        Matcher m = Pattern.compile("name=\"_csrf\"[^>]*value=\"([^\"]+)\"")
            .matcher(html);
        assertTrue(m.find(), "O formulário deve conter token CSRF renderizado pelo Thymeleaf.");
        return m.group(1);
    }

    @Test
    void homeAbertaEAreaProtegidaExigeLoginPersonalizado() throws Exception {
        HttpClient client = client();
        assertEquals(200, get(client, "/").statusCode());

        HttpResponse<String> protectedPage = get(client, "/gestao-a-vista.html");
        assertEquals(302, protectedPage.statusCode());
        assertTrue(protectedPage.headers().firstValue("location").orElse("").contains("/login"));

        HttpResponse<String> login = get(client, "/login");
        assertEquals(200, login.statusCode());
        assertTrue(login.body().contains("Entre no seu espaço."));
        csrfFrom(login.body());
    }

    @Test
    void senhaValidaAbreMinhaContaComSessaoEPermiteSair() throws Exception {
        HttpClient client = client();
        String csrf = csrfFrom(get(client, "/login").body());

        String body = "username=admin.lab&password="
            + URLEncoder.encode("senha-ficticia-apenas-para-teste-123", StandardCharsets.UTF_8)
            + "&_csrf=" + URLEncoder.encode(csrf, StandardCharsets.UTF_8);
        HttpResponse<String> response = client.send(
            HttpRequest.newBuilder(url("/login"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .timeout(Duration.ofSeconds(8)).build(),
            HttpResponse.BodyHandlers.ofString());

        assertEquals(302, response.statusCode());
        assertTrue(response.headers().firstValue("location").orElse("").contains("/minha-conta"));

        HttpResponse<String> account = get(client, "/minha-conta");
        assertEquals(200, account.statusCode());
        assertTrue(account.body().contains("Login realizado!"));
        assertTrue(account.body().contains("admin.lab"));
        assertEquals(200, get(client, "/gestao-a-vista.html").statusCode());

        // A falha de pagina protegida deve manter HTTP 404 e apresentar a
        // mensagem segura, nao uma pagina de erro 999 ou redirecionamento.
        HttpResponse<String> missing = get(client, "/pagina-que-nao-existe-portal-unh");
        assertEquals(404, missing.statusCode());
        assertTrue(missing.body().contains("Não foi possível abrir esta página."));
    }

    @Test
    void senhaInvalidaRetornaAoFormularioSemPagina999() throws Exception {
        HttpClient client = client();
        String csrf = csrfFrom(get(client, "/login").body());
        String body = "username=admin.lab&password=senha-errada&_csrf="
            + URLEncoder.encode(csrf, StandardCharsets.UTF_8);
        HttpResponse<String> response = client.send(
            HttpRequest.newBuilder(url("/login"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .timeout(Duration.ofSeconds(8)).build(),
            HttpResponse.BodyHandlers.ofString());
        assertEquals(302, response.statusCode());
        assertTrue(response.headers().firstValue("location").orElse("").contains("/login?error"));

        HttpResponse<String> errorPage = get(client, "/login?error");
        assertEquals(200, errorPage.statusCode());
        assertTrue(errorPage.body().contains("Usuário ou senha incorretos"));
    }
}
