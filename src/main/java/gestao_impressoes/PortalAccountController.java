package gestao_impressoes;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PortalAccountController {

    @GetMapping("/minha-conta")
    public String myAccount(Authentication authentication, Model model) {
        model.addAttribute("userName", authentication.getName());
        return "minha-conta";
    }
}
