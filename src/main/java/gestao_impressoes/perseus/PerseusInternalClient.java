package gestao_impressoes.perseus;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Locale;
import java.util.regex.Pattern;

/** Ponte privada backend->Python. Este componente NAO disponibiliza endpoint ao navegador. */
public final class PerseusInternalClient {
    private static final int PDF_LIMITE = 80 * 1024 * 1024;
    private static final Pattern ATOR = Pattern.compile("[A-Za-z0-9_.@-]{3,128}");
    private static final Pattern JOB = Pattern.compile("[0-9a-f]{32}");
    private final String chave;
    private final URI base;
    private final HttpClient http;

    public PerseusInternalClient(String url, String chave) {
        URI uri = URI.create(url);
        if (!"http".equals(uri.getScheme()) || !"127.0.0.1".equals(uri.getHost())
                || uri.getPort() < 1 || uri.getPort() > 65535
                || uri.getRawUserInfo() != null || uri.getRawQuery() != null
                || uri.getRawFragment() != null
                || !(uri.getRawPath() == null || uri.getRawPath().isEmpty() || "/".equals(uri.getRawPath()))) {
            throw new IllegalArgumentException("Prototipo exige http://127.0.0.1:PORTA");
        }
        if (chave == null || chave.length() < 32 || chave.contains("\r") || chave.contains("\n")) {
            throw new IllegalArgumentException("Configure chave forte por variavel de ambiente.");
        }
        this.base = URI.create("http://127.0.0.1:" + uri.getPort() + "/");
        this.chave = chave;
        this.http = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NEVER)
                .connectTimeout(Duration.ofSeconds(5)).build();
    }

    public String saude() { return texto(requisicao("v1/saude", null).GET().build()); }

    /** O ator DEVE ser obtido da sessao autenticada no backend; nunca do header do usuario. */
    public String enviarPdf(String ator, byte[] pdf, String nome) {
        validarAtor(ator);
        if (pdf == null || pdf.length < 5 || pdf.length > PDF_LIMITE
                || pdf[0] != '%' || pdf[1] != 'P' || pdf[2] != 'D' || pdf[3] != 'F' || pdf[4] != '-') {
            throw new IllegalArgumentException("Arquivo deve ser PDF valido de ate 80 MB.");
        }
        if (nome == null || nome.isBlank()) throw new IllegalArgumentException("Nome PDF obrigatorio.");
        String arquivo = nome.replace('\\', '/');
        arquivo = arquivo.substring(arquivo.lastIndexOf('/') + 1);
        if (!arquivo.toLowerCase(Locale.ROOT).endsWith(".pdf") || arquivo.length() > 120
                || arquivo.length() < 5 || arquivo.contains("\n") || arquivo.contains("\r")) {
            throw new IllegalArgumentException("Nome PDF invalido.");
        }
        return texto(requisicao("v1/trabalhos", ator)
            .header("Content-Type", "application/pdf")
            .header("X-Filename", codificar(arquivo))
            .POST(HttpRequest.BodyPublishers.ofByteArray(pdf)).build());
    }

    public String consultar(String ator, String jobId) {
        validarAtor(ator);
        validarJob(jobId);
        return texto(requisicao("v1/trabalhos/" + jobId, ator).GET().build());
    }

    public byte[] baixar(String ator, String jobId, String nome) {
        validarAtor(ator);
        validarJob(jobId);
        if (nome == null || nome.length() > 180 || nome.isBlank()
                || nome.contains("/") || nome.contains("\\")
                || nome.contains("\r") || nome.contains("\n")
                || !(nome.endsWith(".zip") || nome.endsWith(".xlsx") || nome.endsWith(".pdf"))) {
            throw new IllegalArgumentException("Arquivo de saida invalido.");
        }
        return executar(requisicao("v1/trabalhos/" + jobId + "/download/" + codificar(nome), ator)
                .GET().build()).body();
    }

    private HttpRequest.Builder requisicao(String path, String ator) {
        HttpRequest.Builder request = HttpRequest.newBuilder(base.resolve(path))
            .timeout(Duration.ofMinutes(3))
            .header("X-Perseus-Service-Key", chave);
        if (ator != null) request.header("X-UNH-Actor", ator);
        return request;
    }

    private HttpResponse<byte[]> executar(HttpRequest request) {
        try {
            HttpResponse<byte[]> response = http.send(request, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() < 200 || response.statusCode() > 299)
                throw new ErroServico(response.statusCode());
            return response;
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Processamento interrompido.", ex);
        } catch (IOException ex) {
            throw new IllegalStateException("Serviço Perseus indisponível.", ex);
        }
    }

    private String texto(HttpRequest request) {
        return new String(executar(request).body(), StandardCharsets.UTF_8);
    }

    private static String codificar(String texto) {
        return URLEncoder.encode(texto, StandardCharsets.UTF_8).replace("+", "%20");
    }

    private static void validarAtor(String ator) {
        if (ator == null || !ATOR.matcher(ator).matches())
            throw new IllegalArgumentException("Identidade autenticada obrigatoria.");
    }

    private static void validarJob(String id) {
        if (id == null || !JOB.matcher(id).matches())
            throw new IllegalArgumentException("Identificador de trabalho invalido.");
    }

    /** Nunca inclui corpo remoto, dados de alunos nem credenciais na mensagem. */
    public static final class ErroServico extends RuntimeException {
        private final int status;
        public ErroServico(int status) {
            super("Perseus retornou HTTP " + status);
            this.status = status;
        }
        public int status() { return status; }
    }
}
