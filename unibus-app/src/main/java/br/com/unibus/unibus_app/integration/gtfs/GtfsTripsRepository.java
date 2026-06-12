package br.com.unibus.unibus_app.integration.gtfs;

import br.com.unibus.unibus_app.integration.gtfs.dto.GtfsTrip;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class GtfsTripsRepository {

    private final GtfsTripsLoader loader;
    private List<GtfsTrip> trips = List.of();

    public GtfsTripsRepository(GtfsTripsLoader loader) {
        this.loader = loader;
    }

    @PostConstruct
    void inicializar() {
        this.trips = loader.carregar();
    }

    public List<GtfsTrip> buscarPorRouteId(String routeId) {
        if (routeId == null || routeId.isBlank()) {
            return List.of();
        }

        return trips.stream()
                .filter(t -> routeId.equals(t.routeId()))
                .toList();
    }
}