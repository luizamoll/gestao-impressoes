package gestao_impressoes;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Contrato inicial de leitura da Gestao a Vista.
 * Nao acessa Vikunja, nao retorna tarefas e nao recebe segredos.
 * A API permanece protegida pela SecurityFilterChain do Portal.
 */
@RestController
public class GestaoAVistaStatusController {

    public record IntegracaoStatus(
        String fonte,
        String estado,
        boolean conectado,
        String detalhe
    ) { }

    @GetMapping("/api/gestao-a-vista/status")
    public ResponseEntity<IntegracaoStatus> status() {
        return ResponseEntity.ok()
            .cacheControl(CacheControl.noStore())
            .body(new IntegracaoStatus(
                "Vikunja",
                "aguardando_autorizacao",
                false,
                "A instancia institucional ainda nao foi integrada ou autorizada pela TI."
            ));
    }
}
