package br.com.unibus.unibus_app.integration.gtfs.dto;

public record GtfsStopTime(
        String tripId,
        String arrivalTime,
        String departureTime,
        String stopId,
        int stopSequence
) {
}