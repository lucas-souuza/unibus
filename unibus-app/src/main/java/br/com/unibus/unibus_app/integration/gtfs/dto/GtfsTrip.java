package br.com.unibus.unibus_app.integration.gtfs.dto;

public record GtfsTrip(
        String routeId,
        String serviceId,
        String tripId,
        String tripHeadsign,
        String shapeId
) {
}