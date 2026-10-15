package gestao_impressoes.perseus;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

/** Sem endpoints publicos. Desativado ate a autenticacao institucional. */
@Configuration(proxyBeanMethods = false)
class PerseusIntegrationConfiguration {
    @Bean
    @ConditionalOnProperty(name = "perseus.integration.enabled", havingValue = "true")
    PerseusInternalClient clientePerseus(Environment environment) {
        return new PerseusInternalClient(
            "http://127.0.0.1:8879",
            environment.getProperty("PERSEUS_SERVICE_KEY", "")
        );
    }
}
