package br.com.unibus.unibus_app.config;

import br.com.unibus.unibus_app.integration.gtfs.GtfsRoutesProperties;
import br.com.unibus.unibus_app.integration.gtfs.GtfsStopTimesProperties;
import br.com.unibus.unibus_app.integration.gtfs.GtfsTripsProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({
        GtfsRoutesProperties.class,
        GtfsTripsProperties.class,
        GtfsStopTimesProperties.class
})
public class GtfsRoutesConfig {
}