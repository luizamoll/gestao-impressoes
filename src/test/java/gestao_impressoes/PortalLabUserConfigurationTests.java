package gestao_impressoes;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(properties = {
    "portal.lab.enabled=true",
    "PORTAL_LAB_PASSWORD=senha-ficticia-apenas-para-teste-123"
})
@ActiveProfiles("sem-banco")
class PortalLabUserConfigurationTests {

    @Autowired
    private UserDetailsService users;

    @Test
    void administradorDeLaboratorioExisteComSenhaCodificada() {
        UserDetails admin = users.loadUserByUsername("admin.lab");

        assertEquals("admin.lab", admin.getUsername());
        assertEquals("ROLE_ADMIN", admin.getAuthorities().iterator().next().getAuthority());
        assertFalse(admin.getPassword().contains("senha-ficticia-apenas-para-teste-123"));
        assertTrue(PasswordEncoderFactories.createDelegatingPasswordEncoder()
            .matches("senha-ficticia-apenas-para-teste-123", admin.getPassword()));
    }

    @Test
    void rejeitaSenhaAusenteOuCurta() {
        PortalLabUserConfiguration config = new PortalLabUserConfiguration();
        assertThrows(IllegalStateException.class, () -> config.labUserDetails(""));
        assertThrows(IllegalStateException.class, () -> config.labUserDetails("curta"));
    }
}
