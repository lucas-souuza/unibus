package br.com.unibus.unibus_app.integration.gtfs;

import br.com.unibus.unibus_app.integration.gtfs.dto.GtfsStopTime;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Repository;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
public class GtfsStopTimesRepository {

    private final GtfsStopTimesLoader loader;
    private Map<String, List<GtfsStopTime>> indicePorTripId = Map.of();

    public GtfsStopTimesRepository(GtfsStopTimesLoader loader) {
        this.loader = loader;
    }

    @PostConstruct
    void inicializar() {
        this.indicePorTripId = loader.carregar().stream()
                .collect(Collectors.groupingBy(GtfsStopTime::tripId));
    }

    public List<GtfsStopTime> buscarPorTripId(String tripId) {
        return indicePorTripId.getOrDefault(tripId, List.of())
                .stream()
                .sorted(Comparator.comparingInt(GtfsStopTime::stopSequence))
                .toList();
    }
}