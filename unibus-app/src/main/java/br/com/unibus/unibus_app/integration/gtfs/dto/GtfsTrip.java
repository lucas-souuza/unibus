package br.com.unibus.unibus_app.integration.gtfs.dto;

public record GtfsTrip(
        String routeId,
        String serviceId,
        String tripId,
        String tripHeadsign,
        String directionId,   // "0" (ida) ou "1" (volta) — pode ser null/vazio no GTFS
        String shapeId
) {
}