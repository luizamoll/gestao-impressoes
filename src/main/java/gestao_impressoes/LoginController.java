package gestao_impressoes;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

    @Value("${portal.lab.enabled:false}")
    private boolean labEnabled;

    @Value("${portal.lab.passwordless:false}")
    private boolean passwordless;

    @GetMapping("/login")
    public String login() {
        if (labEnabled && passwordless) {
            return "redirect:/gestao-a-vista.html";
        }
        return "login";
    }
}
