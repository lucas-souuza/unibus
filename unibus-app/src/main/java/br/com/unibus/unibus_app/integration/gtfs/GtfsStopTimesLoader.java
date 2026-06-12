package br.com.unibus.unibus_app.integration.gtfs;

import br.com.unibus.unibus_app.integration.gtfs.dto.GtfsStopTime;
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
public class GtfsStopTimesLoader {

    private static final int COL_TRIP_ID = 0;
    private static final int COL_ARRIVAL_TIME = 1;
    private static final int COL_DEPARTURE_TIME = 2;
    private static final int COL_STOP_ID = 3;
    private static final int COL_STOP_SEQUENCE = 4;
    private static final int MIN_COLUNAS = 5;

    private final ResourceLoader resourceLoader;
    private final GtfsStopTimesProperties properties;

    public GtfsStopTimesLoader(ResourceLoader resourceLoader, GtfsStopTimesProperties properties) {
        this.resourceLoader = resourceLoader;
        this.properties = properties;
    }

    List<GtfsStopTime> carregar() {
        Resource resource = resourceLoader.getResource(properties.getClasspathLocation());
        List<GtfsStopTime> stopTimes = new ArrayList<>();

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

                String tripId = colunas[COL_TRIP_ID].trim();
                String arrivalTime = colunas[COL_ARRIVAL_TIME].trim();
                String departureTime = colunas[COL_DEPARTURE_TIME].trim();
                String stopId = colunas[COL_STOP_ID].trim();
                int stopSequence = parseIntSeguro(colunas[COL_STOP_SEQUENCE].trim());

                if (tripId.isEmpty()) {
                    continue;
                }

                stopTimes.add(new GtfsStopTime(
                        tripId,
                        arrivalTime,
                        departureTime,
                        stopId,
                        stopSequence
                ));
            }
        } catch (IOException ex) {
            throw new GtfsRoutesException(
                    "Falha ao ler arquivo GTFS stop_times: " + properties.getClasspathLocation(), ex);
        }

        return List.copyOf(stopTimes);
    }

    private int parseIntSeguro(String valor) {
        try {
            return Integer.parseInt(valor);
        } catch (Exception ex) {
            return Integer.MAX_VALUE;
        }
    }
}