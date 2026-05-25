package br.com.unibus.unibus_app.util;

/**
 * Converte coordenadas da API SPPO (vírgula como separador decimal) para {@code double}.
 */
public final class SppoCoordinateParser {

    private SppoCoordinateParser() {
    }

    public static double parse(String valor) {
        if (valor == null || valor.isBlank()) {
            throw new IllegalArgumentException("Coordenada ausente");
        }
        return Double.parseDouble(valor.trim().replace(',', '.'));
    }
}
