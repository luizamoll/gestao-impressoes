package gestao_impressoes;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.SecurityFilterChain;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            .authorizeHttpRequests(auth -> auth
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
    .permitAll()
);

        return http.build();
    }
}
