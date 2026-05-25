package br.com.unibus.unibus_app.integration.gtfs;

/**
 * Interpreta {@code route_long_name} do GTFS no formato "Origem - Destino".
 */
final class RouteLongNameParser {

    private static final String SEPARADOR_EXTREMIDADES = " - ";

    private RouteLongNameParser() {
    }

    static ParsedRouteLongName parse(String routeLongName) {
        if (routeLongName == null || routeLongName.isBlank()) {
            return new ParsedRouteLongName("", "");
        }

        String normalizado = routeLongName.trim();
        int separador = normalizado.indexOf(SEPARADOR_EXTREMIDADES);
        if (separador < 0) {
            return new ParsedRouteLongName(normalizado, "");
        }

        String pontoPartida = normalizado.substring(0, separador).trim();
        String pontoFinal = normalizado.substring(separador + SEPARADOR_EXTREMIDADES.length()).trim();
        return new ParsedRouteLongName(pontoPartida, pontoFinal);
    }

    record ParsedRouteLongName(String pontoPartida, String pontoFinal) {
    }
}
