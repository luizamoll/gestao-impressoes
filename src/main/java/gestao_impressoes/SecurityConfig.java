package gestao_impressoes;

import jakarta.servlet.DispatcherType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    /**
     * A excecao somente pode existir em um laboratorio explicitamente habilitado
     * e com o servidor vinculado a 127.0.0.1. Nunca abrir escuta na rede.
     */
    static void verifyLocalPasswordless(boolean enabled, boolean labEnabled, String address) {
        if (enabled && (!labEnabled || !"127.0.0.1".equals(address))) {
            throw new IllegalStateException(
                "Acesso sem senha exige PORTAL_LAB_ENABLED=true e SERVER_ADDRESS=127.0.0.1.");
        }
    }

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            @Value("${portal.lab.enabled:false}") boolean labEnabled,
            @Value("${portal.lab.passwordless:false}") boolean passwordless,
            @Value("${server.address:}") String serverAddress) throws Exception {

        verifyLocalPasswordless(passwordless, labEnabled, serverAddress);

        http.authorizeHttpRequests(auth -> {
            auth.dispatcherTypeMatchers(DispatcherType.ERROR).permitAll();
            if (passwordless) {
                // Apenas navegacao e status SEM dados institucionais. Todas as
                // operacoes de escrita e outras APIs continuam exigindo sessao.
                auth.requestMatchers(HttpMethod.GET,
                    "/", "/index.html",
                    "/gestao-a-vista.html",
                    "/impressao.html",
                    "/esg.html",
                    "/gestao-documental.html",
                    "/automacoes.html",
                    "/api/gestao-a-vista/status",
                    "/assets/**", "/css/**", "/js/**", "/favicon.ico"
                ).permitAll();
            } else {
                auth.requestMatchers(
                    "/", "/index.html",
                    "/css/portal.css", "/css/mural.css",
                    "/js/portal.js", "/js/mural.js",
                    "/assets/**", "/favicon.ico"
                ).permitAll();
            }
            auth.anyRequest().authenticated();
        })
        .formLogin(form -> form
            .loginPage("/login")
            .defaultSuccessUrl("/minha-conta")
            .permitAll()
        )
        .logout(logout -> logout.logoutSuccessUrl("/"));

        // Protecao CSRF permanece ativa inclusive no laboratorio.
        return http.build();
    }
}
