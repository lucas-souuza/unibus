package br.com.unibus.unibus_app.dto;

/**
 * Posição de ônibus exposta ao frontend (GPS SPPO + rota GTFS).
 */
public record OnibusPosicaoResponse(
        String ordem,
        String linha,
        double latitude,
        double longitude,
        String pontoPartida,
        String pontoFinal,
        String routeLongName,
        String velocidade
) {
}
