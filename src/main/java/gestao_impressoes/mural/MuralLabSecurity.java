package gestao_impressoes.mural;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@Profile("mural-lab")
public class MuralLabSecurity {
    @Bean
    public UserDetailsService muralLabUsers(
            @Value("${MURAL_LAB_RESPONSAVEL_PASSWORD:}") String responsavel,
            @Value("${MURAL_LAB_COLABORADOR_PASSWORD:}") String colaborador,
            @Value("${MURAL_LAB_LEITOR_PASSWORD:}") String leitor) {
        if (responsavel.isBlank() || colaborador.isBlank() || leitor.isBlank()) {
            throw new IllegalStateException("Configure as tres variaveis MURAL_LAB_*_PASSWORD antes de ativar mural-lab.");
        }
        PasswordEncoder encoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();
        return new InMemoryUserDetailsManager(
            User.withUsername("responsavel-lab").password(encoder.encode(responsavel)).roles("RESPONSAVEL").build(),
            User.withUsername("colaborador-lab").password(encoder.encode(colaborador)).roles("COLABORADOR").build(),
            User.withUsername("leitor-lab").password(encoder.encode(leitor)).roles("LEITOR").build()
        );
    }

    @Bean
    @Order(0)
    public SecurityFilterChain muralLabApi(HttpSecurity http, UserDetailsService muralLabUsers) throws Exception {
        http.securityMatcher("/api/laboratorio/mural/**")
            // HTTP Basic com acesso restrito a loopback, sem cookies/sessão para essa API.
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(
                org.springframework.security.config.http.SessionCreationPolicy.STATELESS))
            .userDetailsService(muralLabUsers)
            .httpBasic(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.GET, "/api/laboratorio/mural/posts").hasAnyRole("LEITOR", "COLABORADOR", "RESPONSAVEL")
                .requestMatchers(HttpMethod.POST, "/api/laboratorio/mural/posts").hasRole("RESPONSAVEL")
                .requestMatchers(HttpMethod.POST, "/api/laboratorio/mural/posts/*/comments").hasAnyRole("COLABORADOR", "RESPONSAVEL")
                .requestMatchers(HttpMethod.PATCH, "/api/laboratorio/mural/posts/*/comments/*/hidden").hasRole("RESPONSAVEL")
                .requestMatchers(HttpMethod.DELETE, "/api/laboratorio/mural/posts/*").hasRole("RESPONSAVEL")
                .anyRequest().denyAll()
            );
        return http.build();
    }
}
