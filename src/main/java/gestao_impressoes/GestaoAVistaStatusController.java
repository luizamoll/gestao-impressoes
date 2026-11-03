package gestao_impressoes;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Estado seguro da Gestao a Vista, sem dados de contas nem de sistemas externos.
 * A API permanece protegida pela SecurityFilterChain do Portal.
 *
 * "conectado" indica apenas integracao de DADOS com outros sistemas,
 * nunca disponibilidade dos atalhos de navegacao.
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
                "Portal UNH",
                "catalogo_disponivel",
                false,
                "Links para ferramentas existentes estao disponiveis. Os indicadores de impressoes sao historicos e nao ha sincronizacao automatica de dados."
            ));
    }
}
