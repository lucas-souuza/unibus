package br.com.unibus.unibus_app.integration.gtfs;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "unibus.gtfs.stop-times")
public class GtfsStopTimesProperties {

    private String classpathLocation = "classpath:data/gtfs/stop_times.txt";

    public String getClasspathLocation() {
        return classpathLocation;
    }

    public void setClasspathLocation(String classpathLocation) {
        this.classpathLocation = classpathLocation;
    }
}