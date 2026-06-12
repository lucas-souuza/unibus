package br.com.unibus.unibus_app.integration.gtfs;

import br.com.unibus.unibus_app.integration.gtfs.dto.GtfsTrip;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Component
public class GtfsTripsLoader {

    private static final int COL_ROUTE_ID = 0;
    private static final int COL_SERVICE_ID = 1;
    private static final int COL_TRIP_ID = 2;
    private static final int COL_TRIP_HEADSIGN = 3;
    private static final int COL_SHAPE_ID = 7;
    private static final int MIN_COLUNAS = 8;

    private final ResourceLoader resourceLoader;
    private final GtfsTripsProperties properties;

    public GtfsTripsLoader(ResourceLoader resourceLoader, GtfsTripsProperties properties) {
        this.resourceLoader = resourceLoader;
        this.properties = properties;
    }

    List<GtfsTrip> carregar() {
        Resource resource = resourceLoader.getResource(properties.getClasspathLocation());
        List<GtfsTrip> trips = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {

            String linhaArquivo;
            boolean cabecalhoIgnorado = false;

            while ((linhaArquivo = reader.readLine()) != null) {
                if (linhaArquivo.isBlank()) {
                    continue;
                }
                if (!cabecalhoIgnorado) {
                    cabecalhoIgnorado = true;
                    continue;
                }

                String[] colunas = linhaArquivo.split(",", -1);
                if (colunas.length < MIN_COLUNAS) {
                    continue;
                }

                String routeId = colunas[COL_ROUTE_ID].trim();
                String serviceId = colunas[COL_SERVICE_ID].trim();
                String tripId = colunas[COL_TRIP_ID].trim();
                String tripHeadsign = colunas[COL_TRIP_HEADSIGN].trim();
                String directionId = colunas[COL_TRIP_HEADSIGN].trim();

                String shapeId = colunas[COL_SHAPE_ID].trim();

                if (routeId.isEmpty() || tripId.isEmpty()) {
                    continue;
                }

                trips.add(new GtfsTrip(
                        routeId,
                        serviceId,
                        tripId,
                        tripHeadsign,
                        directionId,
                        shapeId
                ));
            }
        } catch (IOException ex) {
            throw new GtfsRoutesException(
                    "Falha ao ler arquivo GTFS trips: " + properties.getClasspathLocation(), ex);
        }

        return List.copyOf(trips);
    }
}