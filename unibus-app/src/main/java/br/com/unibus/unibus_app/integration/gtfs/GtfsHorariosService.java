package br.com.unibus.unibus_app.integration.gtfs;

import br.com.unibus.unibus_app.dto.HorarioItinerarioResponse;
import br.com.unibus.unibus_app.dto.HorariosLinhaResponse;
import br.com.unibus.unibus_app.integration.gtfs.dto.GtfsStopTime;
import br.com.unibus.unibus_app.integration.gtfs.dto.GtfsTrip;
import br.com.unibus.unibus_app.integration.gtfs.dto.LinhaRota;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class GtfsHorariosService {

    private final GtfsRoutesService routesService;
    private final GtfsTripsRepository tripsRepository;
    private final GtfsStopTimesRepository stopTimesRepository;

    public GtfsHorariosService(
            GtfsRoutesService routesService,
            GtfsTripsRepository tripsRepository,
            GtfsStopTimesRepository stopTimesRepository
    ) {
        this.routesService = routesService;
        this.tripsRepository = tripsRepository;
        this.stopTimesRepository = stopTimesRepository;
    }

    public HorariosLinhaResponse buscarHorariosPorLinha(String numeroLinha) {
        LinhaRota linhaRota = routesService.buscarPorLinha(numeroLinha)
                .orElseThrow(() -> new RuntimeException("Linha não encontrada no GTFS: " + numeroLinha));

        List<GtfsTrip> trips = tripsRepository.buscarPorRouteId(linhaRota.routeId());

        Map<String, List<String>> horariosPorItinerario = new LinkedHashMap<>();

        for (GtfsTrip trip : trips) {
            String itinerario = normalizarItinerario(trip.tripHeadsign(), linhaRota);
            String primeiroHorario = buscarPrimeiroHorario(trip.tripId());

            if (primeiroHorario == null || primeiroHorario.isBlank()) {
                continue;
            }

            horariosPorItinerario
                    .computeIfAbsent(itinerario, k -> new java.util.ArrayList<>())
                    .add(primeiroHorario);
        }

        List<HorarioItinerarioResponse> itinerarios = horariosPorItinerario.entrySet().stream()
                .map(entry -> new HorarioItinerarioResponse(
                        entry.getKey(),
                        entry.getValue().stream()
                                .distinct()
                                .sorted(this::compararHorarioGtfs)
                                .limit(12)
                                .toList()
                ))
                .filter(item -> !item.horarios().isEmpty())
                .sorted(Comparator.comparing(HorarioItinerarioResponse::itinerario))
                .toList();

        return new HorariosLinhaResponse(
                linhaRota.linha(),
                linhaRota.routeLongName(),
                linhaRota.pontoPartida(),
                linhaRota.pontoFinal(),
                itinerarios
        );
    }

    private String buscarPrimeiroHorario(String tripId) {
        List<GtfsStopTime> stopTimes = stopTimesRepository.buscarPorTripId(tripId);
        if (stopTimes.isEmpty()) {
            return null;
        }

        GtfsStopTime primeiro = stopTimes.get(0);
        if (primeiro.departureTime() != null && !primeiro.departureTime().isBlank()) {
            return primeiro.departureTime();
        }
        return primeiro.arrivalTime();
    }

    private String normalizarItinerario(String tripHeadsign, LinhaRota linhaRota) {
        if (tripHeadsign != null && !tripHeadsign.isBlank()) {
            return tripHeadsign.trim();
        }
        if (linhaRota.pontoFinal() != null && !linhaRota.pontoFinal().isBlank()) {
            return linhaRota.pontoFinal().trim();
        }
        return "Itinerário principal";
    }

    private int compararHorarioGtfs(String a, String b) {
        return converterHorarioParaMinutos(a) - converterHorarioParaMinutos(b);
    }

    private int converterHorarioParaMinutos(String horario) {
        try {
            String[] partes = horario.split(":");
            int horas = Integer.parseInt(partes[0]);
            int minutos = Integer.parseInt(partes[1]);
            return horas * 60 + minutos;
        } catch (Exception ex) {
            return Integer.MAX_VALUE;
        }
    }
}