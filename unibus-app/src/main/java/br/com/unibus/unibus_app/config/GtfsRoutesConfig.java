package br.com.unibus.unibus_app.config;

import br.com.unibus.unibus_app.integration.gtfs.GtfsRoutesProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Habilita propriedades do GTFS {@code routes.txt} (mapeamento linha → route_long_name).
 */
@Configuration
@EnableConfigurationProperties(GtfsRoutesProperties.class)
public class GtfsRoutesConfig {
}
