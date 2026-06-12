package br.com.unibus.unibus_app.dto;

import java.util.List;

public record HorarioItinerarioResponse(
        String itinerario,
        List<String> horarios
) {
}