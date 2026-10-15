package gestao_impressoes;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;

/**
 * Credencial efemera e exclusiva do laboratorio local.
 * Nao e um substituto para LDAP/SSO e nao deve ser usado na rede institucional.
 */
@Configuration(proxyBeanMethods = false)
@ConditionalOnProperty(name = "portal.lab.enabled", havingValue = "true")
public class PortalLabUserConfiguration {

    @Bean
    UserDetailsService labUserDetails(@Value("${PORTAL_LAB_PASSWORD:}") String temporaryPassword) {
        if (temporaryPassword == null || temporaryPassword.length() < 24
                || temporaryPassword.contains("\n") || temporaryPassword.contains("\r")) {
            throw new IllegalStateException("Senha temporaria forte obrigatoria para o laboratorio.");
        }

        PasswordEncoder encoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();
        return new InMemoryUserDetailsManager(
            User.withUsername("admin.lab")
                .password(encoder.encode(temporaryPassword))
                .roles("ADMIN")
                .build()
        );
    }
}
