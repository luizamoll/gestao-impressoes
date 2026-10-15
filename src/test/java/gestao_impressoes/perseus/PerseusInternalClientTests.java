package gestao_impressoes.perseus;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PerseusInternalClientTests {
    private HttpServer server;
    private PerseusInternalClient client;
    private final AtomicReference<String> actor = new AtomicReference<>();
    private final AtomicReference<String> key = new AtomicReference<>();
    private final AtomicReference<String> filename = new AtomicReference<>();

    @BeforeEach
    void preparar() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/", this::responder);
        server.start();
        client = new PerseusInternalClient("http://127.0.0.1:" + server.getAddress().getPort(),
            "t".repeat(48));
    }

    @AfterEach
    void parar() { server.stop(0); }

    private void responder(HttpExchange http) throws IOException {
        String path = http.getRequestURI().getRawPath();
        actor.set(http.getRequestHeaders().getFirst("X-UNH-Actor"));
        key.set(http.getRequestHeaders().getFirst("X-Perseus-Service-Key"));
        filename.set(http.getRequestHeaders().getFirst("X-Filename"));
        byte[] data;
        int status = 200;
        if ("sem.acesso".equals(actor.get())) {
            data = "{\"erro\":\"SEGREDO_NAO_EXIBIR\"}".getBytes(StandardCharsets.UTF_8);
            status = 404;
        } else if (path.equals("/v1/saude")) {
            data = "{\"estado\":\"operacional\"}".getBytes(StandardCharsets.UTF_8);
        } else if (path.equals("/v1/trabalhos")) {
            assertArrayEquals("%PDF-exemplo".getBytes(StandardCharsets.UTF_8),
                http.getRequestBody().readAllBytes());
            data = "{\"id\":\"teste\"}".getBytes(StandardCharsets.UTF_8);
            status = 202;
        } else if (path.endsWith("arquivo.xlsx")) {
            data = "EXCEL".getBytes(StandardCharsets.UTF_8);
        } else {
            data = "{\"estado\":\"concluido\"}".getBytes(StandardCharsets.UTF_8);
        }
        http.sendResponseHeaders(status, data.length);
        try (var out = http.getResponseBody()) { out.write(data); }
    }

    @Test
    void saudeUsaSomenteCredencialDeServidor() {
        assertTrue(client.saude().contains("operacional"));
        assertEquals("t".repeat(48), key.get());
        assertNull(actor.get());
    }

    @Test
    void fluxoEntreBackendsMantemIdentidadeEArquivos() {
        assertTrue(client.enviarPdf("colab.ti", "%PDF-exemplo".getBytes(StandardCharsets.UTF_8),
            "Relatorio outubro.pdf").contains("teste"));
        assertEquals("colab.ti", actor.get());
        assertEquals("Relatorio%20outubro.pdf", filename.get());
        assertTrue(client.consultar("colab.ti", "a".repeat(32)).contains("concluido"));
        assertArrayEquals("EXCEL".getBytes(StandardCharsets.UTF_8),
            client.baixar("colab.ti", "a".repeat(32), "arquivo.xlsx"));
    }

    @Test
    void recusaUrlExternaOuEntradasInvalidas() {
        assertThrows(IllegalArgumentException.class, () -> new PerseusInternalClient(
            "https://site-externo.com", "t".repeat(48)));
        assertThrows(IllegalArgumentException.class, () -> new PerseusInternalClient(
            "http://127.0.0.1:8879", "curta"));
        assertThrows(IllegalArgumentException.class, () -> client.enviarPdf("x",
            "%PDF-exemplo".getBytes(StandardCharsets.UTF_8), "arquivo.pdf"));
        assertThrows(IllegalArgumentException.class, () -> client.enviarPdf("colab.ti",
            "nao-pdf".getBytes(StandardCharsets.UTF_8), "arquivo.pdf"));
        assertThrows(IllegalArgumentException.class, () -> client.consultar("colab.ti", "../dados"));
        assertThrows(IllegalArgumentException.class, () -> client.baixar("colab.ti",
            "a".repeat(32), "../segredo.xlsx"));
    }

    @Test
    void respostasDeErroNaoRevelamDadosInternos() {
        PerseusInternalClient.ErroServico erro = assertThrows(
            PerseusInternalClient.ErroServico.class, () ->
                client.consultar("sem.acesso", "a".repeat(32)));
        assertEquals(404, erro.status());
        assertFalse(erro.getMessage().contains("SEGREDO_NAO_EXIBIR"));
    }
}
