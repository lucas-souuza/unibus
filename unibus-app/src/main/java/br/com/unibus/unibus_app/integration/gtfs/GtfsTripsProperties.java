package br.com.unibus.unibus_app.integration.gtfs;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "unibus.gtfs.trips")
public class GtfsTripsProperties {

    private String classpathLocation = "classpath:data/gtfs/trips.txt";

    public String getClasspathLocation() {
        return classpathLocation;
    }

    public void setClasspathLocation(String classpathLocation) {
        this.classpathLocation = classpathLocation;
    }
}