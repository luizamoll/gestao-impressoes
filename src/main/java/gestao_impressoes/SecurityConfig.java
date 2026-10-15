package gestao_impressoes;

import jakarta.servlet.DispatcherType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                // Permite renderizar erros reais sem redirecionar o despacho ERROR ao login.
                .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                .requestMatchers(
                    "/",
                    "/index.html",
                    "/css/portal.css",
                    "/css/mural.css",
                    "/js/portal.js",
                    "/js/mural.js",
                    "/assets/**",
                    "/favicon.ico"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/minha-conta")
                .permitAll()
            )
            .logout(logout -> logout.logoutSuccessUrl("/"));

        return http.build();
    }
}
