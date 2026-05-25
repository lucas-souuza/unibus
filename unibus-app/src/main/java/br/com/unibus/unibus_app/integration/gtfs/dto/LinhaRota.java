package br.com.unibus.unibus_app.integration.gtfs.dto;

/**
 * Dados de uma linha derivados do GTFS {@code routes.txt}, alinhados ao campo {@code linha} da API SPPO.
 * Exemplo (linha 636): pontoPartida = Merck, pontoFinal = Saens Peña.
 */
public record LinhaRota(
        String linha,
        String pontoPartida,
        String pontoFinal,
        String routeLongName,
        String routeId
) {
}
