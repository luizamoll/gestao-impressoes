package gestao_impressoes;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Acesso ao Portal UNH: a navegacao publica nao exige conta.
 * A autenticacao de APIs e operacoes internas continua sob SecurityConfig.
 */
@Controller
public class LoginController {

    @GetMapping("/login")
    public String login() {
        return "redirect:/";
    }
}
