package br.com.unibus.unibus_app.integration.gtfs;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Propriedades do arquivo GTFS {@code routes.txt} (mapeamento linha → extremidades da rota).
 */
@ConfigurationProperties(prefix = "unibus.gtfs.routes")
public class GtfsRoutesProperties {

    /**
     * Caminho do CSV no classpath (colunas: route_short_name, route_long_name, …).
     */
    private String classpathLocation = "classpath:data/gtfs/routes.txt";

    public String getClasspathLocation() {
        return classpathLocation;
    }

    public void setClasspathLocation(String classpathLocation) {
        this.classpathLocation = classpathLocation;
    }
}
