package br.com.unibus.unibus_app.config;

import br.com.unibus.unibus_app.integration.sppo.SppoGpsProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

/**
 * Beans e propriedades da integração com a API SPPO GPS (dados.mobilidade.rio).
 */
@Configuration
@EnableConfigurationProperties(SppoGpsProperties.class)
public class SppoGpsConfig {

    @Bean(name = "sppoRestClient")
    public RestClient sppoRestClient(SppoGpsProperties properties) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(properties.getConnectTimeoutMs());
        requestFactory.setReadTimeout(properties.getReadTimeoutMs());

        return RestClient.builder()
                .baseUrl(properties.getBaseUrl())
                .requestFactory(requestFactory)
                .build();
    }
}
