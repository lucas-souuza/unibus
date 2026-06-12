package br.com.unibus.unibus_app.dto;

import java.util.List;

public record HorariosLinhaResponse(
        String linha,
        String nomeLinha,
        String origem,
        String destino,
        List<HorarioItinerarioResponse> itinerarios
) {
}